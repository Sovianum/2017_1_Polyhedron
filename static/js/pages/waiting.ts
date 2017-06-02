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
import AnnouncementEvent = networkEvents.AnnouncementEvent;


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

    private players: any[];

    constructor(heading, content, alert, options?) {
        super(heading, content, alert, options);
        this.players = [];

        this.text = this.createText();

        this.eventBus.addEventListener(
            GetReadyEvent.eventName,
            () => router.renderAndSave('/battle', this.players.map(player => player.nickname))
        );

        this.eventBus.addEventListener(
            AnnouncementEvent.eventName,
            (event) => {
                this.players = event.detail;
                this.text = this.createText();
                this.text.render();
            }
        );
    }

    public async render() {
        this._heading.innerHTML = "Подготовка партии";
        this.variableMap.get('userpanel').setOptions(false, false, false);
        this.variableMap.get('userpanel').forceRender();
        this.text.render();

        this.wsEndpoint.start();    // TODO make something more accurate
    }

    private createText(): Text {
        return new Text({
            items: [
                {text: 'Пожалуйста, подождите:'},
                {text: 'Идёт подбор противников.'},
                {text: 'Готовность: <span id="ready">' + this.players.length + '</span> из 4'}
            ],
            parent: this._content
        });
    }
}
