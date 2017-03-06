(function () {
    'use strict';

    class Leaders {
        constructor (options) {
            this.options = options;
        };

        render() {
            window.subheader.innerHTML = "Топ-10";
            let locals = {};
            locals.leaders = [
                {name: "Player 1", score: 200},
                {name: "Player 2", score: 200},
                {name: "Player 3", score: 200},
            ];
            locals.user = window.user || {};
            window.content.innerHTML = window.render_leaders(locals);
        };
    }

    window.Leaders = Leaders;
})();