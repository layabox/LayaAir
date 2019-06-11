import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { TextInput } from "laya/ui/TextInput";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
export class UI_Input {
    constructor(maincls) {
        this.SPACING = 100;
        this.INPUT_WIDTH = 300;
        this.INPUT_HEIGHT = 50;
        this.Y_OFFSET = 50;
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(800, 600, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        this.skins = ["res/ui/input (1).png", "res/ui/input (2).png", "res/ui/input (3).png", "res/ui/input (4).png"];
        Laya.loader.load(this.skins, Handler.create(this, this.onLoadComplete)); //加载资源。
    }
    onLoadComplete(e = null) {
        for (var i = 0; i < this.skins.length; ++i) {
            var input = this.createInput(this.skins[i]);
            input.prompt = 'Type:';
            input.x = (Laya.stage.width - input.width) / 2;
            input.y = i * this.SPACING + this.Y_OFFSET;
        }
    }
    createInput(skin) {
        var ti = new TextInput();
        ti.skin = skin;
        ti.size(300, 50);
        ti.sizeGrid = "0,40,0,40";
        ti.font = "Arial";
        ti.fontSize = 30;
        ti.bold = true;
        ti.color = "#606368";
        this.Main.box2D.addChild(ti);
        return ti;
    }
}
