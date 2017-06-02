
import * as math from '../../../_lib/math';
import * as events from '../event_system/events';
import {GameWorld} from './game_world';
import {Bot} from '../ai/bot';
import {GameComponent} from "../base/game_component";
import {EventBus} from "../event_system/event_bus";
import {Autowired, Load} from "../experimental/decorators";
import {Application} from "../experimental/application";
import {ServerCommunicator} from "../network/server_communicator";
import {clientSideServices, serverSideServices} from "../../configs/services";
import {gameEvents, networkEvents, serviceEvents} from "../event_system/events";
import TestWorldUpdateEvent = networkEvents.WorldUpdateEvent;
import DrawEvent = gameEvents.DrawEvent;
import {Rectangular} from "../drawing/interfaces";
import {getByCircularIndex, Point, Vector} from "../base/common";
import {Platform} from "../game_components/platform";
import {TriangleField} from "../game_components/triangle_field";
import RenderPageEvent = serviceEvents.RenderPageEvent;
import {combinePlatformUpdates, GameWorldState, PlatformUpdate, resetPlatformUpdate} from "../event_system/messages";
import GameStartEvent = networkEvents.GameStartEvent;
import PlatformMovedEvent = gameEvents.PlatformMovedEvent;
import {specificToCanvasCS} from "../drawing/canvas_transform";


const GAME_OVER_PAGE_URL = '/gameover';

const MODES = {
    single: 'single',
    multi: 'multi',
    server: 'server'
};


const ALERT_SELECTOR = '.js-alert';

export class Game {
    @Autowired(EventBus)
    private eventBus: EventBus;

    @Load('game')
    private _gameConfig: any;

    private _field: Rectangular;

    private _alert: Element;

    private _platformVelocityDirection: number[] = [0, 0];

    private _gameUpdaterId: number;
    private _offsetTransmitterId: number;
    private _lastPlatformPosition: number[];
    private _mode: string;

    private _bots: Bot[];
    private _world: GameWorld;

    private _running: boolean;
    private _nicknames: string[];

    private _actualUpdate: PlatformUpdate;
    private _updateFlag: boolean;

    constructor(mode, nicknames?: string[]) {
        this._field = {
            height: this._gameConfig.fieldSize,
            width: this._gameConfig.fieldSize
        };
        this._alert = document.querySelector(ALERT_SELECTOR);

        this._gameUpdaterId = null;
        this._lastPlatformPosition = null;
        this._mode = mode;
        this._running = false;

        if (!nicknames) {
            if (mode === MODES.single) {
                this._nicknames = ["You", "Bot 1", "Bot 2", "Bot 3"];
            } else {
                this._nicknames = [];
            }
        } else {
            this._nicknames = nicknames;
        }

        this._actualUpdate = {offset: [0, 0], velocity: [0, 0]};

    }

    public init() {
        this._initWorld();
        this._redraw();
        this._setListeners();

        if (this._mode === MODES.single) {
            this._createBots();
        }
    }

    public start() {
        this._running = true;
        this._gameUpdaterId = setInterval(() => this._makeIteration(this._gameConfig.time), this._gameConfig.time);
        if (this._mode === MODES.multi) {
            this._offsetTransmitterId = setInterval(() => this._transmitPlatformUpdate(), this._gameConfig.updateTime);
        }
    }

    public stop() {
        this._running = false;
        clearInterval(this._gameUpdaterId);
    }

    public continueGame() {
        this._running = true;
        this._gameUpdaterId = setInterval(() => this._makeIteration(this._gameConfig.time), this._gameConfig.time);
    }

    public getWorldState(): GameWorldState {
        return this._world.getState();
    }

    public getPlatformByIndex(index): Platform {
        return getByCircularIndex(this._world.platforms, index);
    }

    private _getUserSectorByIndex(index): TriangleField {
        return getByCircularIndex(this._world.userSectors, index);
    }

    private _getIndexById(id: number, items: any[]) {
        for (let i = 0; i !== items.length; ++i) {
            if (items[i].id === id) {
                return i;
            }
        }

        return null;
    }

    private get _activePlatform() {
        return this._world.platforms[0];
    }

    private get _activeSector() {
        return this._world.userSectors[0];
    }

    private _initWorld() {
        const sectorHeight = this._gameConfig.fieldSize * this._gameConfig.fillFactor / 2;
        const ballRadius = this._gameConfig.ballRelativeRadius * sectorHeight;

        this._world = new GameWorld(this._gameConfig.playersNum, sectorHeight, ballRadius);
        this._world.ball.velocity = this._gameConfig.ballVelocity;

        this._activePlatform.setActive();
        this._lastPlatformPosition = this._activePlatform.position.slice();

        this._redraw();
    }

    private _setListeners() {
        this.eventBus.addEventListener(
            events.networkEvents.WorldUpdateEvent.eventName,
            event => {
                const worldState = event.data.detail;
                worldState.id = event.data.id;
                worldState.timestamp = event.data.timestamp;
                // this._world.setState(event.data.detail);
                this._world.addSnapshot(event.data.detail, event.data.timestamp);
            }
        );

        this.eventBus.addEventListener(
            events.gameEvents.GameTerminationEvent.eventName,
            event => {
                const {success, userIndex, timestamp} = event.data.detail;
                this._handleGameTerminationEvent(success, userIndex, timestamp);
            }
        );

        this.eventBus.addEventListener(
            GameStartEvent.eventName,
            event => {
                this.start();
            }
        );

        this.eventBus.addEventListener(events.networkEvents.DefeatEvent.eventName,
            event => this._handleDefeatEvent(event));

        this.eventBus.addEventListener(
            events.gameEvents.ClientDefeatEvent.eventName,
            event => this._handleClientDefeatEvent(event)
        );

        this.eventBus.addEventListener(
            events.controllerEvents.ArrowDirectionEvent.eventName,
            event => this._platformVelocityDirection = event.detail
        );

        this.eventBus.addEventListener(events.gameEvents.BallBounced.eventName, event => {
            if (event.detail === this._activePlatform.id) {
                this._world.incrementScore();
            }
        });

        this.eventBus.addEventListener(events.gameEvents.UserSectorCollision.eventName,
            event => this._handleUserSectorCollisionEvent(event));
    }

