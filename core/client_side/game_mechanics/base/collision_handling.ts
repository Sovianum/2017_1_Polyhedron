'use strict';

import {SolidBody} from "./solid_body";
import * as math from './../../../_lib/math';
import {Point, Vector} from "./common";


export interface CircleCollider extends SolidBody {
    radius: number;
}


export interface PolygonObstacle extends SolidBody {
    getClosestPoint(origin: Point);
    getNormDirection(collisionPoint: Point, colliderPosition: Point): Vector;
}


export class CollisionInfo {
    public time: number;
    public point: Point;
    public direction: Vector;
    public obstacle: any;

    constructor(time: number, point: Point, direction: Vector) {
        this.time = time;
        this.point = point;
        this.direction = direction;
    }
}


export function getNearestCollisionMultiObstacle(
    collider: CircleCollider,
    obstacles: PolygonObstacle[],
    timeStart: number,
    timeFinish: number,
    maxStep: number
): CollisionInfo {
    const checkPointArrays = obstacles
        .map(obstacle => getCheckPoints(collider, obstacle, timeStart, timeFinish, maxStep));

    const collisions = checkPointArrays
        .map((checkPoints, index) => {
            const collision = getNearestCollisionSingleObstacle(collider, obstacles[index], checkPoints);
            return collision ? {collision, index} : null;
        })
        .filter(result => result)
        .sort(({collision, index}) => collision.time);

    const firstCollision = collisions[0];

    if (!firstCollision) {
        return null;
    } else {
        firstCollision.collision.obstacle = obstacles[firstCollision.index];
        return firstCollision.collision;
    }
}


export function getNearestCollisionSingleObstacle(
    collider: CircleCollider,
    obstacle: PolygonObstacle,
    checkPoints: number[]
): CollisionInfo {
    let result;
    for (const key of Object.keys(checkPoints)) {
        result = getCollision(collider, obstacle, checkPoints[key]);
        if (result) {
            break;
        }
    }

    return result;
}


export function getCollision(
    collider: CircleCollider,
    obstacle: PolygonObstacle,
    time: number
): CollisionInfo {
    const relVelocity = collider.getRelativeVelocity(obstacle);
    const relPosition = math.add(
        collider.position,
        math.multiply(relVelocity, time)
    );
    const closestPoint = obstacle.getClosestPoint(relPosition);
    const distance = math.norm(math.subtract(closestPoint, relPosition));
    const norm = obstacle.getNormDirection(relPosition, closestPoint);

    if (distance <= collider.radius) {
        return new CollisionInfo(time, closestPoint, norm);
    } else {
        return null;
    }
}


function getCheckPoints(
    body1: SolidBody,
    body2: SolidBody,
    timeStart: number,
    timeFinish: number,
    maxStep: number
): number[] {
    const relVelocity = body1.getRelativeVelocity(body2);
    const totalPathLength = math.norm(math.multiply(relVelocity, timeFinish - timeStart));
    return divideTime(totalPathLength, timeStart, timeFinish, maxStep);
}


function divideTime(
    pathLength: number,
    timeStart: number,
    timeFinish: number,
    maxStep: number
): number[] {
    const timeStep = (timeFinish - timeStart) / pathLength * maxStep;
    return arange(timeStart, timeFinish, timeStep);
}


function arange(begin: number, end: number, step: number): number[] {
    const range = end - begin;
    const checkPointNum = Math.floor(range / step);
    const checkPointArray = checkPointNum === 0 ? [] : Array.from(Array(checkPointNum)).map((_, index) => {
        return begin + step * (index + 1);
    });

    const lastElement = checkPointArray[checkPointArray.length - 1];
    if (!lastElement || lastElement < end) {
        checkPointArray.push(end);
    }

    return checkPointArray;
}

