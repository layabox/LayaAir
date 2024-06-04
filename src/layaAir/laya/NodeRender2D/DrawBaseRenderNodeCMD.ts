import { Context, IGraphicCMD } from "../renders/Context";
import { BaseRenderNode2D } from "./BaseRenderNode2D";

export class DrawBaseRenderNodeCMD implements IGraphicCMD {

    _owner: BaseRenderNode2D

    constructor(owner: BaseRenderNode2D) {
        this._owner = owner;
    }

    recover(): void {
        //不需要回收
    }
    get cmdID(): string {
        return "DrawBaseRenderNodeCMD";
    }
    /**@private */
    run(context: Context, gx: number, gy: number): void {
        if (this._owner.addCMDCall)
            this._owner.addCMDCall(context, gx, gy);
        if (context._render2DManager._renderEnd) {
            context.drawLeftData();//强制渲染之前的遗留
            context._render2DManager._renderEnd = false;
            context._render2DManager.addRenderObject(this._owner);
        }
    }
}