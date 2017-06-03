'use strict';

import {Autowired} from "../experimental/decorators";
import {EventBus} from "../event_system/event_bus";
import {gameEvents} from "../event_system/events";
import DrawEvent = gameEvents.DrawEvent;
import StopEvent = gameEvents.StopEvent;
import TruncateEvent = gameEvents.TruncateEvent;

export class Drawer {
    protected _canvas: HTMLCanvasElement;
    @Autowired(EventBus)
    protected _eventBus;

    private _truncateTime: number;

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this._setListeners();

        this._truncateTime = 0;
    }

    public setCanvas(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
    }

    protected _setListeners() {
        this._eventBus.addEventListener(DrawEvent.eventName, event => {
            if (event.detail.timestamp > this._truncateTime) {
                event.detail.draw(this._canvas);
            }
        });

        this._eventBus.addEventListener(TruncateEvent.eventName, event => {
            this._truncateTime = event.detail;
        });
    }
}
