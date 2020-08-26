// pages/chooseLib/chooseLib.js
var util = require('../../utils/util.js');

// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'L3JBZ-DB7RU-YUZVO-2BKPV-32RYH-62FLM' // 必填 
});

Page({

  /**
   * 页面的初始数据
   */
  data: {
      canIUse: wx.canIUse('button.open-type.getUserInfo'),
      name:'',
      createTime:'',
      addr:'',
      memo:'',
      list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 调用函数时，传入new Date()参数，返回值是日期和时间
    var time = util.formatDate(new Date());
    // 再通过setData更改Page()里面的data，动态更新页面的数据
    this.setData({
      nowData: time
    });
    this.getAddress()
    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success(res) {
              that.setData({
                name: res.userInfo.nickName
              })
            }
          })
        }
      }
    })
    this.getRecord()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getRecord()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 获取用户地理位置
   */
  getAddress() {
    let that = this;
    // 地理位置
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        const speed = res.speed
        const accuracy = res.accuracy
        // 调用接口转换成具体位置
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (res) {
            that.setData({
              addr:res.result.address
            })
          },
          fail: function (res) {
            wx.showToast({
              icon:'none',
              title: '获取位置信息失败'
            })
          }
        })
      }
    })
  },

  //云开发获取所有记录
  getList: function () {
     const db = wx.cloud.database() //获取默认数据库的引用

    //获取counters的所有记录
     db.collection('counters').get({
       success: function (res) {
         // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
         console.log(res.data)
       }
     })
  },

  //新增考勤记录
  handleAdd(){
    wx.showLoading({
      title: '打卡中',
    })
    let that = this
    const db = wx.cloud.database() //获取默认数据库的引用
    db.collection('record').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          addr: that.data.addr,
          createTime: util.formatTime(new Date()),
          name: that.data.name,
          memo:''
        },
        success: function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '打卡成功'
          })
          that.getRecord()
        }
      })
  },

  //获取当天的考勤记录
  getRecord() {
    let that = this
    const db = wx.cloud.database() //获取默认数据库的引用
    const _ = db.command
    const time = util.formatDate(new Date())
    //获取记录
    db.collection('record').where({
      createTime: _.gte(time + ' 00:00:00').and(_.lte(time + ' 23:59:59'))
    }).get({
       success: function (res) {
          that.setData({
            list: res.data
          })
      }
  })
  }
})