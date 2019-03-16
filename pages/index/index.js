//index.js
//获取应用实例
const app = getApp()

// 引用百度地图微信小程序JSAPI模块 
var bmap = require('../../utils/bmap-wx.min.js'); 

// 引入工具类
let utils = require('../../utils/util.js');

Page({
  data: {
    markers: [],
    latitude: '',
    longitude: '',
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

    wx.showLoading({
      title: '数据加载中'
    })

    const BMap = new bmap.BMapWX({
      ak: 'ohE2mpSMfPfRTk9yCGW8lC95mUuB4GS0'
    });
    // 发起regeocoding检索请求 
    BMap.regeocoding({
      fail: res => {
        console.log(res);
      },
      success: res => {
        let wxMarkerData = res.wxMarkerData;
        this.setData({
          markers: wxMarkerData,
          latitude: wxMarkerData[0].latitude,
          longitude: wxMarkerData[0].longitude
        })
        wx.cloud.callFunction({
          name: 'nearLineQuery',
          data: {
            lat: wxMarkerData[0].latitude,
            lng: wxMarkerData[0].longitude,
          },
          success: res => {
            console.log(res.result.list)
            this.setData({ tableData: res.result.list })
          },
          fail: res => {
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
    });
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
