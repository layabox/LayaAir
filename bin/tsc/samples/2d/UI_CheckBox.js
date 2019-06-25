import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { CheckBox } from "laya/ui/CheckBox";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
export class UI_CheckBox {
    constructor(maincls) {
        this.COL_AMOUNT = 2;
        this.ROW_AMOUNT = 3;
        this.HORIZONTAL_SPACING = 200;
        this.VERTICAL_SPACING = 100;
        this.X_OFFSET = 100;
        this.Y_OFFSET = 50;
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(800, 600, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        this.skins = ["res/ui/checkbox (1).png", "res/ui/checkbox (2).png", "res/ui/checkbox (3).png", "res/ui/checkbox (4).png", "res/ui/checkbox (5).png", "res/ui/checkbox (6).png"];
        Laya.loader.load(this.skins, Handler.create(this, this.onCheckBoxSkinLoaded));
    }
    onCheckBoxSkinLoaded(e = null) {
        var cb;
        for (var i = 0; i < this.COL_AMOUNT; ++i) {
            for (var j = 0; j < this.ROW_AMOUNT; ++j) {
                cb = this.createCheckBox(this.skins[i * this.ROW_AMOUNT + j]);
                cb.selected = true;
                cb.x = this.HORIZONTAL_SPACING * i + this.X_OFFSET;
                cb.y += this.VERTICAL_SPACING * j + this.Y_OFFSET;
                // 给左边的三个CheckBox添加事件使其能够切换标签
                if (i == 0) {
                    cb.y += 20;
                    cb.on("change", this, this.updateLabel, [cb]);
                    this.updateLabel(cb);
                }
            }
        }
    }
    createCheckBox(skin) {
        var cb = new CheckBox(skin);
        this.Main.box2D.addChild(cb);
        cb.labelColors = "white";
        cb.labelSize = 20;
        cb.labelFont = "Microsoft YaHei";
        cb.labelPadding = "3,0,0,5";
        return cb;
    }
    updateLabel(checkBox) {
        checkBox.label = checkBox.selected ? "已选中" : "未选中";
    }
}
