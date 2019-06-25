/**
 * 绘制Canvas贴图
 * @private
 */
export declare class DrawCanvasCmd {
    static ID: string;
    /**@private */
    static _DRAW_IMAGE_CMD_ENCODER_: any;
    /**@private */
    static _PARAM_TEXTURE_POS_: number;
    /**@private */
    static _PARAM_VB_POS_: number;
    private _graphicsCmdEncoder;
    private _index;
    private _paramData;
    /**
     * 绘图数据
     */
    texture: any;
    /**
     * 绘制区域起始位置x
     */
    x: number;
    /**
     * 绘制区域起始位置y
     */
    y: number;
    /**
     * 绘制区域宽
     */
    width: number;
    /**
     * 绘制区域高
     */
    height: number;
    /**@private */
    static create(texture: any, x: number, y: number, width: number, height: number): DrawCanvasCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    readonly cmdID: string;
}
