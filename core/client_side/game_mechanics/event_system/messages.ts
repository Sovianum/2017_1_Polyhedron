'use strict';

import {Point, Vector} from "../base/common";
import * as math from "../../../_lib/math";


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

export interface PlatformUpdate {
    offset: Vector;
    velocity: Vector;
}


export function combinePlatformUpdates(update1: PlatformUpdate, update2: PlatformUpdate): PlatformUpdate {
    return {
        offset: math.add(update1.offset, update2.offset),
        velocity: update2.velocity
    };
}

export function resetPlatformUpdate(update: PlatformUpdate) {
    update.offset = [0, 0];
    update.velocity = [0, 0];
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
