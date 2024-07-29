import { DrawElementCMDData, IRenderCMD } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRendderCMD";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { RenderElement } from "../RenderElement";
import { Command } from "./Command";

export class DrawRenderElementCMD extends Command {
    /**@internal */
    private static _pool: DrawRenderElementCMD[] = [];
    static create(renderElement: RenderElement): DrawRenderElementCMD {
        var cmd: DrawRenderElementCMD;
        cmd = DrawRenderElementCMD._pool.length > 0 ? DrawRenderElementCMD._pool.pop() : new DrawRenderElementCMD();
        cmd.renderElement = renderElement;
        return cmd;
    }


    /**@internal */
    _drawElementCMDData: DrawElementCMDData;
    /**@internal */
    private _renderElement: RenderElement;

    get renderElement(): RenderElement {
        return this._renderElement;
    }

    set renderElement(value: RenderElement) {
        this._renderElement = value;
        this._drawElementCMDData.setRenderelements([this._renderElement._renderElementOBJ]);
    }
    constructor() {
        super();
        this._drawElementCMDData = Laya3DRender.Render3DPassFactory.createDrawElementCMDData();
    }
    /**
     * @inheritDoc
     * @override
     */
    recover(): void {
        super.recover();
        DrawRenderElementCMD._pool.push(this);
    }

    /**
     * @override
     * @internal
     * @returns 
     */
    getRenderCMD(): DrawElementCMDData {
        return this._drawElementCMDData;
    }

    /**
     * @internal
     */
    destroy() {
        this._renderElement = null;
        this._drawElementCMDData = null;
    }
}