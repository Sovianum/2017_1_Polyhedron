
// require('isomorphic-fetch');  // TODO Check if it is possible to use require with ts
import {Promise} from "es6-promise";
// const ROOT_URL = 'https://polyhedron-backend.herokuapp.com';
const ROOT_URL = 'localhost:8080';

const RELATIVE_URL_MAP = {
    register: '/api/user/registration',
    login: '/api/user/login',
    logout: '/api/user/logout',
    getUser: '/api/user/getuser',
    update: '/api/user/update',
    leaders: '/api/user/leaders/',
    isLoggedIn: '/api/user/islogin'
};

const METHODS = {
    GET: "GET",
    POST: "POST"
};


type FetchResponse = Promise<any>;


export class BackendAPI {
    private _rootURL: string;
    private _urlMap: any;

    constructor(rootURL: string = ROOT_URL, urlMap: {} = RELATIVE_URL_MAP) {
        this._rootURL = rootURL;
        this._urlMap = urlMap;
    }

    public register(email: string, login: string, password: string): FetchResponse {
        return this._fetchCORS(this._urlMap.register, METHODS.POST, {
            email, login, password
        });
    }

    public login(email: string, password: string): FetchResponse {
        return this._fetchCORS(this._urlMap.login, METHODS.POST, {
            email, password
        });
    }

    public getuser(): FetchResponse {
        return this._fetchCORS(this._urlMap.getUser, METHODS.GET);
    }

    public logout(): FetchResponse {
        return this._fetchCORS(this._urlMap.logout, METHODS.POST);
    }

    public getLeaders(leadersCountLimit: number): FetchResponse {
        return this._fetchCORS(this._urlMap.leaders + leadersCountLimit, METHODS.GET);
    }

    public isLoggedIn(): FetchResponse {
        return this._fetchCORS(this._urlMap.isLoggedIn, METHODS.POST);
    }

    private _fetchCORS(url, method, requestBody = {}): FetchResponse {
        const absURL = this._rootURL + url;

        const options = {
            method,
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-type': 'application/json'
            }
        };
        if (method === METHODS.POST) {
            (options as any).body = requestBody ? JSON.stringify(requestBody) : '';
        }

        return (window as any).fetch(absURL, options);
    }
}
