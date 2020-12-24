import { Box } from "./Box"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * 自适应缩放容器，容器设置大小后，容器大小始终保持stage大小，子内容按照原始最小宽高比缩放
 */
export class ScaleBox extends Box {
    private _oldW: number = 0;
    private _oldH: number = 0;
    /**
     * @override
     */
    onEnable(): void {
        ILaya.stage.on("resize", this, this.onResize);
        this.onResize();
    }
    /**
     * @override
     */
    onDisable(): void {
        ILaya.stage.off("resize", this, this.onResize);
    }

    private onResize(): void {
        let stage = ILaya.stage;
        if (this.width > 0 && this.height > 0) {
            var scale: number = Math.min(stage.width / this._oldW, stage.height / this._oldH);
            super.width = stage.width;
            super.height = stage.height;
            this.scale(scale, scale);
        }
    }
    /**
     * @override
     */
    set width(value: number) {
        super.width = value;
        this._oldW = value;
    }
    /**
     * @inheritDoc
     * @override
     */
    get width() {
        return super.width;
    }
    /**
     * @override
     */
    set height(value: number) {
        super.height = value;
        this._oldH = value;
    }
    /**
     * @inheritDoc
     * @override
     */
    get height() {
        return super.height;
    }
}


ILaya.regClass(ScaleBox);
ClassUtils.regClass("laya.ui.ScaleBox", ScaleBox);
ClassUtils.regClass("Laya.ScaleBox", ScaleBox);