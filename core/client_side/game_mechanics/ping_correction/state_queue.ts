'use strict';
import {getNextState, TimeStampState} from "./interp_functions";
import {Interpolator} from "./state_interpolation";


export abstract class AbstractStateQueue<T> {
    protected _queue: Array<TimeStampState<T>>;
    protected _minQueueSize: number;
    protected _activated: boolean;
    protected _timeLag: number;
    protected _interpolator: Interpolator;

    public constructor(minQueueSize: number, interpolator: Interpolator) {
        this._queue = [];
        this._minQueueSize = minQueueSize;
        this._activated = false;
        this._timeLag = 0;
        this._interpolator = interpolator;
    }

    public getQueue(): Array<TimeStampState<T>> {
        return this._queue;
    }

    public isActivated(): boolean {
        return this._activated;
    }

    public getInterpState(time: number): T {
        if (!this._activated) {
            return null;
        }
        this.cleanQueue();

        return getNextState(time - this._timeLag, this._queue, this._interpolator);
    }

    public cleanQueue() {
        this._queue = this._queue.filter(stamp => stamp.timestamp > (Date.now() - 2 * this._timeLag));
        if (this._queue.length === 0) {
            // console.log("Queue flushed completely");
        }
    }

    public getLastState(): T {
        return this._queue[this._queue.length - 1].state;
    }
}


export class ClientRuledStateQueue<T> extends AbstractStateQueue<T> {
    public addState(state: T) {
        this._queue.push({
            timestamp: Date.now(),
            state
        });

        if (this._queue.length >= this._minQueueSize && !this._activated) {
            this._activated = true;
            this._timeLag = this._queue[this._queue.length - 1].timestamp - this._queue[0].timestamp;
        }
    }
}


export class ServerRuledStateQueue<T> extends AbstractStateQueue<T> {
    private _clientStartTime: number;
    private _serverStartTime: number;
    private _started: boolean;

    public constructor(minQueueSize: number, interpolator: Interpolator) {
        super(minQueueSize, interpolator);
        this._started = false;
    }

    public getServerTime(time: number): number {
        return time - this._clientStartTime + this._serverStartTime;
    }

    public addState(state: T, serverTimeStamp: number) {
        if (!this._started) {
            this._started = true;
            this._serverStartTime = serverTimeStamp;
            this._clientStartTime = Date.now();
        }

        this._queue.push({
            timestamp: this._clientStartTime + (serverTimeStamp - this._serverStartTime),
            state
        });

        if (this._queue.length >= this._minQueueSize && !this._activated) {
            this._activated = true;
            this._timeLag = this._queue[this._queue.length - 1].timestamp - this._queue[0].timestamp;
        }
    }
}

// const sq = new StateQueue<BallState>(5, interpBallState);
// let i = 0;
//
// setInterval(
//     () => {
//         const state = {
//             velocity: [i, i],
//             position: [i, i]
//         };
//         i += 1;
//         sq.addState(state);
//     },
//     500
// );
//
// setTimeout(
//     () => {
//         setInterval(
//             () => {
//                 const result = sq.getInterpState(Date.now());
//                 if (!result) {
//                     console.log("Not ready yet");
//                 } else {
//                     console.log(result.position[0]);
//                 }
//             },
//             100
//         );
//     },
//     250
// );


