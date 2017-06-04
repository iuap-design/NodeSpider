var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var i = 0;
var url = "http://www.bootcdn.cn/react/";
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


            // var time = $('.container>h3').text().trim();
            //
            // var news_item = {
            //     //获取文章的标题
            //     title: $('div.article-title a').text().trim(),
            //     //获取文章发布的时间
            //     Time: time,
            //     //获取当前文章的url
            //     link: "http://www.ss.pku.edu.cn" + $("div.article-title a").attr('href'),
            //     //获取供稿单位
            //     author: $('[title=供稿]').text().trim(),
            //     //i是用来判断获取了多少篇文章
            //     i: i = i + 1,
            //
            // };
            //
            // console.log(news_item); //打印新闻信息
            // var news_title = $('div.article-title a').text().trim();
            //
            // savedContent($, news_title); //存储每篇文章的内容及文章标题
            //
            // savedImg($, news_title); //存储每篇文章的图片及图片标题
            //
            // //下一篇文章的url
            // var nextLink = "http://www.ss.pku.edu.cn" + $("li.next a").attr('href');
            // str1 = nextLink.split('-'); //去除掉url后面的中文
            // str = encodeURI(str1[0]);
            // //这是亮点之一，通过控制I,可以控制爬取多少篇文章.
            // if (i <= 500) {
            //     fetchPage(str);
            // }
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
//该函数的作用：在本地存储所爬取的新闻内容资源
// function savedContent($, news_title) {
//     $('.article-content p').each(function(index, item) {
//         var x = $(this).text();
//         var y = x.substring(0, 2).trim();
//         if (y == '') {
//             x = x + '\n';
//             //将新闻文本内容一段一段添加到/data文件夹下，并用新闻的标题来命名文件
//             fs.appendFile('./data/' + news_title + '.txt', x, 'utf-8', function(err) {
//                 if (err) {
//                     console.log(err);
//                 }
//             });
//         }
//     })
// }
//该函数的作用：在本地存储所爬取到的图片资源
function savedImg($, news_title) {
    $('.article-content img').each(function(index, item) {
        var img_title = $(this).parent().next().text().trim(); //获取图片的标题
        if (img_title.length > 35 || img_title == "") {
            img_title = "Null";
        }
        var img_filename = img_title + '.jpg';
        var img_src = 'http://www.ss.pku.edu.cn' + $(this).attr('src'); //获取图片的url
        //采用request模块，向服务器发起一次请求，获取图片资源
        request.head(img_src, function(err, res, body) {
            if (err) {
                console.log(err);
            }
        });
        request(img_src).pipe(fs.createWriteStream('./image/' + news_title + '---' + img_filename)); //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
    })
}
fetchPage(url); //主程序开始运行
