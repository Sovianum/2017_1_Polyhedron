'use strict';

import {BasePage} from './base';
import {Text} from '../components/text/text';
import {Autowired} from "../../../core/client_side/game_mechanics/experimental/decorators";
import {VariableContext} from "../../../core/client_side/game_mechanics/experimental/context";
import {WSEndpoint} from "../../../core/client_side/game_mechanics/network/endpoint";
import {ServerCommunicator} from "../../../core/client_side/game_mechanics/network/server_communicator";
import {EventBus} from "../../../core/client_side/game_mechanics/event_system/event_bus";
import {networkEvents} from "../../../core/client_side/game_mechanics/event_system/events";
import GetReadyEvent = networkEvents.GetReadyEvent;
import {router} from "./main";


export class Waiting extends BasePage {
    private text: Text;

    @Autowired(VariableContext)
    private variableMap: VariableContext;

    @Autowired(WSEndpoint)
    private wsEndpoint: WSEndpoint;

    @Autowired(ServerCommunicator)
    private serverCommunicator;

    @Autowired(EventBus)
    private eventBus: EventBus;

    constructor(heading, content, alert, options?) {
        super(heading, content, alert, options);
        this.text = new Text({
            items: [
                {text: 'Пожалуйста, подождите:'},
                {text: 'Идёт подбор противников.'},
                {text: 'Готовность: <span id="ready">0</span> из 3'}
            ],
            parent: this._content
        });

        this.eventBus.addEventListener(
            GetReadyEvent.eventName,
            () => router.renderAndSave('/battle')
        );
    }

    public async render() {
        this._heading.innerHTML = "Подготовка партии";
        this.variableMap.get('userpanel').setOptions(false, false, false);
        this.variableMap.get('userpanel').forceRender();
        this.text.render();

        this.wsEndpoint.start();    // TODO make something more accurate
    }
}
