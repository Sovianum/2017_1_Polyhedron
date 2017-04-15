'use strict';
import {Context} from "./context";
import {loadDataSources} from '../loaders/dataSourceLoader';
import {NamedConstructible} from "./interfaces";


function getClassConfigName<T extends NamedConstructible> (constructor: T) {
    return constructor.name + '.config';
}


function getSubObj(obj: {}, keys: string[]) {
    return keys.reduce((subObj, key) => subObj[key], obj);
}


export function Service<T extends NamedConstructible> (constructor: T) {
    return class extends constructor {
        toString() {
            return constructor.name;
        }
    }
}


export function Autowired(constructFunc: NamedConstructible, ...args: any[]) {
    loadDataSources();

    const locator = Context.getInstance();
    locator.addService(constructFunc.name, new constructFunc(...args));

    return (target: any, key: string) => {
        target[key] = locator.getService(constructFunc.name);
    }
}


export function NewConfigurable(path: string) {
    loadDataSources();

    const locator = Context.getInstance();
    const [head, ...tail] = path.split('/');
    const localConfig = tail.reduce((subConfig, key) => subConfig[key], locator.getDataSource(head));

    return function<T extends NamedConstructible> (constructor: T) {
        const locator = Context.getInstance();
        const configName = getClassConfigName(constructor);
        locator.addDataSource(configName, localConfig);

        return class extends constructor {
            private config;
            static config = locator.getDataSource(configName);

            constructor(...args: any[]) {
                super(...args);
                this.config = locator.getDataSource(configName);
            }
        }
    }
}


export function Load(url: string) {
    loadDataSources();

    const locator = Context.getInstance();

    return (target: any, key: string) => {
        if (!target[key]) {

            const [head, ...tail] = url.split('/');
            const subConf = locator.getDataSource(head);
            target[key] = getSubObj(subConf, tail);
        }
    }
}

