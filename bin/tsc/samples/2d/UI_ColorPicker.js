import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { ColorPicker } from "laya/ui/ColorPicker";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
export class UI_ColorPicker {
    constructor(maincls) {
        this.skin = "res/ui/colorPicker.png";
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        Laya.loader.load(this.skin, Handler.create(this, this.onColorPickerSkinLoaded));
    }
    onColorPickerSkinLoaded(e = null) {
        var colorPicker = new ColorPicker();
        colorPicker.selectedColor = "#ff0033";
        colorPicker.skin = this.skin;
        colorPicker.pos(100, 100);
        colorPicker.changeHandler = new Handler(this, this.onChangeColor, [colorPicker]);
        this.Main.box2D.addChild(colorPicker);
        this.onChangeColor(colorPicker);
    }
    onChangeColor(colorPicker, e = null) {
        console.log(colorPicker.selectedColor);
    }
}
