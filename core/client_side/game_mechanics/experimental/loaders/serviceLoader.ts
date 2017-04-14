'use strict';
import {services} from '../../configs/services';
import {Context} from "../context";
import {NamedConstructible} from "../interfaces";

export const loadServices = (function () {
    let loaded = false;
    return () => {
        if (!loaded) {
            const locator = Context.getInstance();

            services.forEach(function<T extends NamedConstructible> (service: T) {
                locator.addService((<any>service).__proto__.name, new service());
            });
        }
    }
})();
