
import {BackendAPI} from '../../backend_api';
import {Form} from '../base_form';
import {MESSAGE_MAP} from '../messages';
import * as fields from '../form_fields';


const REGISTER_SELECTORS = {
    form: '#signUpForm',

    fields: {
        login: '#login',
        email: '#email',
        password: '#password',
        passwordRepeat: '#password2',
    },

    errors: {
        email: '#error-email',
        password: '#error-password',
        login: '#error-login',
        passwordRepeat: '#error-password2',
    },

    submitter: '#submit'
};


export class SignUpForm extends Form {
    constructor() {
        let form = document.querySelector(REGISTER_SELECTORS.form);

        let email = form.querySelector(REGISTER_SELECTORS.fields.email);
        let login = form.querySelector(REGISTER_SELECTORS.fields.login);
        let password = form.querySelector(REGISTER_SELECTORS.fields.password);
        let passwordRepeat = form.querySelector(REGISTER_SELECTORS.fields.passwordRepeat);

        let submitter = form.querySelector(REGISTER_SELECTORS.submitter);

        let emailField = new fields.EmailField(email);
        emailField.setErrorOutput(form.querySelector(REGISTER_SELECTORS.errors.email));

        let loginField = new fields.LoginField(login);
        loginField.setErrorOutput(form.querySelector(REGISTER_SELECTORS.errors.login));

        let passwordField = new fields.PasswordField(password);
        passwordField.setErrorOutput(form.querySelector(REGISTER_SELECTORS.errors.password));

        let passwordRepeatField = new fields.PasswordRepeatField(passwordRepeat, {
            referenceField: password
        });
        passwordRepeatField.setErrorOutput(form.querySelector(REGISTER_SELECTORS.errors.passwordRepeat));

        super({
            email: emailField,
            login: loginField,
            password: passwordField,
            passwordRepeat: passwordRepeatField,
        }, submitter);
    }

    _sendData() {
        let backendAPI = new BackendAPI();

        backendAPI.register(
            this._fields.email.getValue(),
            this._fields.login.getValue(),
            this._fields.password.getValue()
        )
            .then(response => {
                if (response.status === 200) {
                    alert(MESSAGE_MAP.SIGN_UP_SUCCESS);
                    window.router.render("/");
                } else {
                    alert(MESSAGE_MAP.SIGN_UP_FAIL);
                }
                console.log(response);
            })
            .catch(err => {
                alert(MESSAGE_MAP.CONNECTION_FAIL);
                console.log(err);
            });
    }
}