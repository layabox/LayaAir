import { Laya } from "Laya";
import { Main } from "./../Main";
import { URL } from "laya/net/URL";
import { Browser } from "laya/utils/Browser";
export class Network_ProtocolBuffer {
    constructor(maincls) {
        this.ProtoBuf = Browser.window.protobuf;
        this.Main = null;
        this.Main = maincls;
        Laya.init(550, 400);
        var resPath = "res/protobuf/awesome.proto";
        if (Main.isWXAPP) {
            this.ProtoBuf = require("./protobuf.js");
            resPath = URL.basePath + "res/protobuf/awesome.proto";
        }
        this.ProtoBuf.load(resPath, this.onAssetsLoaded);
    }
    onAssetsLoaded(err, root) {
        if (err)
            throw err;
        var AwesomeMessage = root.lookupType("awesomepackage.AwesomeMessage");
        console.log(AwesomeMessage);
        var payload = { awesomeField: "AwesomeString" };
        console.log(payload);
        var errMsg = AwesomeMessage.verify(payload);
        if (errMsg)
            throw Error(errMsg);
        var message = AwesomeMessage.create(payload);
        console.log(message);
        var buffer = AwesomeMessage.encode(message).finish();
        //var message:* = AwesomeMessage.decode(buffer);
        //var message:* = AwesomeMessage.decode(buffer);
        console.log(message);
        console.log(buffer);
    }
}
