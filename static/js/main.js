'use strict';

(function () {
    window.content = document.querySelector(".content");
    window.subheader = document.querySelector(".subheader");
    window.userpanel = document.querySelector(".top");

    // window.user = {name: 'Player 2', score: '197'};

    let pages = {};
    pages.index = new window.Index();
    pages.about = new window.About();
    pages.game = new window.Game();
    pages.leaders = new window.Leaders();
    pages.login = new window.Login();
    pages.signup = new window.Signup();

    window.userpanel.innerHTML = window.render_top();

    pages.index.render();


    function switch_page(page) {
        if (typeof (pages[page]) != 'undefined') {
            pages[page].render();
        }
    }

    document.body.addEventListener('click', event => {
        let target = event.target;
        if (target.nodeName == "A") {
            event.preventDefault();
            switch_page(target.dataset.page);
        }
    });

})();
