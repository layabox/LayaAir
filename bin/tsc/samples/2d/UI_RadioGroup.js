import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { WebGL } from "laya/webgl/WebGL";
import { Handler } from "laya/utils/Handler";
import { RadioGroup } from "laya/ui/RadioGroup";
export class UI_RadioGroup {
    constructor(maincls) {
        this.SPACING = 150;
        this.X_OFFSET = 200;
        this.Y_OFFSET = 80;
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(800, 600, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        this.skins = ["res/ui/radioButton (1).png", "res/ui/radioButton (2).png", "res/ui/radioButton (3).png"];
        Laya.loader.load(this.skins, Handler.create(this, this.initRadioGroups));
    }
    initRadioGroups(e = null) {
        for (var i = 0; i < this.skins.length; ++i) {
            var rg = this.createRadioGroup(this.skins[i]);
            rg.selectedIndex = i;
            rg.x = i * this.SPACING + this.X_OFFSET;
            rg.y = this.Y_OFFSET;
        }
    }
    createRadioGroup(skin) {
        var rg = new RadioGroup();
        rg.skin = skin;
        rg.space = 70;
        rg.direction = "v";
        rg.labels = "Item1, Item2, Item3";
        rg.labelColors = "#787878,#d3d3d3,#FFFFFF";
        rg.labelSize = 20;
        rg.labelBold = true;
        rg.labelPadding = "5,0,0,5";
        rg.selectHandler = new Handler(this, this.onSelectChange);
        this.Main.box2D.addChild(rg);
        return rg;
    }
    onSelectChange(index) {
        console.log("你选择了第 " + (index + 1) + " 项");
    }
}
