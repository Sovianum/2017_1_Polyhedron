'use strict';

import {Triangle} from '../geometry_shapes/triangle';
import {GameComponent} from '../base/game_component';
import {getIdGenerator} from '../../../common/id_generator';
import {Ball} from "./ball";
import {PolygonObstacle} from "../base/collision_handling";
import {Line} from "../geometry_shapes/line";
import {Drawable, Rectangular} from "../drawing/interfaces";
import {specificToCanvasCS} from "../drawing/canvas_transform";
import {Point, Vector} from "../base/common";
import * as math from '../../../_lib/math';


export class TriangleField extends GameComponent implements Drawable, PolygonObstacle {
    private static idGenerator = getIdGenerator();
    private _triangle: Triangle;
    private _isNeutral: boolean;
    private _isLoser: boolean;
    private _id: number;

    constructor(height: number, sectorAngle: number, isNeutral: boolean) {
        super();
        this._triangle = new Triangle(height, sectorAngle);
        this._isNeutral = isNeutral;
        this._isLoser = false;

        this._id = TriangleField.idGenerator();
    }

    public contains(point: number[]): boolean {
        return this._triangle.contains(this.toLocals(point));
    }

    public get height(): number {
        return this._triangle.height;
    }

    public get halfWidth(): number {
        return this._triangle.halfWidth;
    }

    public get id(): number {
        return this._id;
    }

    public get shape(): Triangle {
        return this._triangle;
    }

    public getPointArray(): number[][] {
        return this._triangle.getPointArray().map(point => this.toGlobals(point));
    }

    public getBottomNorm(): number[] {
        return this.toGlobalsWithoutOffset([0, 1]);
    }

    public isNeutral(): boolean {
        return this._isNeutral;
    }

    public setNeutral(isNeutral: boolean) {
        this._isNeutral = isNeutral;
    }

    public isLoser(): boolean {
        return this._isLoser;
    }

    public setLoser(isLoser: boolean = true) {
        this._isLoser = isLoser;
    }

    public containsGlobalPoint(point: number[]): boolean {
        return this._triangle.contains(this.toLocals(point));
    }

    public containsLocalPoint(point: number[]): boolean {
        return this._triangle.contains(point);
    }

    public isInSector(globalPoint: number[]): boolean {
        return this._triangle.isInSector(this.toLocals(globalPoint));
    }

    public reachesBottomLevel(ball: Ball): boolean {
        const localBallPosition = this.toLocals(ball.position);
        const ballRadius = ball.radius;

        return this._triangle.getBottomDistance(localBallPosition) < ballRadius;
    }

    public getWidthOnDistance(bottomDistance: number): number {
        return this._triangle.getWidthOnDistance(bottomDistance);
    }

    public getWidthOnRelativeDistance(relativeDistance: number): number {
        return this._triangle.getWidthOnDistance(relativeDistance * this._triangle.height);
    }

    public getClosestPoint(origin: Point): Point {
        if (!this.checkFieldEscape(origin)) {
            const localBasePoints = this.shape.getBasePoints();
            const globalBasePoints = localBasePoints.map(point => this.toGlobals(point));
            const baseLine = new Line(globalBasePoints[0], globalBasePoints[1]);
            return baseLine.getClosestPoint(origin);
        } else {
            return origin;
        }
    }

    public getNormDirection(collisionPoint: Point, colliderPosition: Point): Vector {
        return this.toGlobalsWithoutOffset([0, 1]);
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

            let fillStyle = null;
            if (this.isNeutral()) {
                fillStyle = 'white';
            } else if (this.isLoser()) {
                fillStyle = 'blue';
            } else {
                fillStyle = 'red';
            }
            context.fillStyle = fillStyle;
            context.fill();
            context.lineWidth = 1;
            context.stroke();
        };
    }

    private checkFieldEscape(globalPoint: Point): boolean {
        const localPoint = this.toLocals(globalPoint);
        return !this._triangle.contains(localPoint) && this._triangle.isInSector(localPoint);
    }
}
