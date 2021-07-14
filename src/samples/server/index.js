//服务端暴露给客户端的接口
var config = {
    client_port:10000
};
var socket = require("./ws");
//开启socket服务
socket.start(config);