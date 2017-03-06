"use strict";
let lib = require("./core/server");

const DEFAULT_PORT = 3000;

let router = new lib.Router();

router.addPlainURL("/", new lib.BindedFile("./html/index.html"));

router.addRegexURL("^/lib/.*\.js$", new lib.BindedFolder("./static/_lib/js/", "/lib/"));
router.addRegexURL("^/lib/.*\.css$", new lib.BindedFolder("./static/_lib/css/", "/lib/"));

router.addRegexURL(".*\.js$", new lib.BindedFolder("./static/js", "/static/js"));
router.addRegexURL(".*\.css$", new lib.BindedFolder("./static/css", "/static/css"));
router.addRegexURL(".*\.ttf$", new lib.BindedFolder("./static/fonts", "/static/fonts"));
router.addRegexURL(".*\.gif$", new lib.BindedFolder("./static/images", "/static/images"));

router.addRegexURL("^/media/", new lib.BindedFolder("./static/media/", "/media/"));
router.addRegexURL("^/core/.*\.js$", new lib.BindedFolder("./core/", "/core/"));
router.addRegexURL("^/core/lib/.*\.js$", new lib.BindedFolder("./core/_lib/", "/core/lib/"));
router.addRegexURL("^/dist/.*\.js$", new lib.BindedFolder("./dist/", "/dist/"));

let server = lib.getStaticServer(router);

let port = process.env.PORT || DEFAULT_PORT;
server.listen(port);

