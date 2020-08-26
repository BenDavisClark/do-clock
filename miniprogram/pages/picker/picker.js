Page({
    data: {
        date: '',
        list: []
    },
    bindDateChange: function(e) {
        this.setData({
            date: e.detail.value
        })
        this.getRecord()
    },

  //获取某月的考勤记录
  getRecord() {
    let that = this
    const db = wx.cloud.database() //获取默认数据库的引用
    const _ = db.command
    //获取记录
    db.collection('record').where({
      createTime: _.gte(`${this.data.date}-01` + ' 00:00:00').and(_.lte(`${this.data.date}-31` + ' 23:59:59'))
    }).get({
      success: function (res) {
        that.setData({
          list: res.data
        })
      }
    })
  }
});