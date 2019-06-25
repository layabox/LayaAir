import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { HttpRequest } from "laya/net/HttpRequest";
import { Browser } from "laya/utils/Browser";
import { WebGL } from "laya/webgl/WebGL";
export class Network_GET {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        this.connect();
        this.showLogger();
    }
    connect() {
        this.hr = new HttpRequest();
        this.hr.once(Event.PROGRESS, this, this.onHttpRequestProgress);
        this.hr.once(Event.COMPLETE, this, this.onHttpRequestComplete);
        this.hr.once(Event.ERROR, this, this.onHttpRequestError);
        this.hr.send('http://xkxz.zhonghao.huo.inner.layabox.com/api/getData?name=myname&psword=xxx', null, 'get', 'text');
    }
    showLogger() {
        this.logger = new Text();
        this.logger.fontSize = 30;
        this.logger.color = "#FFFFFF";
        this.logger.align = 'center';
        this.logger.valign = 'middle';
        this.logger.size(Laya.stage.width, Laya.stage.height);
        this.logger.text = "等待响应...\n";
        this.Main.box2D.addChild(this.logger);
    }
    onHttpRequestError(e = null) {
        console.log(e);
    }
    onHttpRequestProgress(e = null) {
        console.log(e);
    }
    onHttpRequestComplete(e = null) {
        this.logger.text += "收到数据：" + this.hr.data;
    }
}
