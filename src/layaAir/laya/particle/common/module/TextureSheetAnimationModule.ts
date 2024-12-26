import { Vector2 } from "../../../maths/Vector2";
import { Vector4 } from "../../../maths/Vector4";
import { ClassUtils } from "../../../utils/ClassUtils";
import { IClone } from "../../../utils/IClone";
import { ParticleMinMaxCurve, ParticleMinMaxCurveMode } from "../ParticleMinMaxCurve";

export enum TextureSheetAnimationMode {
    SingleRow = 0,
    WholeSheet
}

export class TextureSheetAnimationModule implements IClone {

    enable: boolean = true;

    tiles: Vector2 = new Vector2(1, 1);

    animation: TextureSheetAnimationMode = TextureSheetAnimationMode.WholeSheet;

    rowIndex: number;

    frame: ParticleMinMaxCurve = new ParticleMinMaxCurve();

    startFrame: ParticleMinMaxCurve = new ParticleMinMaxCurve();

    cycles: number = 1;

    constructor() {

    }

    /** @internal */
    _sheetFrameData: Vector4 = new Vector4;

    /** @internal */
    _calculateSheetFrameData() {
        let startFrame = this.startFrame;

        let startIndex = startFrame.constant;
        let frameCount = 0;
        let rowIndex = 0;

        let mode = startFrame.mode;
        switch (mode) {
            case ParticleMinMaxCurveMode.Constant:
                {
                    startIndex = startFrame.constant;

                    break;
                }
            case ParticleMinMaxCurveMode.TwoConstants:
                {
                    startIndex = Math.floor(Math.random() * (startFrame.constantMax - startFrame.constantMin) + startFrame.constantMin);
                    break;
                }
            default:
                break;
        }

        switch (this.animation) {
            case TextureSheetAnimationMode.SingleRow:
                frameCount = this.tiles.x;
                startIndex = startIndex % frameCount;
                rowIndex = this.rowIndex;
                break;
            case TextureSheetAnimationMode.WholeSheet:
                frameCount = this.tiles.x * this.tiles.y;
                startIndex = startIndex % frameCount;
                rowIndex = 0;
                break;
            default:
                break;
        }

        this._sheetFrameData.setValue(startIndex, frameCount, rowIndex, 0);
    }

    cloneTo(destObject: TextureSheetAnimationModule): void {
        destObject.enable = this.enable;
        this.tiles.cloneTo(destObject.tiles);
        destObject.animation = this.animation;
        destObject.rowIndex = this.rowIndex;
        this.frame.cloneTo(destObject.frame);
        this.startFrame.cloneTo(destObject.startFrame);
        destObject.cycles = this.cycles;
    }

    clone(): TextureSheetAnimationModule {
        var dest = new TextureSheetAnimationModule();
        this.cloneTo(dest);
        return dest;
    }

}
