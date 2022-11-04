import { Box } from "./Box"
import { ILaya } from "../../ILaya";

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
        if (this.width > 0 && this.height > 0) {
            let stage = ILaya.stage;
            let scale = Math.min(stage.width / this._oldW, stage.height / this._oldH);
            super.width = stage.width;
            super.height = stage.height;
            this.scale(scale, scale);
        }
    }
    /**
     * @override
     */
    set_width(value: number): void {
        super.set_width(value);
        this._oldW = value;
    }

    /**
     * @override
     */
    set_height(value: number) {
        super.set_height(value);
        this._oldH = value;
    }
}