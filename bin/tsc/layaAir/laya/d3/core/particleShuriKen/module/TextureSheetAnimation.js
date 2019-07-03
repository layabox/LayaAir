import { FrameOverTime } from "./FrameOverTime";
import { StartFrame } from "./StartFrame";
import { Vector2 } from "../../../math/Vector2";
/**
 * <code>TextureSheetAnimation</code> 类用于创建粒子帧动画。
 */
export class TextureSheetAnimation {
    /**
     * 创建一个 <code>TextureSheetAnimation</code> 实例。
     * @param frame 动画帧。
     * @param  startFrame 开始帧。
     */
    constructor(frame, startFrame) {
        /**类型,0为whole sheet、1为singal row。*/
        this.type = 0;
        /**是否随机行，type为1时有效。*/
        this.randomRow = false;
        /**行索引,type为1时有效。*/
        this.rowIndex = 0;
        /**循环次数。*/
        this.cycles = 0;
        /**UV通道类型,0为Noting,1为Everything,待补充,暂不支持。*/
        this.enableUVChannels = 0;
        /**是否启用*/
        this.enable = false;
        this.tiles = new Vector2(1, 1);
        this.type = 0;
        this.randomRow = true;
        this.rowIndex = 0;
        this.cycles = 1;
        this.enableUVChannels = 1; //TODO:待补充
        this._frame = frame;
        this._startFrame = startFrame;
    }
    /**获取时间帧率。*/
    get frame() {
        return this._frame;
    }
    /**获取开始帧率。*/
    get startFrame() {
        return this._startFrame;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destTextureSheetAnimation = destObject;
        this.tiles.cloneTo(destTextureSheetAnimation.tiles);
        destTextureSheetAnimation.type = this.type;
        destTextureSheetAnimation.randomRow = this.randomRow;
        this._frame.cloneTo(destTextureSheetAnimation._frame);
        this._startFrame.cloneTo(destTextureSheetAnimation._startFrame);
        destTextureSheetAnimation.cycles = this.cycles;
        destTextureSheetAnimation.enableUVChannels = this.enableUVChannels;
        destTextureSheetAnimation.enable = this.enable;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var destFrame;
        switch (this._frame.type) {
            case 0:
                destFrame = FrameOverTime.createByConstant(this._frame.constant);
                break;
            case 1:
                destFrame = FrameOverTime.createByOverTime(this._frame.frameOverTimeData.clone());
                break;
            case 2:
                destFrame = FrameOverTime.createByRandomTwoConstant(this._frame.constantMin, this._frame.constantMax);
                break;
            case 3:
                destFrame = FrameOverTime.createByRandomTwoOverTime(this._frame.frameOverTimeDataMin.clone(), this._frame.frameOverTimeDataMax.clone());
                break;
        }
        var destStartFrame;
        switch (this._startFrame.type) {
            case 0:
                destStartFrame = StartFrame.createByConstant(this._startFrame.constant);
                break;
            case 1:
                destStartFrame = StartFrame.createByRandomTwoConstant(this._startFrame.constantMin, this._startFrame.constantMax);
                break;
        }
        var destTextureSheetAnimation = new TextureSheetAnimation(destFrame, destStartFrame);
        this.tiles.cloneTo(destTextureSheetAnimation.tiles);
        destTextureSheetAnimation.type = this.type;
        destTextureSheetAnimation.randomRow = this.randomRow;
        destTextureSheetAnimation.cycles = this.cycles;
        destTextureSheetAnimation.enableUVChannels = this.enableUVChannels;
        destTextureSheetAnimation.enable = this.enable;
        return destTextureSheetAnimation;
    }
}
