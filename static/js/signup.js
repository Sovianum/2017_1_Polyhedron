(function () {
    'use strict';

    class Signup {
        constructor (options) {
            this.options = options;
        };

        render () {
            window.subheader.innerHTML = "Регистрация";
            window.content.innerHTML = window.render_signup(this.options);
        };
    }

    window.Signup = Signup;
})();
