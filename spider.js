var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var i = 0;
// var url = "http://www.bootcdn.cn/react/";
var url = "https://image.baidu.com/search/index?tn=baiduimage&ct=201326592&lm=-1&cl=2&ie=gbk&word=%C3%C0%C5%AE&fr=ala&ala=1&alatpl=adress&pos=0&hs=2&xthttps=111111";

//初始url

function fetchPage(x) { //封装了一层函数
    startRequest(x);
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

            var $ = cheerio.load(html); //采用cheerio模块解析html

            $('.container>h3').each(function() {
                var $this = $(this);
                var news_item = {
                    //获取文章的标题
                    title: $(this).text().trim(),
                    //i是用来判断获取了多少篇文章
                    i: i = i + 1,
                };
                console.log(news_item); //打印新闻信息
                $this.next().find('.library-url').each(function() {
                    savedContent($(this).html(), $this.text().trim());
                })
                // if (i > 1) {
                return false;
                // }
            })

        });

    }).on('error', function(err) {
        console.log(err);
    });

}

function savedContent(url, title) {
    url = "http://" + url.split('://')[1];
    console.log(url);
    http.get(url, function(res) {
        var html = ''; //用来存储请求网页的整个html内容
        res.setEncoding('utf-8'); //防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data', function(chunk) {
            html += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function() {

            var $ = cheerio.load(html); //采用cheerio模块解析html

            var array = url.split('/');
            var name = array[array.length - 1];
            var dir_name = title.split('：')[1];
            if (fs.existsSync('./data/' + dir_name + "/")) {
                // console.log('已经创建过此更新目录了');
            } else {
                fs.mkdirSync('./data/' + dir_name + "/");
                console.log('更新目录已创建成功\n');
            }
            fs.appendFile('./data/' + dir_name + "/" + name, html, 'utf-8', function(err) {
                if (err) {
                    console.log(err);
                }
            });

        });

    }).on('error', function(err) {
        console.log(err);
    });
}

//该函数的作用：在本地存储所爬取到的图片资源
function savedImg($, news_title) {
    var i = 0;
    console.log($('.main_img.img-hover').html());
    $('.main_img.img-hover').each(function(index, item) {

        var img_title = $(this).closest('li').attr('data-title').trim(); //获取图片的标题
        if (img_title.length > 35 || img_title == "") {
            img_title = "Null";
        }
        var img_filename = img_title + '.jpg';
        var img_src = $(this).attr('src'); //获取图片的url


        //采用request模块，向服务器发起一次请求，获取图片资源
        request.head(img_src, function(err, res, body) {
            if (err) {
                console.log(err);
            }
        });
        request(img_src).pipe(fs.createWriteStream('./image/'+ img_filename)); //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
        if (i > 10) {
            return false;
        }
    })
}
// fetchPage(url); //主程序开始运行
function openImage(url) {
    console.log(url);
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body); //采用cheerio模块解析html
            console.log(body);
            savedImg($);
            // console.log(body);
        }
    })

}
openImage(url);
