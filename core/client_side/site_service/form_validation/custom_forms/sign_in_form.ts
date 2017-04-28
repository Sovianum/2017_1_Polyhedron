
import {BackendAPI} from '../../backend_api';
import {Form} from '../base_form';
import {MESSAGE_MAP} from '../messages';
import * as fields from '../form_fields';
import {Autowired} from "../../../game_mechanics/experimental/decorators";
import {VariableMap} from "../../../game_mechanics/experimental/context";


const LOGIN_SELECTORS = {
    form: '#signInForm',

    fields: {
        email: '#email',
        password: '#password'
    },

    errors: {
        email: '#error-email',
        password: '#error-password'
    },

    submitter: '#submit'
};

export class SignInForm extends Form {
    @Autowired(BackendAPI)
    private backendAPI: BackendAPI;

    @Autowired(VariableMap)
    private variableMap: VariableMap;

    constructor() {
        const form = document.querySelector(LOGIN_SELECTORS.form);

        const email = form.querySelector(LOGIN_SELECTORS.fields.email);
        const password = form.querySelector(LOGIN_SELECTORS.fields.password);

        const submitter = form.querySelector(LOGIN_SELECTORS.submitter);

        const emailField = new fields.EmailField(email);
        emailField.setErrorOutput(form.querySelector(LOGIN_SELECTORS.errors.email));

        const passwordField = new fields.PasswordField(password);
        passwordField.setErrorOutput(form.querySelector(LOGIN_SELECTORS.errors.password));

        super({
            email: emailField,
            password: passwordField
        }, submitter);
    }

    protected _sendData() {
        this.backendAPI.login(this._fields.email.getValue(), this._fields.password.getValue())
            .then(response => {
                return response.json();
            })
            .then(responseJson => {
                if (responseJson.errors) {
                    // console.log(responseJson.errors);    // TODO set up proper logging
                    alert(MESSAGE_MAP.INVALID_CREDENTIALS);
                } else {
                    alert(MESSAGE_MAP.LOGIN_SUCCESS);
                    this.variableMap.getVariable('router').renderAndSave('/');
                }

            })
            .catch(err => {
                alert(MESSAGE_MAP.CONNECTION_FAIL);
                // console.log(err);    // TODO set up proper logging
            });
    }
}