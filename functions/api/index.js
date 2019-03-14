// 云函数入口文件
const cloud = require('wx-server-sdk');
const request = require('request'); 

cloud.init();

// 获得附近公交路线
exports.main = (event, context) => new Promise((resolve, reject) => {
  request.post({
    url: 'http://weixin.hfbus.cn/HFRTB/nearLineQuery',
    form: { lat: event.lat, lng: event.lng}
    // form: { lat: 31.820587, lng: 117.227239}
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      resolve(JSON.parse(body).data.list);
    }
  })
})
exports.main()