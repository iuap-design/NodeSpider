//await

var http = require("http");
var fs = require("fs");
var cheerio = require("cheerio");
var request = require("request");
var concurrencyCount = 0;
var json = "./data.json";
var config = "./jsonconfig/index.json";
// var url = "http://www.bootcdn.cn/react/";
var mkdirs = require("jm-mkdirs");
var defaut_image =
  "http://iuap-design-cdn.oss-cn-beijing.aliyuncs.com/static/cdnconfig/default.png";
var json_urls = JSON.parse(fs.readFileSync(json, "utf8")).urls;
var config_all_data = JSON.parse(fs.readFileSync(config, "utf8"));
var config_data = config_all_data.prod;
var flag = false;
//初始url
var fetchPage = function(url, array, bool) {
  //封装了一层函数
  var DIRNAME = url.split("/")[url.split("/").length - 2].toLowerCase();
  if (!fs.existsSync("./data/")) {
    fs.mkdirSync("./data/");
  }
  if (!fs.existsSync("./jsonconfig/")) {
    fs.mkdirSync("./jsonconfig/");
  }

  if (!fs.existsSync("./data/" + DIRNAME + "/")) {
    fs.mkdirSync("./data/" + DIRNAME + "/");
  }
  try {
    if (array.indexOf(DIRNAME) === -1) {
      flag = true;
    } else {
      flag = false;
    }
  } catch (error) {
    flag = false;
  }

  startRequest(url, DIRNAME, flag, bool);
};

var getHtml = function(url) {
  return new Promise(function(resolve, reject) {
    request(url, function(error, response, html) {
      var $ = cheerio.load(html); //采用cheerio模块解析html
      // callback(undefined, html);
      resolve(html);
    });
  });
};

var startRequest = async function(url, DIRNAME, flag, bool) {
  var data = [],
    i = 0,
    //采用http模块向服务器发起一次get请求
    html = await getHtml(url),
    $ = cheerio.load(html),
    name = url.split("/")[url.split("/").length - 2].toLowerCase(),
    json = {},
    versoins = [],
    urls = []; //采用cheerio模块解析html

  json = {
    name: name,
    download: {}
  };
  if (flag) {
    var config_item = {
      name: name,
      image: defaut_image,
      desc: $(".container.jumbotron>p").html()
    };
    config_data.push(config_item);
  }
  if (bool) {
    config_all_data["prod"] = config_data;
    fs.writeFileSync(
        "./jsonconfig/index.json",
        JSON.stringify(config_all_data),
        "utf-8",
        function(err) {
          if (err) {
            console.log(err);
          }
        }
      );
  }
  $(".container>h3").each(function() {
    var $this = $(this),
      title = $this.text().trim(),
      version = title.split("：")[1],
      fileName = [],
      d_json = {},
      url = [],
      obj = {};
    var news_item = {
      //获取文章的标题
      title: title,
      //i是用来判断获取了多少篇文章
      i: (i = i + 1)
    };
    $this
      .next()
      .find(".library-url")
      .each(function() {
        var link = $(this).html(),
          link_arry = link.split(version + "/"),
          filename = "/" + link_arry[link_arry.length - 1];
        urls.push(link);
        url.push(link);
        fileName.push(filename);
      });
    json["download"][version] = fileName;
    versoins.push(version);
    obj["version"] = version;
    obj["url"] = url;
    data.push(obj);
    if (i > 0) {
      return false;
    }
  });
  var readFileFunPromise = function(fileName) {
    return new Promise(function(resolve, reject) {
      var link = "http://" + fileName.split("://")[1];
      request(link, function(error, response, html) {
        try {
          resolve(html);
        } catch (error) {
          console.log(error);
        }
      });
    });
  };

  var asyncFun = async function() {
    for (var index = 0; index < data.length; index++) {
      var urls = data[index].url,
        version = data[index].version;

      for (var i = 0; i < urls.length; i++) {
        var link = "http://" + urls[i].split("://")[1];
        var fileData = await readFileFunPromise(urls[i]);
        console.log(link);
        var array = link.split(version + "/");
        var name = array[array.length - 1];
        var name_array = name.split("/");
        var dir_name;
        try {
          if (name_array.length > 1) {
            name = name_array.pop();
            dir_name = name_array.join("/");
            var source =
              "./data/" + DIRNAME + "/" + version + "/" + dir_name + "/";
            if (!fs.existsSync(source)) {
              mkdirs.sync(source);
            } else {
            }
            fs.writeFileSync(source + name, fileData, "utf-8", function(err) {
              if (err) {
                console.log(err);
              }
            });
          } else {
            dir_name = array[1];
            var source = "./data/" + DIRNAME + "/" + version;
            if (fs.existsSync(source)) {
              // console.log('已经创建过此更新目录了');
            } else {
              fs.mkdirSync(source);
            }
            fs.writeFileSync(source + "/" + name, fileData, "utf-8", function(
              err
            ) {
              if (err) {
                console.log(err);
              }
            });
          }
        } catch (error) {
          // console.log(error)
        }
      }
    }
  };
  asyncFun();
  json["version"] = versoins;

  if (fs.existsSync("./jsonconfig/" + name + "/")) {
    // console.log('已经创建过此更新目录了');
  } else {
    fs.mkdirSync("./jsonconfig/" + name + "/");
    console.log("jsonconfig更新目录已创建成功\n");
  }
  fs.writeFileSync(
    "./jsonconfig/" + name + "/index.json",
    JSON.stringify(json),
    "utf-8",
    function(err) {
      if (err) {
        console.log(err);
      }
    }
  );
};

function savedContent(link) {
  link = "http://" + link.split("://")[1];
  request(link, function(error, response, html) {
    var $ = cheerio.load(html); //采用cheerio模块解析html
    // callback(undefined, html);
  });
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
// fetchPage(url); //主程序开始运行
var getUrl = function(json_urls) {
  var config_name_arr = getConfigName();
  for (var index = 0; index < json_urls.length; index++) {
    var url = json_urls[index];
    if (index == json_urls.length - 1) {
      fetchPage(url, config_name_arr, true);
    } else {
      fetchPage(url, config_name_arr);
    }
  }
};

var getConfigName = function() {
  var data = [];
  for (
    var config_index = 0;
    config_index < config_data.length;
    config_index++
  ) {
    var config_name = config_data[config_index].name;
    data.push(config_name);
  }
  return data;
};
getUrl(json_urls);
