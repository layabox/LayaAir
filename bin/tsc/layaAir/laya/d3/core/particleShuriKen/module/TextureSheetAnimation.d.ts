import { FrameOverTime } from "././FrameOverTime";
import { StartFrame } from "././StartFrame";
import { IClone } from "../../IClone";
import { Vector2 } from "../../../math/Vector2";
/**
 * <code>TextureSheetAnimation</code> 类用于创建粒子帧动画。
 */
export declare class TextureSheetAnimation implements IClone {
    /**@private */
    private _frame;
    /**@private */
    private _startFrame;
    /**纹理平铺。*/
    tiles: Vector2;
    /**类型,0为whole sheet、1为singal row。*/
    type: number;
    /**是否随机行，type为1时有效。*/
    randomRow: boolean;
    /**行索引,type为1时有效。*/
    rowIndex: number;
    /**循环次数。*/
    cycles: number;
    /**UV通道类型,0为Noting,1为Everything,待补充,暂不支持。*/
    enableUVChannels: number;
    /**是否启用*/
    enable: boolean;
    /**获取时间帧率。*/
    readonly frame: FrameOverTime;
    /**获取开始帧率。*/
    readonly startFrame: StartFrame;
    /**
     * 创建一个 <code>TextureSheetAnimation</code> 实例。
     * @param frame 动画帧。
     * @param  startFrame 开始帧。
     */
    constructor(frame: FrameOverTime, startFrame: StartFrame);
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
}
