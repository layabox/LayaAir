import { Box } from "./Box";
import { ILaya } from "../../ILaya";
/**
 * 自适应缩放容器，容器设置大小后，容器大小始终保持stage大小，子内容按照原始最小宽高比缩放
 */
export class ScaleBox extends Box {
    constructor() {
        super(...arguments);
        this._oldW = 0;
        this._oldH = 0;
    }
    /*override*/ onEnable() {
        window.Laya.stage.on("resize", this, this.onResize);
        this.onResize();
    }
    /*override*/ onDisable() {
        window.Laya.stage.off("resize", this, this.onResize);
    }
    onResize() {
        var Laya = window.Laya;
        if (this.width > 0 && this.height > 0) {
            var scale = Math.min(Laya.stage.width / this._oldW, Laya.stage.height / this._oldH);
            super.width = Laya.stage.width;
            super.height = Laya.stage.height;
            this.scale(scale, scale);
        }
    }
    /*override*/ set width(value) {
        super.width = value;
        this._oldW = value;
    }
    get width() {
        return super.width;
    }
    /*override*/ set height(value) {
        super.height = value;
        this._oldH = value;
    }
    get height() {
        return super.height;
    }
}
ILaya.regClass(ScaleBox);
