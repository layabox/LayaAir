import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
export class Sprite_SwitchTexture {
    constructor(maincls) {
        this.texture1 = "res/apes/monkey2.png";
        this.texture2 = "res/apes/monkey3.png";
        this.flag = false;
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        //
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        //
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        Laya.loader.load([this.texture1, this.texture2], Handler.create(this, this.onAssetsLoaded));
    }
    onAssetsLoaded(e = null) {
        this.ape = new Sprite();
        this.Main.box2D.addChild(this.ape);
        this.ape.pivot(55, 72);
        this.ape.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        // 显示默认纹理
        this.switchTexture();
        this.ape.on("click", this, this.switchTexture);
    }
    switchTexture(e = null) {
        var textureUrl = (this.flag = !this.flag) ? this.texture1 : this.texture2;
        // 更换纹理
        this.ape.graphics.clear();
        var texture = Laya.loader.getRes(textureUrl);
        this.ape.graphics.drawTexture(texture, 0, 0);
        // 设置交互区域
        this.ape.size(texture.width, texture.height);
    }
}
