'use strict';

import {BasePage} from './base';
import * as renderGame from '../templates/render_game';
import {Gamepad} from '../components/gamepad/gamepad';
import {GameStarter} from '../../../core/client_side/game_mechanics/main/game_start';
import {Autowired} from "../../../core/client_side/game_mechanics/experimental/decorators";
import {VariableContext} from "../../../core/client_side/game_mechanics/experimental/context";
import {Drawer} from "../../../core/client_side/game_mechanics/drawing/drawer";


export class Game extends BasePage {
    @Autowired(VariableContext)
    private variableMap: VariableContext;
    private gamepad: Gamepad;
    private mode: string;

    constructor(heading, content, alert, options) {
        super(heading, content, alert, options);
        this.gamepad = new Gamepad({});
        this.mode = options.mode;
    }

    public async render(options?) {
        try {
            this.reset();
        } catch (err) {
            // TODO add error handling
        }

        this._heading.innerHTML = this._options.mode === 'multi' ? "Сражение" : "Игра";

        const userPanel = this.variableMap.get('userpanel');
        userPanel.setOptions(false, false, false);
        userPanel.forceRender();

        this._content.innerHTML = renderGame.template(this._options);
        this.gamepad.render(this._content.querySelector('.game'));

        const gameStarter = new GameStarter();
        gameStarter.start('game', this.mode, options);
    }

    public reset() {
        this.variableMap.get('loop').stop();
    }
}
