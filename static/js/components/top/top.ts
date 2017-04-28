'use strict';

import {Component} from '../base';
import * as renderTop from '../../templates/render_top';
import {Autowired} from "../../../../core/client_side/game_mechanics/experimental/decorators";
import {BackendAPI} from "../../../../core/client_side/site_service/backend_api";
import {VariableMap} from "../../../../core/client_side/game_mechanics/experimental/context";

export class Top extends Component {
    @Autowired(BackendAPI)
    private backendAPI: BackendAPI;

    @Autowired(VariableMap)
    private variableMap: VariableMap;

    constructor(options = {}) {
        super(options);
        this.template = renderTop.template;
    }

    public render() {
        this.backendAPI.getuser()
            .then(response => {
                return response.json();
            })
            .then(responseJSON => {
                this.variableMap.setVariable('user', responseJSON.data);
                const userpanel = document.querySelector(".js-top");
                userpanel.innerHTML = renderTop.template({
                    user: responseJSON.data
                });
            });
        return this;
    }

    public login() {
        this.backendAPI.getuser()
            .then(response => {
                return response.json();
            })
            .then(responseJSON => {
                this.variableMap.setVariable('user', responseJSON.data);

                const userpanel = document.querySelector(".js-top");
                userpanel.innerHTML = renderTop.template();
            });
    }

    public logout() {
        this.variableMap.setVariable('user', null);

        this.render();
        this.backendAPI.logout();
    }
}
