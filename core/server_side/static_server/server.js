"use strict";

const http = require("http");
const path = require("path");
const promiseReadFile = require("../../common/file_operations").promiseReadFile;


const DEFAULT_PAGE = "./static/html/error_page.html";


function getContentType(filePath) {
    const typeMap = {
        'html': 'text/html',
        'js': 'application/javascript',
        'json': 'application/json',
        'css': 'text/css'
    };

    const pathParts = filePath.split('.');
    const extension = pathParts[pathParts.length - 1];
    return typeMap[extension] || 'text/html';
}


/**
 *
 * @param pagePath path of the static file to return
 * @returns {Function} callback responding with predefined path
 * @constructor
 */
function BindedFile (pagePath) {
    return function (request, response) {
        console.log("Requested URL: ", request.url);

        promiseReadFile(pagePath).then(data => {
            response.writeHead(200, {"Content-Type": getContentType(pagePath)});
            response.write(data);
        }).catch(err => {
            console.error(err);
            response.writeHead(404, {"Content-Type": "text/html"});
            response.write("404 Not Found\n");
        }).then(() => {
            response.end();
        });
    };
}


/**
 *
 * @param folderPath path to the static root
 * @param urlPrefix: prefix which must be removed to get relative path
 * @returns {Function}
 * @constructor
 */
function BindedFolder (folderPath, urlPrefix) {
    return function (request, response) {
        console.log("Requested URL: ", request.url);

        let filePath = folderPath + request.url.replace(urlPrefix, "");
        let normalizedPath = path.relative(folderPath, filePath);
        if (normalizedPath.startsWith('..')) {
            console.log(normalizedPath);
            response.writeHead(404, {"Content-Type": "text/html"});
            response.end();
            return;
        }

        promiseReadFile(filePath).then(data => {
            response.writeHead(200, {"Content-Type": getContentType(filePath)});
            response.write(data);
        }).catch(err => {
            console.error(err);
            response.write(err.toString());
        }).then(() => {
            response.end();
        });
    };
}


/**
 * This function is just a wrapper around a callback, logging requested url
 * @param handlerFunc must accept request and response as input parameters
 * @returns {Function}
 * @constructor
 */
function BindedFunction(handlerFunc) {
    return function (request, response) {
        console.log("Requested URL: ", request.url);
        handlerFunc(request, response);
    };
}


const _callbackTemplates = {
    "default": function (request, response) {
        console.log("Incorrect URL requested: ", request.url);

        promiseReadFile(DEFAULT_PAGE).then(data => {
            response.write(data);
        }).catch(err => {
            console.error(err);
            response.writeHead(404, {"Content-Type": "text/html"});
            response.write("404 Not Found\n");
        }).then(() => {
            response.end();
        });
    },

    "pageNotFound": function (request, response) {
        console.error("404 error: ", request.url);
        response.writeHead(404, {"Content-Type": "text/html"});
        response.write("404 Not Found\n");
        response.end();
    },

    "notAuthorized": function (request, response) {
        console.log("403 error: ", request.url);
        response.writeHead(403, {"Content-Type": "text/html"});
        response.write("403 Not Found\n");
        response.end();
    }
};


class Router {
    constructor() {
        this._plainURLDict = {};
        this._regexpURLDict = {};
        this._prefixURLDict = {};
        this._default = null;
    }

    addPlainURL(url, bind) {
        this._plainURLDict[url] = bind;
    }

    addRegexURL(url, bind) {
        this._regexpURLDict[url] = bind;
    }

    addPrefixURL(url, bind) {
        this._prefixURLDict[url] = bind;
    }

    setDefault(bind) {
        this._default = bind;
    }

    get getPlainURLDict() {
        return this._plainURLDict;
    }

    get getRegexpURLDict() {
        return this._regexpURLDict;
    }

    get getPrefixURLDict() {
        return this._prefixURLDict;
    }

    getDefaultBind() {
        return this._default;
    }

    hasDefaultBind() {
        return Boolean(this._default);
    }
}


function getStaticServer (router) {

    return http.createServer(function (request, response) {
        let callback = router.getPlainURLDict[request.url] || null;

        if (callback) {
            callback(request, response);
            console.log("Complete match succeeded: ", request.url);
            return;
        }
        console.log("Complete match failed: ", request.url);

        let regexpURL = Object.keys(router.getRegexpURLDict).filter(
            (url) => { return request.url.match(new RegExp(url)); }
        ).sort((a, b) => b.length - a.length)[0];

        callback = regexpURL ? router.getRegexpURLDict[regexpURL] : null;

        if (callback) {
            callback(request, response);
            console.log("URL ", request.url, " match regex: ", regexpURL);
            return;
        }
        console.log("Regex match failed: ", request.url);


        /*
        Sorting below to prevent name collisions in cases like:
            Dirs:
                dir_1/mid_dir/file,
                dir_2/file
            Routing:
                /static/ => dir_1,
                /static/mid_dir => dir_2
            Url:
                /static/mid_dir/file
        If not sorting may return dir_1/mid_dir/file instead of dir_2/mid_dir/file
        */
        let prefixURL = Object.keys(router.getPrefixURLDict).filter(
            url => request.url.startsWith(url)
        ).sort((a, b) => b.length - a.length)[0];

        callback = prefixURL ? router.getPrefixURLDict[prefixURL] : null;

        if (callback) {
            callback(request, response);
            console.log("URL ", request.url, " match prefix ", prefixURL);
            return;
        }
        console.log("Prefix match failed: ", request.url);

        //callback = _callbackTemplates.pageNotFound;
        callback = router.hasDefaultBind() ? router.getDefaultBind() : _callbackTemplates.pageNotFound;
        callback(request, response);
    });
}

module.exports.BindedFile = BindedFile;
module.exports.BindedFolder = BindedFolder;
module.exports.BindedFunction = BindedFunction;
module.exports.Router = Router;
module.exports.getStaticServer = getStaticServer;
