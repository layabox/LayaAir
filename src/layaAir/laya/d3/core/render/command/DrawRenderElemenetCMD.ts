import { DrawElementCMDData } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRender3DCMD";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { RenderElement } from "../RenderElement";
import { Command } from "./Command";

/**
 * @en Represents a draw render element command.
 * @zh 表示一个绘制渲染元素命令。
 */
export class DrawRenderElementCMD extends Command {
    /**@internal */
    private static _pool: DrawRenderElementCMD[] = [];
    /**
     * @en Creates a new instance of the command or retrieves one from the pool.
     * @param renderElement The render element associated with this command.
     * @returns A new or pooled instance of `DrawRenderElementCMD`.
     * @zh 创建命令的新实例或从池中检索一个实例。
     * @param renderElement 与此命令关联的渲染元素。
     * @return 一个新的或从池中检索到的 `DrawRenderElementCMD` 实例。
     */
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

    /**
     * @en The render element of this command.
     * @zh 此命令的渲染元素。
     */
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
     * @en Recovers the command for reuse.
     * @zh 回收命令以供重用。
     */
    recover(): void {
        super.recover();
        DrawRenderElementCMD._pool.push(this);
    }

    /**
     * @override
     * @internal
     * @en Gets the render command data.
     * @zh 获取渲染命令数据。
     */
    getRenderCMD(): DrawElementCMDData {
        return this._drawElementCMDData;
    }

    /**
     * @en Destroys the command.
     * @zh 销毁命令。
     */
    destroy() {
        this._renderElement = null;
        this._drawElementCMDData = null;
    }
}