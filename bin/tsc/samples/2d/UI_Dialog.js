import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Button } from "laya/ui/Button";
import { Dialog } from "laya/ui/Dialog";
import { Image } from "laya/ui/Image";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
export class UI_Dialog {
    constructor() {
        this.DIALOG_WIDTH = 220;
        this.DIALOG_HEIGHT = 275;
        this.CLOSE_BTN_WIDTH = 43;
        this.CLOSE_BTN_PADDING = 5;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(800, 600, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        this.assets = ["res/ui/dialog (1).png", "res/ui/close.png"];
        Laya.loader.load(this.assets, Handler.create(this, this.onSkinLoadComplete));
    }
    onSkinLoadComplete(e = null) {
        this.dialog = new Dialog();
        var bg = new Image(this.assets[0]);
        this.dialog.addChild(bg);
        var button = new Button(this.assets[1]);
        button.name = Dialog.CLOSE;
        button.pos(this.DIALOG_WIDTH - this.CLOSE_BTN_WIDTH - this.CLOSE_BTN_PADDING, this.CLOSE_BTN_PADDING);
        this.dialog.addChild(button);
        this.dialog.dragArea = "0,0," + this.DIALOG_WIDTH + "," + this.DIALOG_HEIGHT;
        this.dialog.show();
    }
    dispose() {
        if (this.dialog) {
            this.dialog.close();
        }
    }
}
