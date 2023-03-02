const express = require('express')
const SocketServer = require('ws').Server
const PORT = 3000 //指定 port
var deviceList = []

function isJSON(str) {
  if(!str){
    return false;
  }
  if (typeof str == 'string') {
    try {
      var obj=JSON.parse(str);
      if(typeof obj == 'object' && obj ){
        return true;
      }else{
        return false;
      }
    }catch(e) {
      return false;
    }
  }
}

//創建 express 物件，綁定監聽  port , 設定開啟後在 console 中提示
const server = express().listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})
//將 express 交給 SocketServer 開啟 WebSocket 的服務
const wss = new SocketServer({ server })

// Get client unique id
wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

//當有 client 連線成功時
wss.on('connection', ws => {
  console.log('Client connected')
  ws.id = wss.getUniqueID();
//   { "type":"sensor", "data":{"value": "device1", "label": "device1"} }
  // 將連線中的 client 存入 wss.clients
  wss.clients.add(ws)
  let msg = {
    type: 'deviceList',
    data: deviceList
  }
  ws.send(JSON.stringify(msg));
  // 當收到client消息時
  ws.on('message', data => {
    // 收回來是 Buffer 格式、需轉成字串
    data = data.toString()  
    // 判斷data是否為json 格式
    if (!isJSON(data)) {
        console.log('not json: ', data)
        return
    }

    let dataObj = JSON.parse(data) // 將字串轉成 JSON 格式
    if (dataObj.type == 'sensor') {
        // 取得這筆資料的 cliend data
        let datamsg = {
            client: ws.id,
            data: dataObj.data
        }
        // 將資料存入 deviceList
        deviceList.push(datamsg)
        // 將資料發送給所有 client
        let clients = wss.clients  //取得所有連接中的 client
        clients.forEach(client => {
            client.send(JSON.stringify(msg)); // 發送至每個 client
        })
    }else{
        /// 發送消息給client 
        // 可在 terminal 看收到的訊息
        console.log(data) 
        wss.clients.forEach(client => {
            client.send(data); // 發送至每個 client
        })
    }
  })
  // 當連線關閉
  ws.on('close', () => {
    // 將deviceList中的 ws.id 刪除
    deviceList = deviceList.filter(item => item.client !== ws.id)
    console.log(ws.id, 'Close connected')
    msg.data = deviceList
    // 將資料發送給所有 client
    let clients = wss.clients  //取得所有連接中的 client
    clients.forEach(client => {
        client.send(JSON.stringify(msg)); // 發送至每個 client
    })
  })
})