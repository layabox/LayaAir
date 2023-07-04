import { Laya } from "Laya";
import { Event } from "laya/events/Event";
import { Socket } from "laya/net/Socket";
import { Byte } from "laya/utils/Byte";

export class Network_Socket {
	private socket: Socket;
	private output: Byte;

	constructor() {
		Laya.init(550, 400).then(() => {
			this.connect();
		});
	}

	private connect(): void {
		this.socket = new Socket();
		//socket.connect("echo.websocket.org", 80);
		this.socket.connectByUrl("ws://echo.websocket.org:80");

		this.output = this.socket.output;

		this.socket.on(Event.OPEN, this, this.onSocketOpen);
		this.socket.on(Event.CLOSE, this, this.onSocketClose);
		this.socket.on(Event.MESSAGE, this, this.onMessageReveived);
		this.socket.on(Event.ERROR, this, this.onConnectError);
	}

	private onSocketOpen(e: any = null): void {
		console.log("Connected");

		// 发送字符串
		this.socket.send("demonstrate <sendString>");

		// 使用output.writeByte发送
		var message: string = "demonstrate <output.writeByte>";
		for (var i: number = 0; i < message.length; ++i) {
			this.output.writeByte(message.charCodeAt(i));
		}
		this.socket.flush();
	}

	private onSocketClose(e: any = null): void {
		console.log("Socket closed");
	}

	private onMessageReveived(message: any = null): void {
		console.log("Message from server:");
		if (typeof (message) == 'string') {
			console.log(message);
		}
		else if (message instanceof ArrayBuffer) {
			console.log(new Byte(message).readUTFBytes());
		}
		this.socket.input.clear();
	}

	private onConnectError(e: Event = null): void {
		console.log("error");
	}
}

