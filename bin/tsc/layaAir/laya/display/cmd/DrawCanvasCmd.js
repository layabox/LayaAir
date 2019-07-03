import { Pool } from "../../utils/Pool";
/**
 * 绘制Canvas贴图
 * @internal
 */
export class DrawCanvasCmd {
    constructor() {
        this._paramData = null;
    }
    /**@private */
    static create(texture /*RenderTexture2D*/, x, y, width, height) {
        return null;
    }
    /**
     * 回收到对象池
     */
    recover() {
        this._graphicsCmdEncoder = null;
        Pool.recover("DrawCanvasCmd", this);
    }
    /**@private */
    get cmdID() {
        return DrawCanvasCmd.ID;
    }
}
DrawCanvasCmd.ID = "DrawCanvasCmd";
/**@private */
DrawCanvasCmd._DRAW_IMAGE_CMD_ENCODER_ = null;
/**@private */
DrawCanvasCmd._PARAM_TEXTURE_POS_ = 2;
/**@private */
DrawCanvasCmd._PARAM_VB_POS_ = 5;
