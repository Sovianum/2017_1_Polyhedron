'use strict';

import * as math from '../../../_lib/math';
import {Platform} from "../game_components/platform";
import {Ball} from "../game_components/ball";
import {Load} from "../experimental/decorators";


export class Bot {
    private _platform: Platform;
    private _ball: Ball;

    @Load('bot/velocity')
    private _velocity: number;

    @Load('bot/time')
    private _time: number;
    private _setIntervalID;

    constructor(platform, ball) {
        this._platform = platform;
        this._ball = ball;
        this._setIntervalID = null;

        this._init();
    }

    public stop() {
        clearInterval(this._setIntervalID);
    }

    public start() {
        this._init();
    }

    private _init() {
        this._setIntervalID = setInterval(() => {
            this._movePlatform(this._time);
        }, this._time);
    }

    private _movePlatform(time) {
        const offsetVector = math.multiply(this._getOffsetDirection(), this._velocity * time);
        const xOffset = [offsetVector[0], 0];
        const yOffset = [0, offsetVector[1]];

        this._platform.moveByWithConstraints(xOffset);
        this._platform.moveByWithConstraints(yOffset);
    }

    private _getOffsetDirection() {
        const ballOffset = this._platform.toLocals(this._ball.position);
        ballOffset[1] = -1; // this line moves all bot platforms to the very bottom of corresponding sectors

        const offsetNorm =  math.norm(ballOffset);
        const localDirection = math.divide(ballOffset, offsetNorm);

        return this._platform.toGlobalsWithoutOffset(localDirection);
    }
}
