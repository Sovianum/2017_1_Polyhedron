
import * as math from '../../../_lib/math';

import {Ball} from '../game_components/ball';
import {Platform} from '../game_components/platform';
import {TriangleField} from '../game_components/triangle_field';

import * as events from '../event_system/events';
import {GameComponent} from "../base/game_component";
import {EventBus} from "../event_system/event_bus";
import {Autowired, Load} from "../experimental/decorators";
import {getNearestCollisionMultiObstacle} from "../base/collision_handling";
import {GameWorldState, PlatformState} from "../event_system/messages";
import {Stateful} from "../experimental/interfaces";
import {Drawable, Rectangular} from "../drawing/interfaces";
import {platformFromTriangleField} from "../game_components/helper_functions";
import {ClientRuledStateQueue, ServerRuledStateQueue} from "../ping_correction/state_queue";
import {interpGameWorldState} from "../ping_correction/state_interpolation";


export class GameWorld implements Drawable, Stateful<GameWorldState> {
    @Autowired(EventBus)
    private eventBus: EventBus;

    private _userNum: number;
    private _sectorAngle: number;
    private _sectorHeight: number;
    private _ballRadius: number;
    private _position: number[];
    private _userSectors: TriangleField[];
    private _neutralSectors: TriangleField[];
    private _platforms: Platform[];
    private _ball: Ball;
    private _score: number;
    @Load('game')
    private _gameConfig;

    private _lastCollidedObject: GameComponent = null;
    // private _stateQueue: ClientRuledStateQueue<GameWorldState>;
    private _stateQueue: ServerRuledStateQueue<GameWorldState>;

    constructor(userNum: number, sectorHeight: number, ballRadius: number, position: number[] = [0, 0]) {
        this._userNum = userNum;
        this._sectorAngle = Math.PI / userNum;
        this._sectorHeight = sectorHeight;
        this._ballRadius = ballRadius;
        this._position = position;

        this._userSectors = [];
        this._neutralSectors = [];
        this._platforms = [];
        this._ball = null;
        // this._stateQueue = new ClientRuledStateQueue<GameWorldState>(this._gameConfig.minQueueSize, interpGameWorldState);
        this._stateQueue = new ServerRuledStateQueue<GameWorldState>(this._gameConfig.minQueueSize, interpGameWorldState);

        this._score = 0; // TODO only for pretest

        this._initSectors();
        this._initBall();
        this._initPlatforms();
    }

    public incrementScore() {
        ++this._score;
    }

    public getState(): GameWorldState {
        return {
            ballState: this._ball.getState(),
            platformsState: this._platforms.map(platform => platform.getState())
        };
    }

    public setState(state: GameWorldState) {
        this._ball.setState(state.ballState);

        state.platformsState
            .sort((left, right) => left.angle - right.angle)
            .forEach((data, index) => {
            this._platforms[index].setState(data);
        });
    }

    // public addSnapshot(state: GameWorldState) {
    //     this._stateQueue.addState(state);
    // }

    public addSnapshot(state: GameWorldState, timestamp: number) {
        this._stateQueue.addState(state, timestamp);
    }

    public get ball(): Ball {
        return this._ball;
    }

    public get userSectors(): TriangleField[] {
        return this._userSectors;
    }

    public get neutralSectors(): TriangleField[] {
        return this._neutralSectors;
    }

    public get platforms(): Platform[] {
        return this._platforms;
    }

    public getDrawing() {
        return (canvas, initialRectangle?: Rectangular) => {
            (this._userSectors as Drawable[])
                .concat(this._neutralSectors, this._platforms, [this._ball])
                .map(drawable => drawable.getDrawing())
                .forEach(draw => draw(canvas, initialRectangle));

            this._writeScore(canvas);
        };
    }

    public movePlatform(platform, localOffsetVector, velocityVector?) {
        const globalOffset = platform.toGlobalsWithoutOffset(localOffsetVector);
        platform.moveByWithConstraints(globalOffset, velocityVector);
    }

    public makeMultiPlayerIteration(time: number) {
        const now = Date.now();
        const interpState = this._stateQueue.getInterpState(now);
        if (interpState) {
            // this.setState(interpState);
            // const temp = this._platforms[0].getState();
            // this.setState(this._stateQueue.getLastState()); // TODO get rid of this trick
            // this._platforms[0].setState(temp);
            // this._ball.setState(interpState.ballState);

            const temp = this._platforms[0].getState();
            this.setState(interpState);
            this._platforms[0].setState(temp); // TODO get rid of this trick
        } else {
            this.makeSinglePlayerIteration(time);
        }
    }

