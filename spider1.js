var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var Promise = require('promise');
var i = 0;
var url = "http://www.bootcdn.cn/react/";
// var url = "https://image.baidu.com/search/index?tn=baiduimage&ct=201326592&lm=-1&cl=2&ie=gbk&word=%C3%C0%C5%AE&fr=ala&ala=1&alatpl=adress&pos=0&hs=2&xthttps=111111";

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

            var $ = cheerio.load(html),
                name = url.split('/')[url.split('/').length - 2],
                json = {},
                versoins = []; //采用cheerio模块解析html

            json = {
                name: name,
                download: {

                }
            }
            // console.log($($('.container>h3')[i]).html());

            // $($('.container>h3')[i]).each(function() {
            (async() => {
                $('.library-url').each(function() {
                    var link = $(this).html(),
                        link_arry = link.split('/'),
                        filename = link_arry[link_arry.length - 1];

                    var getPoster = function(link) {

                        return new Promise(function(resolve, reject) {
                            request(link, function(error, response, html) {
                                if (error) return reject(error);

                                resolve(html);
                            })
                        });
                    };

                    console.log("begin:" + link);
                    // var pro = new Promise(function(resolve, reject) {
                    //     request(link, function(error, response, html) {
                    //         if (error) {
                    //             reject(error);
                    //         } else {
                    //             console.log("end:"+link);
                    //             resolve(html);
                    //         }
                    //     });
                    //
                    // })

                    var html = await getPoster(link);

                    console.log("end:" + link);

                    var $ = cheerio.load(html); //采用cheerio模块解析html

                    var array = link.split('/');
                    var name = array[array.length - 1];
                    var dir_name = array[4];
                    if (fs.existsSync('./data/' + dir_name + "/")) {
                        // console.log('已经创建过此更新目录了');
                    } else {
                        fs.mkdirSync('./data/' + dir_name + "/");
                        console.log('更新目录已创建成功\n');
                    }
                    fs.writeFile('./data/' + dir_name + "/" + name, html, 'utf-8', function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });

                    if (i > 80) {
                        return false;
                    }
                    i++;
                })
            })();



        })

    }).on('error', function(err) {
        console.log(err);
    });
}

//保存每个版本的内容
function savedContent(link, title) {
    link = "http://" + link.split('://')[1];
    console.log("begin:" + link);
    // var pro = new Promise(function(resolve, reject) {
    //     request(link, function(error, response, html) {
    //         if (error) {
    //             reject(error);
    //         } else {
    //             console.log("end:"+link);
    //             resolve(html);
    //         }
    //     });
    //
    // })
    var getPoster = function(link) {

        return new Promise(function(resolve, reject) {
            request(link, function(error, response, html) {
                if (error) return reject(error);

                resolve(html);
            })
        });
    };

    (async() => {
        var html = await getPoster(link);

        console.log("end:" + link);

        var $ = cheerio.load(html); //采用cheerio模块解析html

        var array = link.split('/');
        var name = array[array.length - 1];
        var dir_name = array[4];
        if (fs.existsSync('./data/' + dir_name + "/")) {
            // console.log('已经创建过此更新目录了');
        } else {
            fs.mkdirSync('./data/' + dir_name + "/");
            console.log('更新目录已创建成功\n');
        }
        fs.writeFile('./data/' + dir_name + "/" + name, html, 'utf-8', function(err) {
            if (err) {
                console.log(err);
            }
        });
    })();

    // pro.then(
    //         // 记录被填充的值
    //         function(html) {
    //             var $ = cheerio.load(html); //采用cheerio模块解析html
    //
    //             var array = link.split('/');
    //             var name = array[array.length - 1];
    //             var dir_name = array[4];
    //             if (fs.existsSync('./data/' + dir_name + "/")) {
    //                 // console.log('已经创建过此更新目录了');
    //             } else {
    //                 fs.mkdirSync('./data/' + dir_name + "/");
    //                 console.log('更新目录已创建成功\n');
    //             }
    //             fs.writeFile('./data/' + dir_name + "/" + name, html, 'utf-8', function(err) {
    //                 if (err) {
    //                     console.log(err);
    //                 }
    //             });
    //             // if(i<10){
    //             //     fetchPage(url);
    //             // }
    //         })
    //     .catch(
    //         // 记录被拒绝的理由（异常信息）
    //         function(reason) {
    //             console.log('Handle rejected promise (' + reason + ') here.');
    //         });



    // request(link, function(error, response, html) {
    //     var $ = cheerio.load(html); //采用cheerio模块解析html
    //
    //     var array = link.split('/');
    //     var name = array[array.length - 1];
    //     var dir_name = title.split('：')[1];
    //     if (fs.existsSync('./data/' + dir_name + "/")) {
    //         // console.log('已经创建过此更新目录了');
    //     } else {
    //         fs.mkdirSync('./data/' + dir_name + "/");
    //         console.log('更新目录已创建成功\n');
    //     }
    //     fs.writeFile('./data/' + dir_name + "/" + name, html, 'utf-8', function(err) {
    //         if (err) {
    //             console.log(err);
    //         }
    //     });
    //     // if(i<10){
    //     //     fetchPage(url);
    //     // }
    //
    // });

    // http.get(link, function(res) {
    //     var html = ''; //用来存储请求网页的整个html内容
    //     res.setEncoding('utf-8'); //防止中文乱码
    //     //监听data事件，每次取一块数据
    //     res.on('data', function(chunk) {
    //         html += chunk;
    //     });
    //     //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
    //     res.on('end', function() {
    //         var $ = cheerio.load(html); //采用cheerio模块解析html
    //
    //         var array = link.split('/');
    //         var name = array[array.length - 1];
    //         var dir_name = array[4];
    //         if (fs.existsSync('./data/' + dir_name + "/")) {
    //             // console.log('已经创建过此更新目录了');
    //         } else {
    //             fs.mkdirSync('./data/' + dir_name + "/");
    //             console.log('更新目录已创建成功\n');
    //         }
    //         fs.writeFile('./data/' + dir_name + "/" + name, html, 'utf-8', function(err) {
    //             if (err) {
    //                 console.log(err);
    //             }
    //         });
    //         // if(i<10){
    //         //     fetchPage(url);
    //         // }
    //
    //
    //     });
    //
    // }).on('error', function(err) {
    //     console.log(err);
    // });
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
fetchPage(url); //主程序开始运行
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
