'use strict';

import {About} from './about';
import {ChoiceGameMode} from './choice';
import {Game} from './game';
import {GameOver} from './gameover';
import {Error} from './error404';
import {Index} from './index';
import {Leaders} from './leaders';
import {Login} from './login';
import {Signup} from './signup';
import {Waiting} from './waiting';

import * as pugRuntime from '../../../node_modules/pug-runtime/index';

import {Router} from '../../../core/client_side/site_service/router';


const content = document.querySelector(".js-content");
const heading = document.querySelector(".js-subheader");
const alert = document.querySelector(".js-alert");

// TODO get rid of setting to window (temporary solution).
Object.keys(pugRuntime).forEach(key => window['pug_' + key] = pugRuntime[key]);

export const router = new Router({
    '^/?$': new Index(heading, content, alert, {}),

    '^/?index$': new Index(heading, content, alert, {}),
    '^/?about$': new About(heading, content, alert, {}),
    '^/?choice$': new ChoiceGameMode(heading, content, alert, {}),
    '^/?game$': new Game(heading, content, alert, {mode: 'single'}),
    '^/?battle$': new Game(heading, content, alert, {mode: 'multi'}),
    '^/?gameover$': new GameOver(heading, content, alert, {}),
    '^/?leaders$': new Leaders(heading, content, alert, {count: 10}),
    '^/?login$': new Login(heading, content, alert, {}),
    '^/?signup$': new Signup(heading, content, alert, {}),
    '^/?waiting$': new Waiting(heading, content, alert, {}),
    '^/?404$': new Error(heading, content, alert)
}, new Error(heading, content, alert, {}));
