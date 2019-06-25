import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { WebGL } from "laya/webgl/WebGL";
export class Interaction_Keyboard {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        this.setup();
    }
    setup() {
        this.listenKeyboard();
        this.createLogger();
        Laya.timer.frameLoop(1, this, this.keyboardInspector);
    }
    listenKeyboard() {
        this.keyDownList = [];
        //添加键盘按下事件,一直按着某按键则会不断触发
        Laya.stage.on(Event.KEY_DOWN, this, this.onKeyDown);
        //添加键盘抬起事件
        Laya.stage.on(Event.KEY_UP, this, this.onKeyUp);
    }
    /**键盘按下处理*/
    onKeyDown(e = null) {
        this.keyDownList[e["keyCode"]] = true;
    }
    /**键盘抬起处理*/
    onKeyUp(e = null) {
        delete this.keyDownList[e["keyCode"]];
    }
    keyboardInspector(e = null) {
        var numKeyDown = this.keyDownList.length;
        var newText = '[ ';
        for (var i = 0; i < numKeyDown; i++) {
            if (this.keyDownList[i]) {
                newText += i + " ";
            }
        }
        newText += ']';
        this.logger.changeText(newText);
    }
    /**添加提示文本*/
    createLogger() {
        this.logger = new Text();
        this.logger.size(Laya.stage.width, Laya.stage.height);
        this.logger.fontSize = 30;
        this.logger.font = "SimHei";
        this.logger.wordWrap = true;
        this.logger.color = "#FFFFFF";
        this.logger.align = 'center';
        this.logger.valign = 'middle';
        this.Main.box2D.addChild(this.logger);
    }
}
