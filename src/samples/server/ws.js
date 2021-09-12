var clients = [];//客户端管理池
var clientId = 0;//客户端分配id，此id会递归增加，用来绑定客户端的socket标识
exports.start = function(config){

    const WebSocket = require('nodejs-websocket')
    const server = WebSocket.createServer(function(connect){
        console.log("new connect add");
        //连接成功
        connect.on("text",function(data){

            //接收客户端消息
            data = JSON.parse(data);
            if(data.type == "login")
            {
                connect.isMaster = data.isMaster;//主控制器标识
                connect.clientId = clientId;//客户端id标识
                clients[clientId] = connect;//客户端socket
                clientId +=1;//客户端id标识递归
                connect.send(JSON.stringify({"errCode":0,"msg":"登录成功"}));
            }else
            {
                boardcast(data);
            }
        });

        //连接出错
        connect.on("error",function(err){
            console.log("connect error");
            console.log(err);
        });

        //断开连接
        connect.on("close",function(){
            var clientId = connect.clientId;
            if(clientId != 0 &&!clientId)
                return;
            console.log("控制端 clientId :" + clientId + " 断线了!");
            clients[clientId] = null;//清理掉断线的socket客户端
        });

        //广播
        function boardcast(data)
        {
            // server.connections保存每个连接进来的用户
            server.connections.forEach(function(conn){
                conn.send(JSON.stringify(data));
            })
        }
    });
    server.listen(config.client_port);
    console.log("websocket server listen port is " + config.client_port);
}