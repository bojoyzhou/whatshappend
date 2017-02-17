var https = require('https'),
    http = require('http'),
    url = require('url'),
    fs = require('fs'),
    path = require('path');

var jsdom = require("jsdom");
var jquery = fs.readFileSync(path.join(__dirname, "./lib/jq.js"), "utf-8");

function site(kw, href) {
    var mod = http
    if (href.match(/^https/)) {
        mod = https
    }
    var option = url.parse(href)
    var host = option.host
    var pathname = option.pathname
    option.headers = {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
    }
    mod.get(option, function(res) {
        var chunk = Buffer.alloc(0);
        res.on('data', function(d) {
            chunk = Buffer.concat([chunk, d])
        });
        res.on('end', function() {
            jsdom.env({
                html: chunk.toString(),
                src: [jquery],
                done: function(err, window) {
                    var $ = window.$;
                    $('style, script, meta, noscript').remove()
                    var module = require('./site-module/' + host)
                    var ret = module(pathname, $)
                    console.log(ret.content)
                    window.close();
                    global.gc && global.gc();
                }
            });
        });
    })
}
site('', 'http://www.dailymail.co.uk/tvshowbiz/article-4231876/Harry-Potter-s-Scarlett-Byrne-shows-perky-posterior.html');
