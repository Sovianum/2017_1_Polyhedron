
import * as events from '../event_system/events';
import {Load, Autowired} from "../experimental/decorators";
import {EventBus} from "../event_system/event_bus";

export class WSEndpoint {
    private _socket: WebSocket;

    @Load('network/wsUrl')
    private _url: string;

    @Autowired(EventBus)
    private _eventBus: EventBus;

    private static _getRequestJson(type, data) {
        return JSON.stringify({
            type, data
        });
    }

    public start() {
        try {
            this._socket = new WebSocket(this._url);
            this._initSocket();
            this._setListeners();
        } catch (err) {
            console.error(err);
        }
    }

    public sendMessage(messageType, data = {}) {
        this._send(
            WSEndpoint._getRequestJson(messageType, data)
        );
    }

    public close() {
        this._socket.close();
    }

    private _initSocket() {
        this._socket.onmessage = event => {
            const eventData = JSON.parse(event.data);
            this._eventBus.dispatchEvent(events.networkEvents.ServerMessageEvent.create(eventData));
        };

        this._socket.onclose = () => {
            this._eventBus.dispatchEvent(events.networkEvents.ConnectionClosedEvent.create());
        };

        this._socket.onerror = (event: ErrorEvent) => {
            this._eventBus.dispatchEvent(events.networkEvents.ServerErrorEvent.create(event.error));
        };
    }

    private _setListeners() {
        this._eventBus.addEventListener(events.networkEvents.ClientMessageEvent.eventName, event => {
            const detail = event.detail;
            this.sendMessage(detail.type, detail.data);
        });
    }

    private _send(data) {
        this._socket.send(data);
    }

}
