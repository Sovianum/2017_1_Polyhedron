'use strict';

import {BasePage} from './base';
import {SignUpForm} from '../../../core/client_side/site_service/form_validation/custom_forms/sign_up_form';
import {Form} from '../components/form/form';


export class Signup extends BasePage {
    constructor (heading, content, options) {
        super(heading, content, options);
        this.form = new Form({
            name: 'signUpForm',
            inputs: [
                {name: 'login', text: 'Логин', type: 'text', placeholder: "Введите логин"},
                {name: 'password', text: 'Пароль', type: 'password', placeholder: "Введите пароль"},
                {name: 'password2', text: 'Ещё раз пароль', type: 'password', placeholder: "Повторите пароль"},
                {name: 'email', text: 'E-mail', type: 'text', placeholder: "example@example.com"},
            ],
            controls: [
                {name: 'submit', text: 'Зарегистрироваться', type: 'submit'},
                {type: 'link', text: 'Войти', page: 'login'},
            ],
            parent: this._content
        });

        this.authorised = new Text({
            items: [
                {text: 'Вы уже зарегистрированы.'},
            ],
            parent: this._content
        });
    }

    render () {
        this._heading.innerHTML = "Регистрация";
        let page = this;

        window.backendAPI.getuser()
            .then(response => {
                return response.json();
            })
            .then(responseJSON => {
                window.user = responseJSON.data;
            })
            .then(() => {
                if (window.user) {
                    page.authorised.render();
                }
                else {
                    page.form.render();
                    page._validator = new SignUpForm();
                }
                window.userpanel.render();
            });

        }
}
