import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { ComboBox } from "laya/ui/ComboBox";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
export class UI_ComboBox {
    constructor(maincls) {
        this.skin = "res/ui/combobox.png";
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(800, 600, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        Laya.loader.load(this.skin, Handler.create(this, this.onLoadComplete));
    }
    onLoadComplete(e = null) {
        var cb = this.createComboBox(this.skin);
        cb.autoSize = true;
        cb.pos((Laya.stage.width - cb.width) / 2, 100);
        cb.autoSize = false;
    }
    createComboBox(skin) {
        var comboBox = new ComboBox(skin, "item0,item1,item2,item3,item4,item5");
        comboBox.labelSize = 30;
        comboBox.itemSize = 25;
        comboBox.selectHandler = new Handler(this, this.onSelect, [comboBox]);
        this.Main.box2D.addChild(comboBox);
        return comboBox;
    }
    onSelect(cb, e = null) {
        console.log("选中了： " + cb.selectedLabel);
    }
}
