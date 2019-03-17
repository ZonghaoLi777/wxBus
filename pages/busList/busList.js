//获取应用实例
const app = getApp()

Page({
  data: {
    searchList: [],
  },

  // 站点查询
  bindKeyInput(e) {
    this.likeQuery(e.detail.value);
  },

  // 查询路线
  likeQuery(site) {
    let that = this
    wx.cloud.callFunction({
      name: 'likeQuery',
      data: {site: site},
      success: res => {
        console.log(res.result)
        that.setData({ searchList: res.result.list })
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
  onLoad() {},
  onUnload() {
    wx.hideLoading();
  }
})