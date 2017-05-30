'use strict';


import {GameComponent} from '../base/game_component';
import {Rectangle} from '../geometry_shapes/rectangle';
import {Line} from '../geometry_shapes/line';
import * as math from '../../../_lib/math';
import {getIdGenerator} from '../../../common/id_generator';
import {Stateful} from "../experimental/interfaces";
import {PolygonObstacle} from "../base/collision_handling";
import {PlatformState} from "../event_system/messages";
import {Drawable, Rectangular} from "../drawing/interfaces";
import {specificToCanvasCS} from "../drawing/canvas_transform";


export class Platform extends GameComponent implements Drawable, PolygonObstacle, Stateful<PlatformState> {
    private static generateId = getIdGenerator();
    public readonly id: number;
    private _rectangle: Rectangle;
    private _isActive: boolean;

    constructor(length, width, isActive = false) {
        super();
        this._rectangle = new Rectangle(length, width);
        this._isActive = isActive;

        this.id = Platform.generateId();
    }

    public getState(): PlatformState {
        return {
            position: this.position,
            angle: this.rotation,
            velocity: [0, 0],
            // velocity: this.velocity,    // TODO uncomment
            active: this.isActive
        };
    }

    public setState(state: PlatformState) {
        this._origin = state.position;
        this._angle = state.angle;
        this._velocity = state.velocity;
        this._isActive = state.active;
    }

    public setActive(isActive: boolean = true) {
        this._isActive = isActive;
    }

    get isActive() {
        return this._isActive;
    }

    public getPointArray() {
        return this._rectangle.getPointArray().map(point => this.toGlobals(point));
    }

    public getLineArray() {
        const pointArray = this._rectangle.getPointArray().map(point => this.toGlobals(point));
        const pointPairArray = pointArray
            .map((point: number[], i: number, arr: number[][]) => [arr[i % arr.length], arr[(i + 1) % arr.length]]);

        return pointPairArray.map(pointPair => new Line(pointPair[0], pointPair[1]));
    }

    public get shape() {
        return this._rectangle;
    }

    public getClosestPoint(origin: number[]) {
        return this.getLineArray()
            .map(line => line.getClosestPoint(origin))
            .map(point => {
                return {
                    point,
                    distance: math.norm(math.subtract(point, origin))
                };
            })
            .sort((obj1, obj2) => obj1.distance - obj2.distance)[0].point;
    }

    public getDrawing() {
        return (canvas, initialRectangle?: Rectangular) => {
            const context = canvas.getContext("2d");
            const points = this.getPointArray()
                .map(point => specificToCanvasCS(point, canvas, initialRectangle));
            context.beginPath();

            context.moveTo(points[0][0], points[0][1]);
            for (let i = 1; i !== points.length; ++i) {
                context.lineTo(points[i][0], points[i][1]);
            }
            context.closePath();

            context.fillStyle = this._isActive ? 'green' : 'blue';
            context.fill();
            context.lineWidth = 1;
            context.stroke();
        };
    }
}
