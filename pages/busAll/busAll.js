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
    let { kk } = { ...e.currentTarget.dataset };
    let tableData = {...this.data.tableData};
    if (tableData.line[kk].detail.LineName) {
      tableData.line[kk].status = tableData.line[kk].status == 1 ? 0 : 1;
      this.setData({ tableData: tableData });
    }
  },
  onReady: function (e) {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('myMap')
  },
  onLoad: function (options) {
    let _this = this;
    let data = { ...options};
    data.line = data.address.split(',').map(v => ({name: v, status: 0, detail: {}}));
    this.setData({ tableData: data })
    data.line.forEach((v, k) => {
      wx.request({
        url: `${app.globalData.busUrl}/detail?lineName=${v.name}`,
        success(res) {
          let tableData = _this.data.tableData
          tableData.line[k].detail = { ...res.data }
          _this.setData({ tableData: tableData })
        },
        fail() {
          wx.showModal({
            title: '提示',
            content: '获取具体线路信息失败，请稍后重试',
            success: res => { }
          })
        }
      })
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