    public makeSinglePlayerIteration(time: number) {
        let restTime = time;
        let updateTime = this._innerMakeSinglePLayerIteration(restTime);
        while (updateTime) {
            restTime -= updateTime;
            if (restTime === 0) {
                break;
            }

            updateTime = this._innerMakeSinglePLayerIteration(restTime);
        }
    }

    private _innerMakeSinglePLayerIteration(time) {
        const platformCollision = getNearestCollisionMultiObstacle(
            this.ball, this.platforms, 0, time, this.ball.radius / this._gameConfig.platformCollisionAccuracy
        );
        const userSectorCollision = getNearestCollisionMultiObstacle(
            this.ball, this.userSectors, 0, time, this.ball.radius / this._gameConfig.sectorCollisionAccuracy
        );
        const neutralSectorCollision = getNearestCollisionMultiObstacle(
            this.ball, this.neutralSectors, 0, time, this.ball.radius / this._gameConfig.sectorCollisionAccuracy
        );

        const firstCollisionData = [
            {
                collision: platformCollision,
                tag: 'platform'
            },
            {
                collision: userSectorCollision,
                tag: 'userSector'
            },
            {
                collision: neutralSectorCollision,
                tag: 'neutralSector'
            }
        ]
            .filter(({collision}) => collision)
            .sort((data1, data2) => data1.collision.time - data2.collision.time)[0];

        if (firstCollisionData) {
            this.ball.moveBy(math.multiply(this.ball.velocity, firstCollisionData.collision.time));

            if (firstCollisionData.tag === 'platform') {
                this._handlePlatformCollision(
                    firstCollisionData.collision.obstacle,
                    this.ball,
                    firstCollisionData.collision.direction
                );
            } else if (firstCollisionData.tag === 'userSector') {
                this._handleUserSectorCollision(firstCollisionData.collision.obstacle, this.ball);
            } else if (firstCollisionData.tag === 'neutralSector') {
                this._handleNeutralSectorCollision(firstCollisionData.collision.obstacle, this.ball);
            }

            return firstCollisionData.collision.time;
        }

        this.ball.moveBy(math.multiply(this.ball.velocity, time));
        return null;
    }

    private _initSectors() {
        for (let i = 0; i !== this._userNum; ++i) {
            const userSector = new TriangleField(this._sectorHeight, this._sectorAngle, false);
            userSector.rotateBy(2 * this._sectorAngle * i);
            userSector.moveTo(this._position);

            const neutralSector = new TriangleField(this._sectorHeight, this._sectorAngle, true);
            neutralSector.rotateBy(this._sectorAngle * (2 * i + 1));
            neutralSector.moveTo(this._position);

            this._userSectors.push(userSector);
            this._neutralSectors.push(neutralSector);
        }
    }

    private _initPlatforms() {
        this._platforms = this._userSectors.map(sector => platformFromTriangleField(sector));
    }

    private _initBall() {
        this._ball = new Ball(this._ballRadius);
        this._ball.moveTo(this._position);
    }

    private _handleUserSectorCollision(sector: TriangleField, ball: Ball) {
        if (sector !== this._lastCollidedObject) {
            ball.bounceNorm(sector.getBottomNorm());
            this._lastCollidedObject = sector;

            this.eventBus.dispatchEvent(events.gameEvents.ClientDefeatEvent.create(sector.id));
        }
    }

    private _handleNeutralSectorCollision(sector, ball) {
        if (sector !== this._lastCollidedObject) {
            ball.bounceNorm(sector.getBottomNorm());
            this._lastCollidedObject = sector;
        }
    }

    private _handlePlatformCollision(platform, ball, norm) {
        if (platform !== this._lastCollidedObject) {
            ball.bounceNorm(norm, platform.velocity);
            this._lastCollidedObject = platform;

            this.eventBus.dispatchEvent(events.gameEvents.BallBounced.create(platform.id));
        }
    }

    private _writeScore(canvas) {
        const context = canvas.getContext('2d');
        context.font = '30px Arial';
        context.textAlign = "center";
        context.fillStyle = "white";

        const message = "Мячей отбито: " + this._score;
        context.fillText(message, canvas.width * 0.5, canvas.height);
    }
}
