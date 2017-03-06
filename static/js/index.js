(function () {
    'use strict';

    class Index {
        constructor (options) {
            this.options = options;
        };

        render () {
            window.subheader.innerHTML = "Многопользовательский пинг-понг";
            window.content.innerHTML = window.render_index(this.options);
        };
    }

    window.Index = Index;
})();