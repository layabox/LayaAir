import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";
import { ShaderData, ShaderDataItem, ShaderDataType } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../../../RenderDriver/DriverDesign/RenderDevice/IRenderCMD";
import { Pool } from "../../../../utils/Pool";

/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class SetShaderDataCMD extends Command {
    static readonly ShaderDataType_define: number = -2;
    /**@internal */
    private static readonly _pool = Pool.createPool(SetShaderDataCMD);

    /**@internal */
    _setRenderDataCMD: SetRenderDataCMD;

    /**
     * @internal
     */
    static create(shaderData: ShaderData, nameID: number, value: ShaderDataItem, shaderDataType: ShaderDataType, commandBuffer: CommandBuffer): SetShaderDataCMD {
        var cmd: SetShaderDataCMD;
        cmd = SetShaderDataCMD._pool.take();
        cmd._setRenderDataCMD.dest = shaderData;
        cmd._setRenderDataCMD.propertyID = nameID;
        cmd._setRenderDataCMD.dataType = shaderDataType;
        cmd._setRenderDataCMD.value = value;
        cmd._commandBuffer = commandBuffer;
        return cmd;
    }

    constructor() {
        super();
        this._setRenderDataCMD = Laya3DRender.Render3DPassFactory.createSetRenderDataCMD();
    }

    /**
     * @override
     * @internal
     * @returns 
     */
    getRenderCMD(): SetRenderDataCMD {
        return this._setRenderDataCMD;
    }

    /**
     * @inheritDoc
     * @override
     */
    recover(): void {
        SetShaderDataCMD._pool.recover(this);
    }
}

export class SetDefineCMD extends Command {
    private static readonly _pool = Pool.createPool(SetDefineCMD);

    /**@internal */
    _setRenderDefineCMD: SetShaderDefineCMD;

    /**
     * @internal
     */
    static create(shaderData: ShaderData, define: ShaderDefine, addDefine: boolean, commandBuffer: CommandBuffer): SetDefineCMD {
        var cmd: SetDefineCMD;
        cmd = SetDefineCMD._pool.take();
        cmd._setRenderDefineCMD.dest = shaderData;
        cmd._setRenderDefineCMD.add = addDefine;
        cmd._setRenderDefineCMD.define = define;
        cmd._commandBuffer = commandBuffer;
        return cmd;
    }

    constructor() {
        super();
        this._setRenderDefineCMD = Laya3DRender.Render3DPassFactory.createSetShaderDefineCMD();
    }

    /**
     * @override
     * @internal
     * @returns 
     */
    getRenderCMD(): SetShaderDefineCMD {
        return this._setRenderDefineCMD;
    }
    /**
     * @inheritDoc
     * @override
     */
    recover(): void {
        SetDefineCMD._pool.recover(this);
    }
}


