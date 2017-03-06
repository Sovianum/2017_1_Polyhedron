(function () {
    'use strict';

    class About {
        constructor (options) {
            this.options = options;
        };

        render () {
            window.subheader.innerHTML = "Об игре";
            window.content.innerHTML = window.render_about(this.options);
        };
    }

    window.About = About;
})();