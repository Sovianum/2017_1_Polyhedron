'use strict';

import {Point, Vector} from "../base/common";


export interface BallState {
    position: Point;
    velocity: Vector;
}


export interface PlatformState {
    position: Point;
    angle: number;
    velocity: Vector;
    active: boolean;
}


export interface GameWorldState {
    ballState: BallState;
    platformsState: PlatformState[];
}


export interface GetReady {
    playerNames: string[];
}
