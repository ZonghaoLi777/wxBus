//获取应用实例
const app = getApp()
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
// 引入工具类
var utils = require('../../utils/util.js');

Page({
  data: {
    list: [],
    station: [],
    searchList: [],
    searchLineList: [],
  },

  // 站点查询
  navigateToAll(e) {
    let { name } = { ...e.currentTarget.dataset };
    qqmapsdk.search({
      keyword: `${name}公交站`,
      success: function (res) {
        let data = res.data[0];
        let address = data.address.split(',').filter(v => utils.allLine.indexOf(v) > -1);
        let lat = data.location.lat;
        let lng = data.location.lng;
        let dis = utils.formatDis(data._distance);
        wx.navigateTo({
          url: `/pages/busAll/busAll?address=${address}&name=${name}&lng=${lng}&lat=${lat}&dis=${dis}`
        })
      },
      fail () {
        wx.showModal({
          title: '提示',
          content: '获取数据失败，请稍后重试',
          success: res => { }
        })
      }
    })
  },

  // 查询路线
  bindKeyInput (val) {
    let searchList = [];
    let searchLineList = [];
    if (val.detail.value) {
      searchList = this.data.list.filter(v => v.indexOf(val.detail.value.toUpperCase()) > -1)
      searchLineList = this.data.station.filter(v => v.indexOf(val.detail.value.toUpperCase()) > -1)
    }
    this.setData({ searchList: searchList, searchLineList: searchLineList })
  },
  onLoad() {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: app.globalData.mapKey
    });
    let arr = utils.allLine.split(',');
    this.setData({ list: arr });
    let arr2 = utils.allStation.split(',');
    this.setData({ station: arr2 });
  }
})