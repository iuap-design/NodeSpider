const fs = require('fs');
const OSS = require('ali-oss');
const ossConfig = require('./ossConfig.json');



let client = new OSS(ossConfig);


/**
 * 2、增量上传到CDN
 * "http://iuap-design-cdn.oss-cn-beijing.aliyuncs.com/static/tinper-bee/components/bee-button/dist/v2.0.1/demo.js"
 */
function putCDN(putUrl, filePath) {
    client.put(putUrl, filePath).then(data => {
        fs.appendFileSync('./update.txt',`${putUrl} \n`,'utf8')
        console.log(`😀${filePath} 上传成功 ${putUrl}`)
    }).catch(function (err) {
        console.error(`❌ ${filePath} 上传失败`, err);
        fs.appendFile('./cdnError.txt', `❌ ${filePath} 上传失败\n`);
    });
}





client.head('static/react-dom/16.0.1/umd/react-dom.production.min.js').then((result) => {
    if (result.res.status == 200) {//cdn已有此文件
      console.log(` 已存在，跳过 `);
      return true
    }else{
        console.log('不存在')
    }
})