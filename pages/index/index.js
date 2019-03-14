//index.js
//获取应用实例
const app = getApp()
// 引入SDK核心类
let QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
let qqmapsdk;
// 引入工具类
let utils = require('../../utils/util.js');

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    tableData: []
  },
  // 跳转到搜索列表
  bindKeyInput: function (e) {
    wx.navigateTo({
      url: `/pages/busList/busList`
    })
  },
  // 跳转到站点全部路线列表
  navigateToAll(e) {
    let {name, lat, lng, dis, address } = { ...e.currentTarget.dataset}
    wx.navigateTo({
      url: `/pages/busAll/busAll?address=${address}&name=${name}&lng=${lng}&lat=${lat}&dis=${dis}`
    })
  },
  //事件处理函数
  switch: function(e) {
    let { k, kk } = { ...e.currentTarget.dataset };
    let tableData = [...this.data.tableData];
    if (tableData[k].line[kk].detail.LineName) {
      tableData[k].line[kk].status = tableData[k].line[kk].status == 1 ? 0 : 1;
      this.setData({ tableData: tableData});
    }
  },
  onLoad: function () {
    let _this = this
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: app.globalData.mapKey
    });
    // 查询是否获得了定位授权
    wx.getSetting({
      success(res) {
        let authroize = res.authSetting["scope.userLocation"]
        if (!authroize) {
          wx.getSetting({
            success(res) {
              if (!res.authSetting['scope.userLocation']) {
                wx.authorize({
                  scope: 'scope.userLocation',
                  success() {
                    // 用户已经同意小程序使用定位功能，后续调用 wx.startRecord 接口不会弹窗询问
                  }
                })
              }
            }
          })
        }
      }
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    wx.showLoading({
      title: '数据加载中'
    })

    wx.getLocation({
      type: 'gcj02',
      success: res =>{
        var latitude = res.latitude
        var longitude = res.longitude
        // latitude = utils.GPS.gcj_encrypt(latitude, longitude).lat
        // longitude = utils.GPS.gcj_encrypt(latitude, longitude).lon
        console.log(latitude, longitude)
        wx.cloud.callFunction({
          name: 'api',
          data: {
            lat: latitude,
            lng: longitude,
          },
          success: res => {
            console.log(res.result)
            this.setData({ tableData: res.result })
          },
          fail: res => {
            console.log(res.result)
            wx.showModal({
              title: '提示',
              content: '获取数据失败，请稍后重试',
              success: res => { }
            })
          },
          complete: res => {
            wx.hideLoading();
          }
        })
      }
    })
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  onPullDownRefresh: function () {
    console.log("reload");
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '这是一个实用的小程序',
      path: '/pages/index/index'
    }
  }
})
