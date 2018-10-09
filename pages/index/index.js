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
    let _this = this
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
    qqmapsdk.search({
      keyword: '公交站',
      success: function (res) {
        let arr = utils.allLine.split(',')
        let data = res.data.map(v => {
          return {
            line: v.address.split(',').filter(v => arr.indexOf(v) > -1),
            name: v.title.slice(0, -5),
            address: v.address,
            location: v.location,
            dis: utils.formatDis(v._distance) 
          }
        }).filter(v => v.line.length).sort((a, b) => a._distance - b._distance).splice(0, 4)
        data.forEach((v, k) => {
          v.address = v.line.join(',');
          v.line = v.line.map(vv => ({ name: vv, detail: {}, status: 0 }))
          _this.setData({ tableData: data })
          v.line.forEach((vv,kk) => {
            wx.request({
              url: `${app.globalData.busUrl}/detail?lineName=${vv.name}`,
              success (res) {
                let tableData = _this.data.tableData
                tableData[k].line[kk].detail = {...res.data}
                _this.setData({ tableData: tableData})
              },
              fail () {
                wx.showModal({
                  title: '提示',
                  content: '获取具体线路信息失败，请稍后重试',
                  success: res => { }
                })
              }
            })
          })
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '获取数据失败，请稍后重试',
          success: res => { }
        })
      },
      complete () {
        wx.hideLoading();
      }
    });
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
