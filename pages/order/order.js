// pages/order/order.js
import util from '../../utils/util.js';
import request from '../../utils/request.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    requestUrl:{
      // 订单接口
      order:'/order',
      // 面料接口(对应客户)
      fabric:'/fabric/select',
      // 上传花型
      file: '/file',
      // 配置方案
      config:'/config',
      //员工
      user:'/user',
      // 面料,
      // fabricAll: '/fabric',
      //浆料配方
      sizing: '/sizing/sizing'
    },
    // 联系人信息
    userInfo:'',
    // 花型（列表）
    flowerList:[],
    // 面料（列表）
    fabricList:[
      {id: 0,name: '选择面料'}
    ],
    // 快递方式
    deliveryType:[
      {id: 0,name:'物流'},
      {id: 1,name: '自提'}
    ],
    // 面料来源
    fabricType:[
      {id:0,name:'加工'},
      {id:1,name:'经销'}
    ],
    fabricTypeIndex:0,
    fabricIndex: 0,
    deliveryIndex: 0,
    configIndex:0,
    configList:[
      {name:'选择方案',id:0}
    ],
    wwwFileBaseUrl:'',
    flowerUpShow:false,
    date: '2016-09-01',
    price:'',
    size:'',
    allPrice:0,
    note:"",
    // 确认提交还是确认修改，默认提交
    isRevise:false,
    //是否加急,0:否，1:加急
    expedite:0,
    // 订单id---用于修改订单信息
    id: '',
    // 用户身份---true 业务员，可修改所有订单信息,或者厂长新增订单；false 厂长，只能修改备注
    isType:false,
    note2:'',
    note:'',
    filePath:'',
    // 再次下单时判断面料
    againFabricName:'',
    // 再次下单时判断配置方案
    againConfig:'',
    // 再次下单时判断调色员
    againColorBoy:'',
    //再次下单的浆料配方name
    againSizing: '',
    // 用于防止表单重复提交
    bottonClicked:true,
    colorBoyIndex: 0,
    //调色员
    colorBoyList: [
      { name: '选择调色员', id: 0 }
    ],
    //经销面料列表
    jingxiaoList: [],
    jiagongList: [],
    //浆料配方列表
    sizingList: [],
    //浆料配方选择的索引
    sizingIndex: 0,
    mianliaoIndex: true
  },
  //修改是否加急状态
  changeExpedite(e){
    this.setData({
      expedite:e.detail.value?1:0
    })
  },
  //获取浆料配方列表数据
  getSizingList () {
    let data = {
      page: 1,
      rows: 999,
    }
    request.request(this.data.requestUrl.sizing, data, 'get', '', (res) => {
      let arr = [
        {id:0, name: '请选择浆料配方'}
      ]
      arr = arr.concat(res.data.data.list)
      this.setData({
        sizingList: arr
      })
      if (this.data.againSizing) {
        let index = arr.findIndex(item => {
          return item.name === this.data.againSizing
        })
        if (index===-1){
          index = 0
        }
        this.setData({
          sizingIndex: index
        })
      }
    })
  },
  //选择浆料配方
  sizingChange (e) {
    this.setData({
      sizingIndex: e.detail.value
    })
  },
  // 点击选择客户（选择联系人）
  userChange(){
    let _this = this;
    if(_this.data.isType){
      wx.navigateTo({
        url: '/pages/client/clientList/index',
        events: {
          getClientInfo: function (data) {
            let clientInfo = JSON.parse(data.clientInfo).userDetail;
            clientInfo.id = clientInfo.fkUserId;
            _this.setData({
              userInfo: clientInfo
            })
            _this.getFabricList(clientInfo);
            _this.setData({
              colorBoyIndex:0
            })
            if (_this.data.fabricTypeIndex == 0) {
              _this.setData({
                fabricTypeIndex: 0,
                fabricIndex: 0
              })
            }
          },
        },
        success: function (res) {
          res.eventChannel.emit("getClient", { getClient: true })
        }
      })
    }
    // this.setData({
    //   fabricIndex: 0
    // })
  },
  // 选择面料
  bindPickerChange(e){
    this.setData({
      fabricIndex: e.detail.value
    })
  },
  // 选择 面料来源
  bindfabricTypeChange(e){
    this.setData({
      fabricTypeIndex: e.detail.value
    })
    if (this.data.fabricTypeIndex==1){
      // this.getFabricListAll()
      const arr = this.data.jingxiaoList
      console.log('切换到经销'+arr)
      this.setData({
        fabricList: arr
      })
    } else{
      // this.getFabricList(this.data.userInfo)
      this.setData({
        fabricList: this.data.jiagongList
      })
    }
    this.setData({
      fabricIndex: 0
    })
  },
  // 获取加工面料列表
  getFabricListAll () {
    let _this = this;
    let data = {
      page: 1,
      rows: 999,
      fkCustomerId: this.data.userInfo.id == null ? 0 : this.dat.userInfo.id
    }
    request.request(this.data.requestUrl.fabric, data, 'get', '', (res) => {
      const resLength = res.data.data.length
      let list = [
        {
          id: 0,
          name: '选择面料'
        }
      ]
      console.log(res)
      for (let i = 0; i < resLength; i++) {
        if (res.data.data[i].fkCustomerId !== -10) {
          list.push(res.data.data[i])
        }
      }
      _this.setData({
        fabricList: list,
        jiagongList: list,
        wwwFileBaseUrl: res.data.wwwFileBaseUrl
      })
      // if (this.data.fabricTypeIndex === 1) {
      //   const jingxiaoParams = {
      //     page: 1,
      //     rows: 999,
      //     fkCustomerId:-10
      //   }
      //   request.request(this.data.requestUrl.fabric, jingxiaoParams, 'get', '', (res) =>{
      //     _this.setData({
      //       fabricList: res.data.data,
      //       jingxiaoList: res.data.data
      //     })
      //   })
      // }
    })
  },
  //获取经销面料列表
  getJingxiaoList () {
    const jingxiaoParams = {
      page: 1,
      rows: 999,
      fkCustomerId:-10
    }
    request.request(this.data.requestUrl.fabric, jingxiaoParams, 'get', '', (res) => {
      const arr = [
        {
          id: 0,
          name: '选择面料'
        }
      ]
      this.setData({
        jingxiaoList: arr.concat(res.data.data)
      })
    })
  },
  // 选择快递方式
  bindDeliceryChange(e){
    this.setData({
      deliveryIndex: e.detail.value
    })
  },
  // 选择配送时间
  bindDateChange(e){
    this.setData({
      date: e.detail.value
    })
  },
  // 选择配置方案
  configChange(e){
    this.setData({
      configIndex: e.detail.value
    })
  },
  // 选择调色员
  colorBoyChange(e) {
    this.setData({
      colorBoyIndex: e.detail.value
    })
  },
  // 获取面料列表
  getFabricList(userInfo){
    let _this = this;
    let data = {
      page: 1,
      rows: 999,
      fkCustomerId: userInfo.id == null ? 0 : userInfo.id
    }
    console.log(286)
    request.request(this.data.requestUrl.fabric,data,'get','',(res)=>{
      console.log(res)
      const resLength = res.data.data.length
      if (resLength === 0 && this.data.fabricTypeIndex == 0) {
        _this.setData({
          jiagongList: [
            {id:0,
            name:'该客户无面料，请联系管理员添加'}
          ]
        })
        // if(this.data.fabricTypeIndex==0){
        //   _this.setData({
        //     fabricList:this.data.jiagongList
        //   })
        // }else {
        //   data.fkCustomerId = -10
        //   request.request(this.data.requestUrl.fabric, data, 'get', '', (res) => {
        //     console.log(res)
        //     const arrJ = [
        //       {
        //         id: 0,
        //         name: '选择面料'
        //       }
        //     ]
        //     _this.setData({
        //       fabricList: arrJ.concat(res.data.data),
        //       jingxiaoList: arrJ.concat(res.data.data)
        //     })
        //     console.log(this.data)
        //     if (this.data.againFabricName){

        //     }
        //   })
        // }
        return
      }
      let list = [
            {id:0,
          name:'选择面料'}
          ]
      for(let i = 0;i < res.data.data.length;i++){
        list.push(res.data.data[i])
      }
      console.log(_this.data.fabricTypeIndex)
      console.log(this.data.fabricTypeIndex)
      if (_this.data.fabricTypeIndex==1){
        console.log(306)
        _this.setData({
          fabricList: _this.data.jingxiaoList,
          wwwFileBaseUrl: res.data.wwwFileBaseUrl
        })
      } else{
        console.log(313)
        _this.setData({
          fabricList: list,
          wwwFileBaseUrl: res.data.wwwFileBaseUrl
        })
      }
      if(wx.getStorageSync("orderInfo")){
        let orderInfo = wx.getStorageSync("orderInfo");
        let fabricIndex;
        let index = 0;
        list.forEach(item => {
          if (item.name == orderInfo.fabricName) {
            fabricIndex = index
          }
          index++;
        })
        _this.setData({
          fabricIndex: fabricIndex
        })
      }
      if (this.data.againFabricName){
        // const jingxiaoParams = {
        //   page: 1,
        //   rows: 999,
        //   fkCustomerId: -10
        // }
        // request.request(this.data.requestUrl.fabric, jingxiaoParams, 'get', '', (res) => {
        //   this.setData({
        //     fabricList: res.data.data,
        //     jingxiaoList: res.data.data
        //   })
        // })
        let arrList = [
          {
            id: 0,
            name: '选择面料'
          }
        ]
        if (this.data.fabricTypeIndex===1) {
          const jingxiaoParams = {
            page: 1,
            rows: 999,
            fkCustomerId: -10
          }
          request.request(this.data.requestUrl.fabric, jingxiaoParams, 'get', '', (res) => {
            this.setData({
              fabricList: arrList.concat(res.data.data),
              jingxiaoList: arrList.concat(res.data.data)
            })
            let index = this.data.jingxiaoList.findIndex(item => {
              return item.name === this.data.againFabricName
            })
            if (index===-1){
              index=0
            }
            this.setData({
              fabricIndex: index
            })
          })
        } else{
          const jingxiaoParams = {
            page: 1,
            rows: 999,
            fkCustomerId: this.data.userInfo.id
          }
          request.request(this.data.requestUrl.fabric, jingxiaoParams, 'get', '', (res) => {
            this.setData({
              jiagongList: arrList.concat(res.data.data),
              fabricList: arrList.concat(res.data.data)
            })
            let index = this.data.jiagongList.findIndex(item => {
              return item.name === this.data.againFabricName
            })
            if (index === -1) {
              index = 0
            }
            this.setData({
              fabricIndex: index
            })
          })
        }
      }
    })
  },
  // 获取配置方案（页面加载获取）
  getConfigList(){
    let _this = this;
    let data = {
      page: 1,
      rows: 999
    }
    request.request(this.data.requestUrl.config,data,'get','',(res)=>{
      let list = [
        {id: 0,name:'选择配置方案',status:0}
      ]
      if (res.data.data.list.length > 0){
        res.data.data.list.forEach(item=>{
          if(item.status == 0){
            list.push(item)
          }
        })
      }else{
        list = [
          {id: 0 ,name:'暂无配置方案',status:0}
        ]
      }
      if (wx.getStorageSync("orderInfo")) {
        let orderInfo = wx.getStorageSync("orderInfo");
        let configIndex;
        let index = 0;
        list.forEach(item => {
          if (item.name == orderInfo.configName) {
            configIndex = index
          }
          index++;
        })
        _this.setData({
          configIndex: configIndex
        })
      }
      if (this.data.againConfig) {
        let configIndex;
        let index = 0;
        list.forEach(item => {
          if (item.name == this.data.againConfig) {
            configIndex = index
          }
          index++;
        })
        _this.setData({
          configIndex: configIndex
        })
      }
      _this.setData({
        configList: list
      })
    })
  },
  // 获取调色员(页面加载获取)
  getColorBoyList() {
    let _this = this;
    let data = {
      page: 1,
      rows: 999,
      role: 7
    }
    request.request(this.data.requestUrl.user, data, 'get', '', (res) => {
      let list = _this.data.colorBoyList;
      if (res.data.data.list.length>0){
        for (let i = 0; i < res.data.data.list.length; i++) {
          list.push(res.data.data.list[i])
        }
      } else {
        list = [
          { id: 0, name: '暂无调色员', status: 0 }
        ]
      }
      if (wx.getStorageSync("orderInfo")) {
        let orderInfo = wx.getStorageSync("orderInfo");
        let colorBoyIndex;
        let index = 0;
        list.forEach(item => {
          if (item.name == orderInfo.colorName) {
            colorBoyIndex = index
          }
          index++;
        })
        _this.setData({
          colorBoyIndex: colorBoyIndex
        })
      }
      _this.setData({
        colorBoyList: list
      })
      if (this.data.againColorBoy) {
        // let colorBoyIndex;
        // let index = 0;
        // list.forEach(item => {
        //   if (item.name == this.data.againColorBoy) {
        //     colorBoyIndex = index
        //   }
        //   index++;
        // })
        let colorIndex = this.data.colorBoyList.findIndex(item=>{
          return item.name === this.data.againColorBoy
        })
        if (colorIndex===-1){
          colorIndex = 0
        }
        _this.setData({
          colorBoyIndex: colorIndex
        })
      }
    })
  },
  // 删除已选花型
  deleteFlower(e){
    if(this.data.isType){
      let newList = this.data.flowerList;
      newList.splice(e.target.id,1);
      this.setData({
        flowerList : newList
      })
    }
  },
  // 修改花型名称
  flowerNameChange(e){
    let name = e.detail.value;
    let id = e.target.dataset.id;
    this.data.flowerList.forEach(item => {
      if (item.productId == id){
        item.num = name;
      }
    })
  },
  // 点击添加花型
  addFlowerList(){
    let _this = this;
    if(this.data.isType){
      wx.chooseImage({
        success(res){
          let requserImgUrl = res.tempFilePaths[0];
          wx.uploadFile({
            url: request.baseUrl + _this.data.requestUrl.file,
            filePath: requserImgUrl,
            name: 'file',
            header: {
              "token": wx.getStorageSync("token")
            },
            formData: {
              type: 0
            },
            success(res){
              let result = JSON.parse(res.data);
              if (result.code == 0){
                let list = {
                  productId: Math.ceil(Math.random() * 10) + Math.ceil(Math.random() * 10),
                  customContent: result.data,
                  picName: '上传花型'
                }
                let flowerList = _this.data.flowerList;
                flowerList.push(list);
                _this.setData({
                  flowerList: flowerList
                })
              } else if (result.code == -1){
                wx.showToast({
                  title: result.message,
                  icon: 'none',
                  success() {
                    setTimeout(function () {
                      wx.clearStorageSync('token');
                      wx.clearStorageSync('userInfo');
                      wx.navigateTo({
                        url: '/pages/knowLedgeCount/login/login'
                      })
                    }, 1500)
                  }
                })
              } else {
                wx.showToast({
                  title: result.message,
                  icon: 'none'
                })
              }
            }
          })

        }
      })
    }
  },
  // 设置单价
  setPrice(e){
    let value = e.detail.value;
    let size  = this.data.size;
    if (!util.isNumAvailable(value) ){
      wx.showToast({
        title: '请输入正确的单价',
        icon: 'none',
        duration: 2000
      });
    }else{
      this.setData({
        price: value,
        allPrice: parseFloat((value * size).toFixed(2))
      })
    }
  },
  // 设置打印数量
  setSize(e){
    let value = e.detail.value;
    let price = this.data.price;
    if (!util.isNumAvailable(value)) {
      wx.showToast({
        title: '请输入正确的米数',
        icon: 'none',
        duration: 2000
      });
    } else {
      this.setData({
        size: value,
        allPrice: parseFloat((value * price).toFixed(2))
      })
    }
  },
  // 添加备注
  noteChange(e){
    this.setData({
      note: e.detail.value
    })
  },
  // 添加花型路径
  filePathChange(e) {
    this.setData({
      filePath: e.detail.value
    })
  },
  // 订单提交
  orderPost(){
    let num = 0;
    let listLength = 0;
    let flowerMsg = '';
    let _this = this;
    if (this.data.fabricList[this.data.fabricIndex] === undefined) {
      wx.showToast({
        title: '该客户无面料，请联系管理员添加',
        icon: 'none'
      })
      return;
    }
    if(this.data.userInfo.length <= 0){
      wx.showToast({
        title: '请选择客户',
        icon: 'none'
      })
      return;
    }
    if (this.data.filePath == '') {
      wx.showToast({
        title: '请输入花型路径',
        icon: 'none'
      })
      return;
    }
    if (this.data.fabricIndex == 0){
      wx.showToast({
        title: '请选择面料',
        icon:'none'
      })
      return;
    }
    if(this.data.configIndex == 0){
      wx.showToast({
        title: '请选择配置方案',
        icon: 'none'
      })
      return;
    }
    if (this.data.price <= 0){
      wx.showToast({
        title: '请输入正确的单价',
        icon: 'none'
      })
      return;
    }
    if (this.data.size <= 0){
      wx.showToast({
        title: '请输入正确的打印数量',
        icon:'none'
      })
      return;
    }
    listLength = this.data.flowerList.length;
    this.data.flowerList.forEach(item => {
      if(item.num){
        num++
        flowerMsg += item.num + ',' + item.customContent + ',' + item.picName + ';';
      }
    })
    if(listLength > num){
      wx.showToast({
        title: '请填写所有花型的花号',
        icon: 'none'
      })
      return;
    }
    if (this.data.data = util.formaData()){
      this.setData({
        data: ''
      })
    }
    if (flowerMsg == '') {
      wx.showToast({
        title: '请上传花型图片',
        icon: 'none'
      })
      return;
    }
    let data = {
      companyName: this.data.userInfo.companyName,
      fkCustomerId: this.data.userInfo.id,
      contacts: this.data.userInfo.contacts,
      phone: this.data.userInfo.phone,
      address: this.data.userInfo.address,
      fabricName: this.data.fabricList[this.data.fabricIndex].name,
      fkFabricId: this.data.fabricList[this.data.fabricIndex].id,
      fkColorId: this.data.colorBoyList[this.data.colorBoyIndex].id,
      colorName: this.data.colorBoyList[this.data.colorBoyIndex].name,
      meter: this.data.size,
      unitPrice: this.data.price,
      origin: this.data.fabricType[this.data.fabricTypeIndex].name,
      deliveryTime: this.data.date,
      note: this.data.note,
      deliveryType: this.data.deliveryType[this.data.deliveryIndex].name,
      // 字符串格式，分号分割 num, url, name
      detailStrs: flowerMsg,
      filePath:this.data.filePath,
      configName: this.data.configList[this.data.configIndex].name,
      expedite: this.data.expedite,
      sizingName: this.data.sizingList[this.data.sizingIndex].name,
      sizingId:this.data.sizingList[this.data.sizingIndex].id
    }
    if (this.data.colorBoyIndex == 0) {
      data.colorName = '无调色员'
    }
    if (this.data.sizingIndex == 0) {
      data.sizingName = '该用户没有选择浆料配方'
    }
    if(this.data.bottonClicked){
      this.setData({
        bottonClicked: false
      })
      request.request(this.data.requestUrl.order,data,'post','',(result)=>{
        let resultCode = result.data.code;
        wx.navigateTo({
          url:'/pages/orderPart/orderResult/orderResult',
          success: function (res) {
            // 通过eventChannel向被打开页面传送数据
            res.eventChannel.emit('resultCode', { code: resultCode})
          }
        })
      })
    }
  },
  // 厂长修改备注
  note2Change(e){
    this.setData({
      note2: e.detail.value
    })
  },
  // 订单修改
  orderRevise(){
    let num = 0;
    let listLength = 0;
    let flowerMsg = '';
    let _this = this;
    if (this.data.fabricIndex == 0) {
      wx.showToast({
        title: '请选择面料',
        icon: 'none'
      })
      return;
    }
    if (this.data.price <= 0) {
      wx.showToast({
        title: '请输入正确的单价',
        icon: 'none'
      })
      return;
    }
    if (this.data.size <= 0) {
      wx.showToast({
        title: '请输入正确的打印数量',
        icon: 'none'
      })
      return;
    }
    listLength = this.data.flowerList.length;
    this.data.flowerList.forEach(item => {
      if (item.num) {
        num++
        flowerMsg += item.num + ',' + item.customContent + ',' + item.picName + ';';
      }
    })
    if (listLength > num) {
      wx.showToast({
        title: '请填写所有花型的花号',
        icon: 'none'
      })
      return;
    }
    if (this.data.data = util.formaData()) {
      this.setData({
        data: ''
      })
    }
    if (this.data.filePath == '') {
      wx.showToast({
        title: '请输入花型路径',
        icon: 'none'
      })
      return;
    }
    if(this.data.configIndex == 0){
      wx.showToast({
        title: '请选择配置方案',
        icon: 'none'
      })
      return;
    }
    let data = {
      companyName: this.data.userInfo.companyName,
      fkCustomerId: this.data.userInfo.id,
      contacts: this.data.userInfo.contacts,
      phone: this.data.userInfo.phone,
      address: this.data.userInfo.address,
      fabricName: this.data.fabricList[this.data.fabricIndex].name,
      fkFabricId: this.data.fabricList[this.data.fabricIndex].id,
      fkColorId: this.data.colorBoyList[this.data.colorBoyIndex].id,
      colorName: this.data.colorBoyList[this.data.colorBoyIndex].name,
      meter: this.data.size,
      unitPrice: this.data.price,
      origin: this.data.fabricType[this.data.fabricTypeIndex].name,
      deliveryTime: this.data.date,
      note: this.data.note,
      deliveryType: this.data.deliveryType[this.data.deliveryIndex].name,
      // 字符串格式，分号分割 num, url, name
      detailStrs: flowerMsg,
      note2: !this.data.note2 ? '' : this.data.note2,
      filePath: this.data.filePath,
      configName: this.data.configList[this.data.configIndex].name,
      expedite: this.data.expedite,
      sizingName: this.data.sizingList[this.data.sizingIndex].name,
      sizingId: this.data.sizingList[this.data.sizingIndex].id
    }
    if (this.data.colorBoyIndex == 0) {
      data.colorName = '无调色员'
    }
    if (this.data.sizingIndex == 0) {
      data.sizingName = '该用户没有选择浆料配方'
    }
    request.requestPut(this.data.requestUrl.order + '/' + this.data.id, data, '', (result)=>{
      let resultCode = result.data.code;
      wx.navigateTo({
        url: '/pages/orderPart/orderResult/orderResult',
        success: function (res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('resultCode', { code: resultCode })
        }
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.getFabricListAll()
    this.getSizingList()
    this.getColorBoyList(); 
    this.getConfigList();
    this.getJingxiaoList()
    let date = util.formaData();
    let newList = [];
    this.setData({
      date: date,
    })
    this.setData({
      isType: true
    })
    if(options.flowerInfo){
      let flowerList = JSON.parse(options.flowerInfo);
      let flowerListResult=[];
      flowerList.forEach(item=>{
        item.num = item.picName;
        let itemResult = item;
        flowerListResult.push(itemResult)
      })
      this.setData({
        flowerList: flowerListResult
      })
    }
    if(options.again){
      let orderInfo = JSON.parse(options.again);
      console.log(orderInfo)
      this.setData({
        againFabricName: orderInfo.fabricName,
        againConfig: orderInfo.configName,
        againColorBoy: orderInfo.colorName,
        againSizing: orderInfo.sizingName
      })
      let userInfo = {
        id: orderInfo.fkCustomerId,
        companyName: orderInfo.companyName,
        contacts: orderInfo.contacts,
        phone: orderInfo.phone,
        address: orderInfo.address
      }
      let fabricTypeIndex, fabricIndex, deliveryTypeIndex;
      this.data.deliveryType.forEach(item => {
        if (item.name == orderInfo.deliveryType) {
          deliveryTypeIndex = item.id
        }
      })
      this.data.fabricType.forEach(item => {
        if (item.name == orderInfo.origin) {
          fabricTypeIndex = item.id
        }
      })
      Object.keys(orderInfo.orderDetails).forEach(item => {
        let list = {
          id: orderInfo.orderDetails[item].id,
          fkOrderId: orderInfo.orderDetails[item].fkOrderId,
          num: orderInfo.orderDetails[item].flowerNum,
          customContent: orderInfo.orderDetails[item].flowerUrl,
          picName: orderInfo.orderDetails[item].flowerName
        }
        newList.push(list)
      })
      let time = util.formaData();
      this.getFabricList(userInfo);
      console.log(940)
      this.setData({
        userInfo: userInfo,
        flowerList: newList,
        fabricTypeIndex: fabricTypeIndex,
        deliveryIndex: deliveryTypeIndex,
        size: orderInfo.meter,
        price: orderInfo.unitPrice,
        date: orderInfo.deliveryTime ? orderInfo.deliveryTime : time,
        allPrice: orderInfo.totalPrice,
        id: orderInfo.id,
        note: orderInfo.note,
        note2: orderInfo.note2,
        filePath: orderInfo.filePath,
        configName: this.data.configList[this.data.configIndex].name,
        expedite: orderInfo.expedite
      })
    }
    if (options.orderUpdate){
      let orderInfo = wx.getStorageSync("orderInfo");
      // 如果该订单是厂长自己创建的，则可以修改其他选项
      if (orderInfo.fkUserId != wx.getStorageSync("userInfo").id||orderInfo.type>1){
        this.setData({
          isType: false
        })
      }
      wx.setNavigationBarTitle({
        title: '修改订单'
      })
      let userInfo = {
        id: orderInfo.fkCustomerId,
        companyName: orderInfo.companyName,
        contacts: orderInfo.contacts,
        phone: orderInfo.phone,
        address: orderInfo.address
      }
      let fabricTypeIndex, fabricIndex, deliveryTypeIndex;
      this.data.deliveryType.forEach(item=>{
        if (item.name == orderInfo.deliveryType){
          deliveryTypeIndex = item.id
        }
      })
      this.data.fabricType.forEach(item => {
        if (item.name == orderInfo.origin) {
          fabricTypeIndex = item.id
        }
      })
      Object.keys(orderInfo.orderDetails).forEach(item =>{
        let list = {
          id: orderInfo.orderDetails[item].id,
          fkOrderId: orderInfo.orderDetails[item].fkOrderId,
          num: orderInfo.orderDetails[item].flowerNum,
          customContent: orderInfo.orderDetails[item].flowerUrl,
          picName: orderInfo.orderDetails[item].flowerName
        }
        newList.push(list)
      })
      this.getFabricList(userInfo);
      this.setData({
        userInfo: userInfo,
        flowerList: newList,
        fabricTypeIndex: fabricTypeIndex,
        deliveryIndex: deliveryTypeIndex,
        size: orderInfo.meter,
        price: orderInfo.unitPrice,
        date: orderInfo.deliveryTime,
        allPrice: orderInfo.totalPrice,
        isRevise: true,
        id: orderInfo.id,
        note: orderInfo.note,
        note2: orderInfo.note2,
        filePath:orderInfo.filePath,
        expedite: orderInfo.expedite,
        againFabricName: orderInfo.fabricName,
        againSizing: orderInfo.sizingName,
        againColorBoy: orderInfo.colorName
      })
    }else{
      wx.setNavigationBarTitle({
        title: '新建订单'
      })
      wx.removeStorageSync("orderInfo");
      //如果没有选择联系人，则查询工厂面料
      // this.getFabricList({id:null})
    }
    // if (JSON.stringify(options)==='{}'){
    //   this.getFabricListAll()
    // }
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})