//获取应用实例
const app = getApp()

Page({
  data: {
    linename: 0,
    flag: 0,
    list: []
  },
  switch () {
    let flag = this.data.flag ? 0 : 1
    this.setData({ flag })
  },
  siteAndResult(linename, flag) {
    let that = this;
    wx.cloud.callFunction({
      name: 'siteAndResult',
      data: {
        linename: linename,
        flag: flag,
      },
      success: res => {
        console.log(res.result.list)
        res.result.list = res.result.list.map(v => {
          let stationlist = v.stationlist.map(vv => {
            let hasBus = false
            if (v.buslist.some(v3 => v3.stationname === vv.STATIONNAME)) {
              hasBus = true
            }
            return { ...vv, hasBus }
          })
          return { ...v, stationlist }
        })
        that.setData({list: res.result.list})
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
  },
  onPullDownRefresh: function () {
    wx.showLoading({ title: '数据更新中' })
    this.siteAndResult(this.data.linename, 1)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { linename } = {...options};
    // 获得所有的业务线
    this.setData({ linename: linename, flag: 0 })
    wx.showLoading({ title: '数据加载中' })
    this.siteAndResult(linename, 1)
  },
  onUnload() {
    wx.hideLoading();
  }
})