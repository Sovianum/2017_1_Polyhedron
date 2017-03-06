function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function render_index(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"static\u002Fjs\u002Ftemplates\u002Frender_index.pug":"nav.menu\n    a.block.accented.bigger(data-page=\"game\") Играть\n    a.block.leaders(data-page=\"leaders\") Лидеры\n    a.block.about(data-page=\"about\") Об игре"};
;pug_debug_line = 1;pug_debug_filename = "static\u002Fjs\u002Ftemplates\u002Frender_index.pug";
pug_html = pug_html + "\u003Cnav class=\"menu\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "static\u002Fjs\u002Ftemplates\u002Frender_index.pug";
pug_html = pug_html + "\u003Ca class=\"block accented bigger\" data-page=\"game\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "static\u002Fjs\u002Ftemplates\u002Frender_index.pug";
pug_html = pug_html + "Играть\u003C\u002Fa\u003E";
;pug_debug_line = 3;pug_debug_filename = "static\u002Fjs\u002Ftemplates\u002Frender_index.pug";
pug_html = pug_html + "\u003Ca class=\"block leaders\" data-page=\"leaders\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "static\u002Fjs\u002Ftemplates\u002Frender_index.pug";
pug_html = pug_html + "Лидеры\u003C\u002Fa\u003E";
;pug_debug_line = 4;pug_debug_filename = "static\u002Fjs\u002Ftemplates\u002Frender_index.pug";
pug_html = pug_html + "\u003Ca class=\"block about\" data-page=\"about\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "static\u002Fjs\u002Ftemplates\u002Frender_index.pug";
pug_html = pug_html + "Об игре\u003C\u002Fa\u003E\u003C\u002Fnav\u003E";} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;}