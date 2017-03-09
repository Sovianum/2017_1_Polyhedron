'use strict';

const BasePage = require('./base');

class Signup extends BasePage {
    render () {
        this._heading.innerHTML = "Регистрация";
        this._content.innerHTML = this._template(this._options);
    }
}

module.exports = Signup;