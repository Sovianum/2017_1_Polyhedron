'use strict';

import {BasePage} from './base';
import {Menu} from '../components/menu/menu';


export class Index extends BasePage {
    constructor (heading, content, options) {
        super(heading, content, options);
        this.menu = new Menu({
            items: [
                {text: 'Играть', page: 'choice', accented: true},
                {text: 'Лидеры', page: 'leaders'},
                {text: 'Об игре', page: 'about'}
            ],
            parent: this._content
        });
    }

    render () {
        this._heading.innerHTML = "Многопользовательский пинг-понг";
        window.userpanel.render();

        this.menu.render();
    }
}
