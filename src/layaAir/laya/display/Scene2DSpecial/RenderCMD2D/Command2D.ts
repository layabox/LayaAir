import { IRenderContext2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderCMD } from "../../../RenderDriver/DriverDesign/RenderDevice/IRenderCMD";
import { CommandBuffer2D } from "./CommandBuffer2D";

export class Command2D {
    
    /**@internal */
    _commandBuffer: CommandBuffer2D = null;
    
    /**@internal */
    _context: IRenderContext2D;

    /**
     * @ignore
     */
    constructor() {
    }

    /**
     * @en Organizes rendering commands.
     * @zh 组织渲染指令。
     */
    run?(): void;

    /**
     * @en Recycles the rendering command.
     * @zh 回收渲染指令。
     */
    recover(): void {
        this._commandBuffer = null;
        this._context = null;
    }

    /**
     * @override
     * @internal
     * @returns 
     */
    getRenderCMD?(): IRenderCMD;

    /**
     * @destroy
     */
    destroy() {
        this._commandBuffer = null;
        this._context = null;
    }
}