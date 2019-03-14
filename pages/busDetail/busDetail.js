//获取应用实例
const app = getApp()

Page({
  data: {
    id: 0,
    line: 0,
    up: true,
    curLine: {},
    list: [],
    bus: []
  },
  switch () {
    let up = !this.data.up
    let list = up ? this.data.curLine.UpStation.map(v => ({ ...v, hidden: true })) : this.data.curLine.DownStation.map(v => ({ ...v, hidden: true }))
    this.setData({ up: up, list: [...list]})
    this.getBus(this.data.curLine.LineId, up)
  },
  hidden (e) {
    const { id } = { ...e.currentTarget.dataset}
    let list  = this.data.list.map(v => {
      if (v.StationPointId === id) {
        return { ...v, hidden: !v.hidden }
      } else {
        return v
      }
    })
    this.setData({ list: list})
  },
  getLine (id, up) {
    wx.request({
      url: `${app.globalData.busUrl}/detail?lineName=${id}`,
      success: (res) => {
        this.setData({
          curLine: res.data
        })
        this.getBus(res.data.LineId, up)
      }
    })
  },
  getBus(line, up) {
    wx.request({
      url: `${app.globalData.busUrl}/lineDetail?lineID=${line}&isUp=${up}`,
      success: (res) => {
        let list = up ? this.data.curLine.UpStation.map(v => ({ ...v, hidden: true })) : this.data.curLine.DownStation.map(v => ({ ...v, hidden: true }))
        this.setData({list: [...list], bus: res.data})
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id, line, up } = { ...options};
    // 获得所有的业务线
    this.setData({ id: id, line: line, up: up})
    this.getLine(id, up)
  }
})