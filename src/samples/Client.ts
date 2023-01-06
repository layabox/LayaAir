import { Laya } from "Laya";
import { Socket } from "laya/net/Socket";
import { Browser } from "laya/utils/Browser";

/**
* socket客户端
* @ author:xs
* @ data: 2021-07-09 11:48
*/
export default class Client {

    static _instance:Client = null;
    socket:Socket;
    constructor() {
    }

    static get instance():Client{
        if(!Client._instance)
        {
            Client._instance = new Client();
            Client._instance.initEvent();
        }
        return Client._instance;
    }

    static init()
    {
        // if(!Client.instance)
        // {
        //     Client.instance = new Client();
        //     Client.instance.initEvent();
        // }
    }

    initEvent()
    {
        //备注：这里测试的时候需要把192.168.1.138改成socket服务端的ip即可
        var host:string = "10.10.20.80";
        var post:number = 10000;
        var websocketurl:string = "ws://"+host+":"+post+"/";
        this.socket = new Socket();
        this.socket.on("open",this,this.onScoektOpen);
        this.socket.on("message",this,this.onSocketMssage);
        this.socket.on("close",this,this.onSocketClose);
        this.socket.on("error",this,this.onSocketClose);
        this.socket.connectByUrl(websocketurl);
    }

    /**
     * 跟服务器发送消息
     * @param data {"type":{down,up,login,fix},bigType:1,smallType:1}
     */
    send(data)
    {
        var isMaster:any = parseInt(Browser.getQueryString("isMaster"))||0;
        if(!isMaster)return;
        if(this.socket)
        {
            data.isMaster = isMaster;//主控制端
            this.socket.send(JSON.stringify(data));
        }
    }

    onScoektOpen()
    {
        console.log("websocket open");
    }

    onSocketMssage(data)
    {
        console.log("接收信息 data："+data);
        var data:any = JSON.parse(data);
        Laya.stage.event(data.type,[data]);
    }

    onSocketClose()
    {
        console.log("websocket close");
    }
}