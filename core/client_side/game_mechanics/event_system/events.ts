'use strict';
import {Platform} from "../game_components/platform";
import {PlatformState} from "./messages";

class MyCustomEvent {
    public data: any;
    public type: string;

    constructor(type: string, data: any = {}) {
        this.type = type;
        this.data = data;
    }

    get detail() {
        return this.data.detail;
    }
}


export abstract class BaseEvent {
    public static get eventName() {
        return (this as any).name;
    }

    public static create(eventDetail: any = {}) {
        return new MyCustomEvent(this.eventName, {
            detail: eventDetail,
        });
    }

    constructor() {
        const className = this.constructor.name;
        throw new Error(
            'NEVER create instances of ' +
            className +
            ' with new. ALWAYS use ' +
            className +
            '.create(...).');
    }
}


export namespace networkEvents {
    export class ServerErrorEvent extends BaseEvent {}


    export class ServerMessageEvent extends BaseEvent {}


    export class ClientMessageEvent extends BaseEvent {}


    export class ConnectionClosedEvent extends BaseEvent {}


    export class WorldUpdateEvent extends BaseEvent {}


    export class GetReadyEvent extends BaseEvent {}


    export class GameStartEvent extends BaseEvent {}


    export class DefeatEvent extends BaseEvent {
        public static create(eventDetail) {
            const playerIndex = eventDetail.playerIndex;
            const looserIndex = eventDetail.looserIndex;

            return new MyCustomEvent(this.eventName, {
                detail: looserIndex - playerIndex
            });
        }
    }
}


export namespace gameEvents {
    export class PlatformMovedEvent extends BaseEvent {
        public static create(platformState: PlatformState) {
            return new MyCustomEvent(this.eventName, {
                detail: platformState,
            });
        }
    }


    export class ClientDefeatEvent extends BaseEvent {}


    export class BallBounced extends BaseEvent {}


    export class DrawEvent extends BaseEvent {}
}


export namespace controllerEvents {
    export class ArrowDirectionEvent extends BaseEvent {}
}


export namespace serviceEvents {
    export class RenderPageEvent extends BaseEvent {}
}
