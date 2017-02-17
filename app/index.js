var https = require('https'),
    path = require('path'),
    fs = require('fs'),
    url = require('url');

var jsdom = require("jsdom");

var dirname = path.join(__dirname, 'data')
var contries = {
    UnitedKingdom: 'ajax=1&pn=p9&htd=&htv=l&',
    Australia: 'ajax=1&pn=p8&htd=&htv=l&',
    UnitedStates: 'ajax=1&pn=p1&htd=&htv=l&',
    Canada: 'ajax=1&pn=p13&htd=&htv=l&'
}

function getKeywords(params, callback) {
    var option = {
        host: 'trends.google.com',
        port: 443,
        path: '/trends/hottrends/hotItems',
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        }
    }
    var req = https.request(option, function(res) {
        var chunk = Buffer.alloc(0);
        res.on('data', function(d) {
            chunk = Buffer.concat([chunk, d])
        });
        res.on('end', function() {
            handle(JSON.parse(chunk.toString()), callback)
        });
    });

    req.write(params);
    req.end();
}

function handle(ret, callback) {
    ret.trendsByDateList.forEach(function(item) {
        var dirPath = path.join(dirname, item.date),
            keywordsFile = path.join(dirPath, '.keywords');
        var keywords = {},
            keywordsString = ''
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath)
        } else {
            if (fs.existsSync(keywordsFile)) {
                keywordsString = fs.readFileSync(keywordsFile).toString()
                keywords = JSON.parse(keywordsString)
            }
        }
        item.trendsList.map(function(trend) {
            keywords[trend.title] = 1
        })
        keywordsString = JSON.stringify(keywords)
        fs.writeFileSync(keywordsFile, keywordsString)
        callback(dirPath, keywords)
    })
}

var jquery = fs.readFileSync(path.join(__dirname, "./lib/jq.js"), "utf-8");

function crawlerKeyword(docPath, keyword, callback) {
    var option = {
        host: 'www.google.com',
        port: 443,
        path: '/search?q=' + encodeURIComponent(keyword) + '&tbm=nws',
        method: 'GET',
        headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
        }
    }
    var req = https.get(option, function(res) {
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
                    var ret = [];
                    $("h3 a, .card-section a").map(function(c, a) {
                        var href = $(a).attr('href'),
                            title = $(a).text(),
                            fileName = path.join(docPath, title.replace(/\W+/g, '-') + '.tmp');
                        if (title && href && !fs.existsSync(fileName)) {
                            fs.writeFileSync(fileName, href)
                            console.log(keyword, href)
                        }
                    });
                    window.close();
                    global.gc();
                    callback(keyword);
                }
            });
        });
    })
}

for (var i in contries) {
    getKeywords(contries[i], function(dirPath, keywords) {
        funcwrapper(dirPath, Object.keys(keywords))
    })
}

function funcwrapper(dirPath, keywords){
    var kw = keywords.pop()
    if(funcwrapper[kw] && keywords.length){
        return funcwrapper(dirPath, keywords)
    }else if(funcwrapper[kw]){
        return
    }
    funcwrapper[kw] = 1;
    crawlerKeyword(dirPath, kw, function(k){
        if(keywords.length){
            setTimeout(function(){
                funcwrapper(dirPath, keywords)
            });
        }
    })
}

process.on('exit', (code) => {
    console.log(Object.keys(funcwrapper))
    console.log(`About to exit with code: ${code}`);
});
