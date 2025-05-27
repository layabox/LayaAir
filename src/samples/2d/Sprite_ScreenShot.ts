/**
description
 实现Laya引擎中Canvas和Sprite的截图功能，包括截取画布图像和绘制图像到纹理
 */
import { Config } from "Config";
import { Laya } from "Laya";
import { Browser } from "laya/utils/Browser";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Button } from "laya/ui/Button";
import { Main } from "../Main";
import { Event } from "laya/events/Event";
import { Sprite } from "laya/display/Sprite";
import { Image } from "laya/ui/Image";
import { Texture } from "laya/resource/Texture";
import { RenderTexture2D } from "laya/resource/RenderTexture2D";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { startCapture, stopCapture } from "../debug/WebglDebugTool";

export default class Sprite_ScreenShot {
    private main: typeof Main;
    private btnArr: Array<string> = [ "res/threeDimen/ui/button.png", "res/threeDimen/ui/button.png"];
    private nameArr: Array<string> = ["sprite截图", "清理"];
    private aimSp: Sprite;
    private drawImage: Image;
    private drawSp: Sprite;
    private _clearColor: string = "#999999";
    private monkeyTexture: Texture;
    constructor(_m) {
        this.main = _m;
        Config.preserveDrawingBuffer = true;
        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            //
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            //
            Laya.stage.scaleMode = Stage.SCALE_FIXED_AUTO;
            Laya.stage.bgColor = "#232628";

            Laya.loader.load(this.btnArr.concat("res/apes/monkey3.png"), Handler.create(this, this.onLoaded));
        });
    }

    private createButton(skin: string, name: string, cb: Function, index: number): Button {
        var btn: Button = new Button(skin, name);
        this.main.box2D.addChild(btn);
        btn.on(Event.CLICK, this, cb);
        btn.size(147, 55);
        btn.name = name;
        // btn.right = 10;
        btn.x = 200;
        btn.y = index * (btn.height + 10);
        // btn.top = index * (btn.height + 10);
        return btn;
    }

    private onLoaded() {
        
        this.aimSp = new Sprite();
        this.aimSp.size(Browser.clientWidth / 2, Browser.clientHeight / 2);
        this.main.box2D.addChild(this.aimSp);

        this.aimSp.graphics.drawRect(0, 0, this.aimSp.width, this.aimSp.height, "#333333");
        this.monkeyTexture = Laya.loader.getRes("res/apes/monkey3.png");
        this.aimSp.graphics.drawTexture(this.monkeyTexture, 0, 0, this.monkeyTexture.width, this.monkeyTexture.height);
        
        this.drawImage = new Image();
        this.drawImage.size(Browser.clientWidth / 2, Browser.clientHeight / 2);
        this.main.box2D.addChild(this.drawImage);
        this.drawImage.bottom = this.drawImage.right = 0;

        this.drawSp = new Sprite();
        this.main.box2D.addChild(this.drawSp);
        this.drawSp.size(Browser.clientWidth / 2, Browser.clientHeight / 2);
        this.drawSp.y = Browser.clientHeight / 2;
        this.drawSp.graphics.drawRect(0, 0, this.drawSp.width, this.drawSp.height, this._clearColor);

        for (let index = 0; index < this.btnArr.length; index++) {
            this.createButton(this.btnArr[index], this.nameArr[index], this._onclick, index);
        }
    }

    private _onclick(e: Event) {
        switch (e.target.name) {
            case this.nameArr[0]:
                var ddrt = new RenderTexture2D(Browser.clientWidth, Browser.clientHeight, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
                Laya.stage.drawToRenderTexture2D(Browser.clientWidth, Browser.clientHeight, 0, 0, ddrt , true , true);
                var text: Texture = new Texture(ddrt);
                this.drawSp.graphics.drawTexture(text, 0, 0, this.drawSp.width, this.drawSp.height);
                break;
            case this.nameArr[1]:
                this.drawImage.skin = null;
                this.drawSp.graphics.clear();
                this.drawSp.graphics.drawRect(0, 0, this.drawSp.width, this.drawSp.height, this._clearColor);
                break;
        }
    }
}

function endCapture() {
    throw new Error("Function not implemented.");
}
