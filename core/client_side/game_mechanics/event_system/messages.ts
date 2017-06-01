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
    lastMessageId?: number;
    msElapsed?: number;
}


export interface GameWorldState {
    ballState: BallState;
    platformsState: PlatformState[];
    id?: number;
    timestamp?: number;
}


export interface GetReady {
    playerNames: string[];
}
