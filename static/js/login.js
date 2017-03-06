(function () {
    'use strict';

    class Login {
        constructor (options) {
            this.options = options;
        };

        render () {
            window.subheader.innerHTML = "Вход в игру";
            window.content.innerHTML = window.render_login(this.options);
        };
    }

    window.Login = Login;
})();
