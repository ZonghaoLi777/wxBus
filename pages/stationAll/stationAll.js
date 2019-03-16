//index.js
//获取应用实例
const app = getApp()
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
// 引入工具类
var utils = require('../../utils/util.js');

Page({
  data: {
    tableDate: []
  },
  // 跳转到站点全部路线列表
  navigateToAll(e) {
    let { adress, name, lat, lng, dis } = { ...e.currentTarget.dataset }
    wx.navigateTo({
      url: `/pages/busAll/busAll?address=${adress}&name=${name}&lng=${lng}&lat=${lat}&dis=${dis}`
    })
  },
  onLoad: function () {
    let _this = this
    wx.showLoading({
      title: '数据加载中'
    })
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: app.globalData.mapKey
    });
    // 调用接口
    qqmapsdk.search({
      keyword: '公交站',
      success: res => {
        wx.hideLoading();
        let tableDate = res.data.map(v => {
          return {
            ...v,
            name: v.title.slice(0, -5),
            dis: utils.formatDis(v._distance)
          }
        })
        this.setData({ tableDate });
      }
    });
  }
})