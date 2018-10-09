//获取应用实例
const app = getApp()

Page({
  data: {
    list: [],
    station: [],
    searchList: [],
    searchLineList: [],
  },

  // 查询路线
  bindKeyInput (val) {
    let searchList = this.data.list.filter(v => v.indexOf(val.detail.value.toUpperCase()) > -1)
    this.setData({ searchList: searchList })
    let searchLineList = this.data.station.filter(v => v.indexOf(val.detail.value.toUpperCase()) > -1)
    this.setData({ searchLineList: searchLineList })
  },
  onLoad () {
    wx.request({
      url: `${app.globalData.busUrl}/list`,
      success: (resp) => {
        let arr = resp.data.split(',');
        this.setData({ list: arr})
      }
    })
    wx.request({
      url: `${app.globalData.busUrl}/stationList`,
      success: (resp) => {
        let arr = resp.data.split(',');
        this.setData({ station: arr })
      }
    })
  }
})