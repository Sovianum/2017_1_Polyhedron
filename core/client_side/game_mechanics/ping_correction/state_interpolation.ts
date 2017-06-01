

import {BallState, GameWorldState, PlatformState} from "../event_system/messages";
import * as math from '../../../_lib/math';
import {Vector} from "../base/common";


export type Interpolator = <T>(interpFactor: number, state1: T, state2: T) => T;


export function interpGameWorldState(interpFactor: number, state1: GameWorldState, state2: GameWorldState): GameWorldState {
    return {
        platformsState: state1.platformsState.map(
            (item, index) => interpPlatformState(interpFactor, item, state2.platformsState[index])
        ),
        ballState: interpBallState(interpFactor, state1.ballState, state2.ballState)
    };
}


export function interpBallState(interpFactor: number, state1: BallState, state2: BallState): BallState {
    return {
        position: interpVector(interpFactor, state1.position, state2.position),
        velocity: interpVector(interpFactor, state1.velocity, state2.velocity)
    };
}


export function interpPlatformState(interpFactor: number, state1: PlatformState, state2: PlatformState): PlatformState {
    return {
        position: interpVector(interpFactor, state1.position, state2.position),
        velocity: interpVector(interpFactor, state1.velocity, state2.velocity),
        angle: interpNum(interpFactor, state1.angle, state2.angle),
        active: state1.active
    };
}


function interpNum(interpFactor: number, x1: number, x2: number) {
    return x1 * (1 - interpFactor) + x2 * interpFactor;
}


function interpVector(interpFactor: number, v1: Vector, v2: Vector) {
    return math.add(
        math.multiply(v1, (1 - interpFactor)),
        math.multiply(v2, interpFactor)
    );
}
