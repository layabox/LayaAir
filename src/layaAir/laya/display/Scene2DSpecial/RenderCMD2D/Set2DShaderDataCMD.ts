import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { LayaGL } from "../../../layagl/LayaGL";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../../RenderDriver/DriverDesign/RenderDevice/IRenderCMD";
import { ShaderData, ShaderDataItem, ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Command2D } from "./Command2D";

export class Set2DShaderDataCMD extends Command2D {
    /**@internal */
    private static _pool: Set2DShaderDataCMD[] = [];


    /**
     * @internal
     */
    static create(shaderData: ShaderData, nameID: number, value: ShaderDataItem, shaderDataType: ShaderDataType): Set2DShaderDataCMD {
        var cmd: Set2DShaderDataCMD;
        cmd = Set2DShaderDataCMD._pool.length > 0 ? Set2DShaderDataCMD._pool.pop() : new Set2DShaderDataCMD();
        cmd.setDest(shaderData);
        cmd._setRenderDataCMD.propertyID = nameID;
        cmd._setRenderDataCMD.dataType = shaderDataType;
        cmd._setRenderDataCMD.value = value;
        return cmd;
    }

    /**@internal */
    _setRenderDataCMD: SetRenderDataCMD;

    _globalMode: boolean = false;


    constructor() {
        super();
        this._setRenderDataCMD = LayaGL.render2DRenderPassFactory.createSetRenderDataCMD();
    }

    /**
     * @override
     * @internal
     * @returns 
     */
    getRenderCMD(): SetRenderDataCMD {
        return this._setRenderDataCMD;
    }


    setDest(value: ShaderData) {
        this._setRenderDataCMD.dest = value;
    }


    /**
     * @inheritDoc
     * @override
     */
    recover(): void {
        Set2DShaderDataCMD._pool.push(this);
        this._globalMode = false;
    }
}

export class Set2DDefineCMD extends Command2D {
    /**@internal */
    private static _pool: Set2DDefineCMD[] = [];

    /**@internal */
    _setRenderDefineCMD: SetShaderDefineCMD;
    /**@internal */
    _globalMode: boolean = false;

    /**
         * @internal
         */
    static create(shaderData: ShaderData, define: ShaderDefine, addDefine: boolean): Set2DDefineCMD {
        var cmd: Set2DDefineCMD;
        cmd = Set2DDefineCMD._pool.length > 0 ? Set2DDefineCMD._pool.pop() : new Set2DDefineCMD();
        cmd.setDest(shaderData);
        cmd._setRenderDefineCMD.add = addDefine;
        cmd._setRenderDefineCMD.define = define;
        return cmd;
    }

    constructor() {
        super();
        this._setRenderDefineCMD = LayaGL.render2DRenderPassFactory.createSetShaderDefineCMD();
    }

    setDest(value: ShaderData) {
        this._setRenderDefineCMD.dest = value;
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
        Set2DDefineCMD._pool.push(this);
        this._globalMode = false;
    }
}