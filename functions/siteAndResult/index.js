// 云函数入口文件
const cloud = require('wx-server-sdk')
const request = require('request');

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve, reject) => {
  request.post({
    url: 'http://weixin.hfbus.cn/HFRTB/siteAndResult',
    form: { linename: event.linename, flag: event.flag }
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      resolve(JSON.parse(body).data);
    }
  })
})