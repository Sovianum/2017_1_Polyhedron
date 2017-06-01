
import * as events from '../event_system/events';
import {Autowired} from "../experimental/decorators";
import {EventBus} from "../event_system/event_bus";


export class ServerCommunicator {
    @Autowired(EventBus)
    private _eventBus: EventBus;
    private _eventMap: {};

    /**
     * Function returns object mapping event names to event classes
     * @returns {{}}
     */
    private static getEventMap() {
        const namespaces = Object.keys(events)
            .map(key => events[key])
            .filter(obj => !obj.name);
        const namespacePairs = namespaces.map(namespace => [namespace, Object.keys(namespace)]);
        const eventPairsArrays = namespacePairs
            .map(([namespace, keys]) => {
                return keys.map(key => [key, namespace[key]]);
            });

        return []
            .concat.apply([], eventPairsArrays)
            .reduce((curr, [key, value]) => {
                curr[key] = value;
                return curr;
            }, {});
    }

    constructor() {
        this._setListeners();
        this._eventMap = ServerCommunicator.getEventMap();
    }

    private _setListeners() {
        this._eventBus.addEventListener(
            events.gameEvents.PlatformMovedEvent.eventName,
            event => this.handlePlatformMovedEvent(event)
        );

        this._eventBus.addEventListener(events.networkEvents.ServerMessageEvent.eventName, (event: CustomEvent) => {
            const detail = event.detail;
            const gameEventClass = detail.type;
            const data = detail.data;

            try {
                const newEvent = this._eventMap[gameEventClass].create(data);
                newEvent.data.id = detail.id;
                newEvent.data.timestamp = detail.timestamp;
                this._eventBus.dispatchEvent(newEvent);
            } catch (error) {
               // console.error(error);   // TODO refactor
            }
        });
    }

    private handlePlatformMovedEvent(event) {
        this._eventBus.dispatchEvent(events.networkEvents.ClientMessageEvent.create({
            type: events.gameEvents.PlatformMovedEvent.eventName,
            data: event.detail
        }));
    }
}
