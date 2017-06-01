import {Interpolator} from "./state_interpolation";
import {Pair} from "../base/common";


interface TimeStampObj {
    timestamp: number;
}


export interface TimeStampState<T> extends TimeStampObj {
    state: T;
}


export function getNextState<T>(time: number, states: Array<TimeStampState<T>>, interpolator: Interpolator): T {
    const sortedStates = states.sort((left, right) => left.timestamp - right.timestamp);
    const indexPair = getSurroundingIndexPair(time, sortedStates.map(state => state.timestamp));

    if (indexPair.first !== null && indexPair.second !== null) {
        const interpFactor = getInterpFactor(
            time,
            sortedStates[indexPair.first],
            sortedStates[indexPair.second]
        );

        return interpolator(
            interpFactor,
            sortedStates[indexPair.first].state,
            sortedStates[indexPair.second].state
        );
    }

    return null;
}


export function getLastMessage<T>(time: number, states: Array<TimeStampState<T>>): TimeStampState<T> {
    const sortedStates = states.sort((left, right) => left.timestamp - right.timestamp);
    const indexPair = getSurroundingIndexPair(time, sortedStates.map(state => state.timestamp));

    if (!indexPair.first) {
        return null;
    } else {
        return states[indexPair.first];
    }
}


function getSurroundingIndexPair(x: number, x0SortedArr: number[]): Pair<number> {
    const candidates = x0SortedArr
        .filter(x0 => x0 <= x);

    const firstCandidate = candidates.length - 1;
    const secondCandidate = candidates.length;

    const first = firstCandidate < 0 ? null : firstCandidate;
    const second = secondCandidate === x0SortedArr.length ? null : secondCandidate;

    return {first, second};
}


function getInterpFactor(t: number, t1: TimeStampObj, t2: TimeStampObj): number {
    return (t - t1.timestamp) / (t2.timestamp - t1.timestamp);
}

