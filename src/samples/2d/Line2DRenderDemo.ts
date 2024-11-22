import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Main } from "../Main";
import { Loader } from "laya/net/Loader";
import { Sprite } from "laya/display/Sprite";
import { Vector2 } from "laya/maths/Vector2";
import { Vector4 } from "laya/maths/Vector4";
import { WrapMode } from "laya/RenderEngine/RenderEnum/WrapMode";
import { BaseTexture } from "laya/resource/BaseTexture";
import { Texture } from "laya/resource/Texture";
import { Line2DRender } from "laya/display/Scene2DSpecial/Line2D/Line2DRender";
import { Color } from "laya/maths/Color";

export class Line2DRenderDemo {
    Main: typeof Main = null;
    private _lastX = 0;
    private _line2Drender: Line2DRender = null;
    constructor(mainClass: typeof Main) {
        this.Main = mainClass;
        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.bgColor = "#232628";
            Stat.show();
            Laya.loader.load("res/apes/monkey2.png", Loader.IMAGE).then(() => {
                let image = Loader.getRes("res/apes/monkey2.png");
                this.showApe(image);
            });
        });
    }

    private showApe(img: Texture): void {
        let texture: BaseTexture = img.bitmap;
        texture.wrapModeV = WrapMode.Repeat;
        texture.wrapModeU = WrapMode.Repeat;
        var ape: Sprite = new Sprite();
        let line2Drender = this._line2Drender = ape.addComponent(Line2DRender);
        // line2Drender.color = new Color(1, 0.5, 0.5, 1);
        line2Drender.lineWidth = 10;
       // line2Drender.texture = texture;
        line2Drender.tillOffset = new Vector4(0, 0, 0.01, 1);
        line2Drender.color = new Color(1, 0, 0, 1);
        // line2Drender.enableDashedMode = true;

        let last = new Vector2(Math.random() * Browser.clientWidth, Math.random() * Browser.clientHeight);
        for (let i = 0; i < 20; i++) {
            let x = Math.random() * Browser.clientWidth;
            let y = Math.random() * Browser.clientHeight;
            line2Drender.addPoint(last.x, last.y, x, y);
            last.setValue(x, y);
        }
        // line2Drender.addPoint(0, 0, 100, 100);
        // line2Drender.addPoint(100, 100, 1000, 500);
        // ape.graphics.drawTexture(t, 0, 0);
        this.Main.box2D.addChild(ape);
    }
}