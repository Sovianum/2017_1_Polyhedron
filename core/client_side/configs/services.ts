'use strict';

import {InputController} from "../game_mechanics/event_system/input_controller";
import {EventBus} from "../game_mechanics/event_system/event_bus";
import {WSEndpoint} from "../game_mechanics/network/endpoint";
import {VariableContext} from "../game_mechanics/experimental/context";

export const clientSideServices = [
    VariableContext,
    InputController,
    EventBus,
    WSEndpoint
];

export const serverSideServices = [
    VariableContext,
    EventBus
];
