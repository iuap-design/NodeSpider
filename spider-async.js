//async插件版

var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var concurrencyCount = 0;
var i = 0;
var url = "http://www.bootcdn.cn/Swiper/";
//初始url

function fetchPage(x) { //封装了一层函数
    startRequest(x);
}



var DIRNAME = url.split('/')[url.split('/').length - 2].toLowerCase();

if (fs.existsSync('./data/')) {
    // console.log('已经创建过此更新目录了');
} else {
    fs.mkdirSync('./data/');
    console.log('data目录已创建成功\n');
}
if (fs.existsSync('./jsonconfig/')) {
    // console.log('已经创建过此更新目录了');
} else {
    fs.mkdirSync('./jsonconfig/');
    console.log('jsonconfig目录已创建成功\n');
}

if (fs.existsSync('./data/' + DIRNAME + "/")) {
    // console.log('已经创建过此更新目录了');
} else {
    fs.mkdirSync('./data/' + DIRNAME + "/");
    console.log('目录已创建成功\n');
}

function startRequest(x) {
    //采用http模块向服务器发起一次get请求
    http.get(x, function(res) {
        var html = ''; //用来存储请求网页的整个html内容
        var titles = [];
        res.setEncoding('utf-8'); //防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data', function(chunk) {
            html += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function() {

            var $ = cheerio.load(html),
                name = url.split('/')[url.split('/').length - 2].toLowerCase(),
                json = {},
                versoins = [],
                urls = []; //采用cheerio模块解析html

            json = {
                name: name,
                download: {}
            }
            $('.container>h3').each(function() {
                var $this = $(this),
                    title = $this.text().trim(),
                    version = title.split('：')[1],
                    fileName = [],
                    d_json = {};
                var news_item = {
                    //获取文章的标题
                    title: title,
                    //i是用来判断获取了多少篇文章
                    i: i = i + 1,
                };
                $this.next().find('.library-url').each(function() {
                    var link = $(this).html(),
                        link_arry = link.split('/'),
                        filename = '/'+link_arry[link_arry.length - 1];
                    // savedContent(link, title);
                    urls.push(link);
                    fileName.push(filename);
                })
                json['download'][version] = fileName;
                versoins.push(version);
                if (i > 15) {
                    return false;
                }
            });
            async.mapLimit(urls, 5, function(url, callback) {
                savedContent(url, callback);
            }, function(err, result) {
                console.log("conglatulation! it's completed!");
            });
            json['version'] = versoins;

            if (fs.existsSync('./jsonconfig/' + name + "/")) {
                // console.log('已经创建过此更新目录了');
            } else {
                fs.mkdirSync('./jsonconfig/' + name + "/");
                console.log('jsonconfig更新目录已创建成功\n');
            }
            fs.writeFile('./jsonconfig/' + name + "/index.json", JSON.stringify(json), 'utf-8', function(err) {
                if (err) {
                    console.log(err);
                }
            });
        });
    }).on('error', function(err) {
        console.log(err);
    });
}

function savedContent(link, callback) {
    link = "http://" + link.split('://')[1];
    var delay = parseInt((Math.random() * 10000000) % 2000, 10);
    concurrencyCount++;
    console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');
    setTimeout(function() {
        concurrencyCount--;
        request(link, function(error, response, html) {
            var $ = cheerio.load(html); //采用cheerio模块解析html

            var array = link.split('/');
            var name = array[array.length - 1];
            var dir_name = array[4];
            if (fs.existsSync('./data/' + DIRNAME + "/" + dir_name + "/")) {
                // console.log('已经创建过此更新目录了');
            } else {
                fs.mkdirSync('./data/' + DIRNAME + "/" + dir_name + "/");
            }
            fs.writeFileSync('./data/' + DIRNAME + "/" + dir_name + "/" + name, html, 'utf-8', function(err) {
                if (err) {
                    console.log(err);
                }
            });
        });
        callback(null, url + ' html content');

    }, delay);

}

//该函数的作用：在本地存储所爬取到的图片资源
// function savedImg($, news_title) {
//     var i = 0;
//     $('.main_img.img-hover').each(function(index, item) {
//         var img_title = $(this).closest('li').attr('data-title').trim(); //获取图片的标题
//         if (img_title.length > 35 || img_title == "") {
//             img_title = "Null";
//         }
//         var img_filename = img_title + '.jpg';
//         var img_src = $(this).attr('src'); //获取图片的url
//
//         //采用request模块，向服务器发起一次请求，获取图片资源
//         request.head(img_src, function(err, res, body) {
//             if (err) {
//                 console.log(err);
//             }
//         });
//         request(img_src).pipe(fs.createWriteStream('./image/' + img_filename)); //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
//         if (i > 10) {
//             return false;
//         }
//     })
// }
// function openImage(url) {
//     console.log(url);
//     request(url, function(error, response, body) {
//         if (!error && response.statusCode == 200) {
//             var $ = cheerio.load(body); //采用cheerio模块解析html
//             console.log(body);
//             savedImg($);
//             // console.log(body);
//         }
//     })
//
// }
// openImage(url);
fetchPage(url); //主程序开始运行
