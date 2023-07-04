import { Laya } from "Laya";
import { URL } from "laya/net/URL";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

export class Network_ProtocolBuffer {
	private ProtoBuf: any = Browser.window.protobuf;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(550, 400).then(() => {
			var resPath: string = "res/protobuf/awesome.proto";
			if (Main.isWXAPP) {
				this.ProtoBuf = require("./protobuf.js");
				resPath = URL.basePath + "res/protobuf/awesome.proto";
			}
			this.ProtoBuf.load(resPath, this.onAssetsLoaded);
		});
	}

	private onAssetsLoaded(err: any, root: any): void {
		if (err)
			throw err;

		var AwesomeMessage: any = root.lookupType("awesomepackage.AwesomeMessage");

		console.log(AwesomeMessage);
		var payload: any = { awesomeField: "AwesomeString" };
		console.log(payload);
		var errMsg: any = AwesomeMessage.verify(payload);

		if (errMsg)
			throw Error(errMsg);

		var message: any = AwesomeMessage.create(payload);
		console.log(message);
		var buffer: any = AwesomeMessage.encode(message).finish();

		//var message:* = AwesomeMessage.decode(buffer);
		//var message:* = AwesomeMessage.decode(buffer);
		console.log(message);
		console.log(buffer);

	}
}

