'use strict';

import {router} from './pages/main';
import {Top} from './components/top/top';
import {Autowired} from "../../core/client_side/game_mechanics/experimental/decorators";
import {VariableContext} from "../../core/client_side/game_mechanics/experimental/context";
import {loadWorker} from "../../core/client_side/site_service/offline_mode/worker_module";


(() => {
    class Starter {
        @Autowired(VariableContext)
        private variableMap: VariableContext;
        private userpanel: Top = new Top();

        public start() {
            this.variableMap.set('userpanel', this.userpanel);
            this.variableMap.set('router', router);

            router.renderAndSave(window.location.pathname);

            document.body.addEventListener('click', (event: any) => {
                const target = event.target;

                if (target.nodeName === "A" && target.dataset.page) {
                    event.preventDefault();
                    if (target.dataset.page === "logout") {
                        this.userpanel.logout();
                        router.renderAndSave("/");
                    } else {
                        router.renderAndSave(target.dataset.page);
                    }
                }
            });

            window.addEventListener('popstate', event => {
                router.render(event.state.url, event.state);
            });
        }
    }
    const starter = new Starter();
    starter.start();
    // loadWorker('/worker_script.js'); // TODO uncomment
})();

