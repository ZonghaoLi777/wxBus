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
    tableDate: []
  },
  // 跳转到搜索列表
  bindKeyInput: function (e) {
    wx.navigateTo({
      url: `/pages/busList/busList`
    })
  },
  // 跳转到站点全部路线列表
  navigateToAll(e) {
    let {name, lat, lng, dis } = { ...e.currentTarget.dataset}
    wx.navigateTo({
      url: `/pages/busAll/busAll?name=${name}&lng=${lng}&lat=${lat}&dis=${dis}`
    })
  },
  //事件处理函数
  switch: function(e) {
    let _this = this;
    let { index, name, type } = { ...e.currentTarget.dataset };
    type = type == 1 ? 2 : 1;
    wx.request({
      url: `${app.globalData.busUrl}/siteList?sitename=${name}&flag=${type}`,
      success: (resp) => {
        let list = resp.data.data.list || [];
        if(list.length) {
          list = list.map(v => {
            return { ...v, sbcsj: v.SBCSJ, mbcsj: v.MBCSJ, end_statione_name: v.FSTATION_NAME_ID, linename: v.LINENAME, linetype: v.LINETYPE};
          })
        }
        console.log(list);
        let tableDate = [..._this.data.tableDate]
        tableDate[index].list = list
        _this.setData({
          tableDate: [...tableDate]
        })
      },
      fail () {
        wx.showModal({
          title: '提示',
          content: '获取数据失败，请重试',
          success: res => { }
        })
      }
    })
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
    wx.getLocation({
      type: "gcj02",
      accuracy: "false",
      success (res) {
        console.log(res)
        let lat = res.latitude;
        let lng = res.longitude;
        let obj = utils.GPS.bd_encrypt(lat, lng);
        console.log(obj)
        wx.request({
          url: `${app.globalData.busUrl}/nearLineQuery?lat=${obj.lat.toFixed(14)}&lng=${obj.lon.toFixed(14)}`,
          success: (resp) => {
            let data = resp.data.data.list || [];
            let arr = Array.from(new Set(data.map(v => v.recent_statione_name)));
            arr = arr.map((v, k) => {
              let list = data.filter(vv => vv.recent_statione_name === v)
              qqmapsdk.calculateDistance({
                from: {
                  latitude: lat,
                  longitude: lng
                },
                to: [{
                  latitude: list[0].wd,
                  longitude: list[0].jd
                }],
                success: function (res) {
                  let data = [..._this.data.tableDate];
                  let dis = utils.formatDis(res.result.elements[0].distance);
                  data[k].dis = dis;
                  _this.setData({ tableDate: data });
                },
                complete: function (res) {
                  console.log(res);
                }
              });
              return { name: v, dis: 0, lat: list[0].wd, lng: list[0].jd,  list: list }
            })
            _this.setData({ tableDate: arr })
            console.log(arr)
          }
        })
      },
      fail () {
        wx.showModal({
          title: '注意',
          content: '若不打开定位将无法获得附近公交站点信息',
          success: res => {}
        })
      },
      complete () {
        wx.hideLoading();
      }
    })
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
