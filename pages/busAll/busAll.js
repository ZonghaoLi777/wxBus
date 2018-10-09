// pages/busAll/busAll.js
//获取应用实例
const app = getApp()
Page({
  data: {
    Height: 0,
    scale: 18,
    latitude: "",
    longitude: "",
    markers: [],
    tableData: {}
  },
  // 点击标记
  markertap () {
    console.log(1);
  },
  // 换向
  switch: function (e) {
    const { vid } = { ...e.currentTarget.dataset }
    let tableData = { ...this.data.tableData }
    console.log(tableData)
    tableData.detail = tableData.detail.map(vv => {
      if (vv.id === vid) {
        return ({
          ...vv,
          status: !vv.status
        })
      } else {
        return vv
      }
    })
    this.setData({
      tableData: { ...tableData}
    })
  },
  onReady: function (e) {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('myMap')
  },
  onLoad: function (options) {
    let _this = this;
    let data = { ...options}
    wx.request({
      url: `${app.globalData.busUrl}/siteList?sitename=${data.name}&flag=0`,
      success: (res) => {
        let list = res.data.data.list || [];
        console.log(list)
        _this.setData({
          tableData: {...data, list: list}
        })
      }
    })
    this.setData({
      latitude: options.lat,
      longitude: options.lng,
      markers: [{
        id: "1",
        latitude: options.lat,
        longitude: options.lng,
        iconPath: "/assests/img/location.png",
        width: 50,
        height: 50,
        title: options.name, 
      }]
    })
  }
})