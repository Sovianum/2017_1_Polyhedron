'use strict';

import {createSession} from "./session_handling";
import {GameWorldState} from "../../client_side/game_mechanics/event_system/messages";
import * as math from "../../_lib/math.js";
import {getRotationMatrix} from "../../client_side/game_mechanics/base/geometry";

const SESSION_DELIMITER = '__';


export function getSessionPrefix(session: string): string {
    return session.split(SESSION_DELIMITER)[0];
}


export function getSessionIndex(session: string): number {
    return parseInt(session.split(SESSION_DELIMITER)[1], 10);
}


export class GameSessionGenerator {
    private _roomSize: number;
    private _currSession: string;
    private _cnt: number;

    constructor(roomSize = 4) {
        this._roomSize = roomSize;
        this._cnt = 0;
    }

    public getSession(): string {
        if (this._cnt % this._roomSize === 0) {
            this._currSession = createSession();
        }
        const result = this._currSession + SESSION_DELIMITER + String(this.getIndex());
        ++this._cnt;
        return result;
    }

    public getIndex(): number {
        return this._cnt % this._roomSize;
    }
}


export class UserHolder {
    private _userMap: {};

    constructor() {
        this._userMap = {};
    }

    public addUser(wsUser, session: string) {
        const sessionPrefix = getSessionPrefix(session);
        if (!(sessionPrefix in this._userMap)) {
            this._userMap[sessionPrefix] = [];
        }

        this._userMap[sessionPrefix].push({
            user: wsUser,
            session
        });
    }

    public getUsers(session: string) {
        const sessionPrefix = getSessionPrefix(session);

        if (!(sessionPrefix in this._userMap)) {
            return [];
        }

        return this._userMap[sessionPrefix].map(data => data.user);
    }
}


export function rotateGameWorldState(worldState: GameWorldState, offsetIndex: number): GameWorldState {
    const rotationAngle = Math.PI / 2 * offsetIndex;
    // TODO check if need to rotate to opposite direction
    const rotate = vec => math.multiply(getRotationMatrix(rotationAngle), vec).toArray();
    return {
        ballState: {
            velocity: rotate(worldState.ballState.velocity),
            position: rotate(worldState.ballState.position)
        },

        platformsState: worldState.platformsState.map(platformState => {
            return {
                position: rotate(platformState.position),
                angle: platformState.angle + rotationAngle,
                velocity: rotate(platformState.velocity),
                active: platformState.active
            };
        })
    };
}