    private _makeIteration(time) {
        if (this._mode === MODES.single) {
            this._world.makeSinglePlayerIteration(time);
        } else if (this._mode === MODES.multi) {
            const {msElapsed, lastMessageId} = this._world.makeMultiPlayerIteration(time);

            // const activePlatformOffset = math.subtract(this._activePlatform.position, this._lastPlatformPosition);
            // if (math.norm(activePlatformOffset) > this._gameConfig.minimalOffset) {
            //     this._lastPlatformPosition = this._activePlatform.position;
            //     const activePlatformState = this._activePlatform.getState();
            //     activePlatformState.msElapsed = msElapsed;
            //     activePlatformState.lastMessageId = lastMessageId;
            //
            //     this.eventBus.dispatchEvent(PlatformMovedEvent.create(activePlatformState));
            // }
        }

        this._handleUserInput(time);
        this._redraw();
    }

    private _handleUserInput(time: number) {
        const velocity = math.multiply(this._platformVelocityDirection, this._gameConfig.platformVelocity);
        const localOffset = math.multiply(this._platformVelocityDirection, this._gameConfig.platformVelocity * time);

        if (this._mode === MODES.single) {
            this._world.movePlatform(this.getPlatformByIndex(0), localOffset, velocity);
        } else {
            const newUpdate = {offset: localOffset, velocity};
            if (math.norm(newUpdate.offset) > 0.0001) {
                this._updateFlag = true;
            }
            this._actualUpdate = combinePlatformUpdates(this._actualUpdate, newUpdate);
        }
    }

    private _handleDefeatEvent(event) {
        // TODO replace with server-dependent logic
    }

    private _handleClientDefeatEvent(event) {
        if (this._running && this._mode === MODES.single) {
            const isWinner = event.detail !== this._activePlatform.id;

            this.eventBus.dispatchEvent(RenderPageEvent.create({
                url: GAME_OVER_PAGE_URL,
                options: {isWinner}
            }));
            this._running = false;
        }
    }

    private _handleUserSectorCollisionEvent(event) {
        const sectorIndex = this._getIndexById(event.detail, this._world.userSectors);

        if (sectorIndex === 0) {
            if (this._mode === MODES.single) {
                // this.eventBus.dispatchEvent(events.gameEvents.ClientDefeatEvent.create(event.detail));
            }
        } else {
            this._bots[sectorIndex - 1].stop();
            this._getUserSectorByIndex(sectorIndex).setNeutral(true);

            const isWinner = this._world.userSectors.slice(1)
                .map(sector => sector.isNeutral())
                .reduce((curr, next) => curr && next);

            if (isWinner) {
                this.eventBus.dispatchEvent(RenderPageEvent.create({
                    url: GAME_OVER_PAGE_URL,
                    options: {isWinner}
                }));
            }
        }
    }

    private _handleGameTerminationEvent(success: boolean, userIndex: number, timestamp: number) {
        if (userIndex !== 0) {
            this._postponeExecution(
                () => this._world.userSectors[userIndex].setNeutral(true),
                timestamp
            );
        } else {
            this._postponeExecution(
                () => {
                    this.eventBus.dispatchEvent(RenderPageEvent.create({
                        url: GAME_OVER_PAGE_URL,
                        options: {isWinner: success}
                    }));
                },
                timestamp
            );
        }
    }

    private _postponeExecution(callback, timestamp) {
        const serverTime = this._world.getStateQueue().getServerTime(Date.now());
        const timeout = timestamp - serverTime;
        setTimeout(callback, timeout);
    }

    private _transmitPlatformUpdate() {
        const needReset = math.norm(this._actualUpdate.offset) < 0.0001;

        if (this._updateFlag) {
            this.eventBus.dispatchEvent(events.gameEvents.PlatformUpdateEvent.create(this._actualUpdate));
            resetPlatformUpdate(this._actualUpdate);
        }

        if (needReset) {
            this._updateFlag = false;
        }
    }

    private _createBots() {
        this._bots = [1, 2, 3].map(i => new Bot(this.getPlatformByIndex(i), this._world.ball));
    }

    private _drawNicknames(canvas: HTMLCanvasElement) {
        const context = canvas.getContext("2d");
        const heightCoefs = [1.1, 1.05, 1.05, 1.05];
        const nicknamePositions = this._world.userSectors
            .map((sector, index) => sector.toGlobals([0, -sector.height * heightCoefs[index]]));

        context.fillStyle = "white";
        context.font = "20px Arial";
        const alignments = ["center", "start", "center", "end"];
        this._nicknames.forEach((name, index) => {
            const screenPoint = specificToCanvasCS(nicknamePositions[index], canvas, this._field);
            context.textAlign = alignments[index];
            context.fillText(name, screenPoint[0], screenPoint[1]);
        });
    }

    private _redraw() {
        const draw = canvas => {
            const context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);
            this._drawNicknames(canvas);

            this._world.getDrawing()(canvas, this._field);
        };

        const event = DrawEvent.create(draw);
        this.eventBus.dispatchEvent(event);
    }
}


@Application(clientSideServices)
export class ClientSideGame extends Game {}


@Application(serverSideServices)
export class ServerSideGame extends Game {}
