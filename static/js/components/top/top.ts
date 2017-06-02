'use strict';

import {Component} from '../base';
import * as renderTop from '../../templates/render_top';
import {Waiter} from '../waiter/waiter';
import {Autowired} from "../../../../core/client_side/game_mechanics/experimental/decorators";
import {BackendAPI} from "../../../../core/client_side/site_service/backend_api";
import {VariableContext} from "../../../../core/client_side/game_mechanics/experimental/context";

export class Top extends Component {
    @Autowired(BackendAPI)
    private backendAPI: BackendAPI;

    @Autowired(VariableContext)
    private variableMap: VariableContext;

    private hideMenu: boolean;
    private hideLogin: boolean;
    private hideReg: boolean;

    private firstRender: boolean;

    public static startLoadingAnimation() {
        const userpanel = document.querySelector(".js-top");
        userpanel.innerHTML = '';
        const waiter = new Waiter({parent: userpanel});
        waiter.render();
    }

    constructor(options = {}) {
        super(options);
        this.template = renderTop.template;
        this.hideMenu = false;
        this.hideReg = false;
        this.hideLogin = false;

        this.firstRender = true;
    }

    public setOptions(hideMenu, hideLogin, hideReg) {
        this.hideMenu = hideMenu;
        this.hideLogin = hideLogin;
        this.hideReg = hideReg;
    }

    public render() {
        Top.startLoadingAnimation();

        this.backendAPI.getuser()
            .then(response => {
                return response.json();
            })
            .then(responseJSON => {
                if (this.variableMap.get('user') !== responseJSON.data.login) {
                    this.variableMap.set('user', responseJSON.data.login);
                    const userpanel = document.querySelector(".js-top");

                    userpanel.innerHTML = renderTop.template({
                        user: responseJSON.data.login,
                        hide_menu: this.hideMenu,
                        hide_login: this.hideLogin,
                        hide_reg: this.hideReg
                    });
                }

            })
            .catch(() => {
                this.variableMap.set('user', null);
                const userpanel = document.querySelector(".js-top");
                userpanel.innerHTML = renderTop.template({
                    user: null,
                    hide_menu: this.hideMenu,
                    hide_login: this.hideLogin,
                    hide_reg: this.hideReg
                });
            });
        return this;
    }


    public forceRender(): void {
        if (this.firstRender) {
            this.render();
            this.firstRender = false;
        } else {
            const userpanel = document.querySelector(".js-top");
            userpanel.innerHTML = renderTop.template({
                user: this.variableMap.get('user'),
                hide_menu: this.hideMenu,
                hide_login: this.hideLogin,
                hide_reg: this.hideReg
            });
        }

    }

    public login() {
        this.backendAPI.getuser()
            .then(response => {
                return response.json();
            })
            .then(responseJSON => {
                this.variableMap.set('user', responseJSON.data.login);
                this.variableMap.set('user', null);
                this.forceRender();
            });
    }

    public logout() {
        this.variableMap.set('user', null);

        this.hideMenu = true;
        this.forceRender();
        this.backendAPI.logout();
    }
}
