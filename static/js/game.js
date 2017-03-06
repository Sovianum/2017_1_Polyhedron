(function () {
    'use strict';

    class Game {
        constructor (options) {
            this.options = options;
        };

        render () {
            window.subheader.innerHTML = "Игра";
            window.content.innerHTML = window.render_game(this.options);
        };
    }

    window.Game = Game;
})();