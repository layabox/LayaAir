import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { HttpRequest } from "laya/net/HttpRequest";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

export class Network_POST {
	private hr: HttpRequest;
	private logger: Text;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(()=>{
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;
	
			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";
	
			this.connect();
			this.showLogger();
		});

	}

	private connect(): void {
		this.hr = new HttpRequest();
		this.hr.once(Event.PROGRESS, this, this.onHttpRequestProgress);
		this.hr.once(Event.COMPLETE, this, this.onHttpRequestComplete);
		this.hr.once(Event.ERROR, this, this.onHttpRequestError);
		this.hr.send('https://httpbin.org/post', 'key1=value1&key2=value2', 'post', 'text');
	}

	private showLogger(): void {
		this.logger = new Text();

		this.logger.fontSize = 30;
		this.logger.color = "#FFFFFF";
		this.logger.align = 'center';
		this.logger.valign = 'middle';

		this.logger.size(Laya.stage.width, Laya.stage.height);
		this.logger.text = "等待响应...\n";
		this.Main.box2D.addChild(this.logger);
	}

	private onHttpRequestError(e: any = null): void {
		console.log(e);
	}

	private onHttpRequestProgress(e: any = null): void {
		console.log(e)
	}

	private onHttpRequestComplete(e: any = null): void {
		this.logger.text += "收到数据：" + this.hr.data;
		console.log("收到数据：" + this.hr.data);
	}
}

