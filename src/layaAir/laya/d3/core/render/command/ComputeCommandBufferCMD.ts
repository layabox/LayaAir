import { LayaGL } from "../../../../layagl/LayaGL";
import { ComputeCommandBuffer } from "../../../../RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeCommandBuffer";
import { ComputeCommandAppatchCMD, SetRenderDataCMD } from "../../../../RenderDriver/DriverDesign/RenderDevice/IRenderCMD";
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderCapable } from "../../../../RenderEngine/RenderEnum/RenderCapable";
import { Pool } from "../../../../utils/Pool";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { Command } from "./Command";

export class ComputeCommandBufferCMD extends Command {
    /**@internal */
    private static readonly _pool = Pool.createPool(ComputeCommandBufferCMD);


    private _computeCMD: ComputeCommandAppatchCMD;
    private _computeBuffer: ComputeCommandBuffer;

    /**
     * @internal
     */
    static create(value: ComputeCommandBuffer): ComputeCommandBufferCMD {
        if (!LayaGL.renderEngine.getCapable(RenderCapable.ComputeShader)) {
            throw "device cant surpport computeBuffer function";
        }
        var cmd: ComputeCommandBufferCMD;
        cmd = ComputeCommandBufferCMD._pool.take();
        cmd.computeBuffer = value;
        return cmd;
    }

    constructor() {
        super();
        this._computeCMD = Laya3DRender.Render3DPassFactory.createComputeCommandAppatchCMD();
    }

    set computeBuffer(value: ComputeCommandBuffer) {
        this._computeCMD.computeContext = value.getResource();
        this._computeBuffer = value;
    }

    /**
     * @override
     * @internal
     * @returns 
     */
    getRenderCMD(): ComputeCommandAppatchCMD {
        return this._computeCMD;
    }

    /**
     * @inheritDoc
     * @override
     */
    recover(): void {
        ComputeCommandBufferCMD._pool.recover(this);
        super.recover();
        this._computeCMD.computeContext = null;
    }
}
