import { DrawNodeCMDData } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRendderCMD";
import { Material } from "../../../../resource/Material";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { BaseRender } from "../BaseRender";
import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";

export class DrawRenderCMD extends Command {
    /**@internal */
    private static _pool: any[] = [];

    /**
     * @internal
     */
    static create(render: BaseRender, material: Material, commandBuffer: CommandBuffer): DrawRenderCMD {
        var cmd: DrawRenderCMD;
        cmd = DrawRenderCMD._pool.length > 0 ? DrawRenderCMD._pool.pop() : new DrawRenderCMD();
        cmd.render = render;
        cmd.material = material;
        cmd._commandBuffer = commandBuffer;
        return cmd;
    }



    /**@internal */
    private _material: Material;
    /**@internal */
    private _prematerial: Material;
    /**@internal */
    private _render: BaseRender;

    /**@internal */
    _drawNodeCMDData: DrawNodeCMDData;

    constructor() {
        super();
        this._drawNodeCMDData = Laya3DRender.Render3DPassFactory.createDrawNodeCMDData();
    }

    set render(render: BaseRender) {
        this._drawNodeCMDData.node = render._baseRenderNode;
        this._render = render;
    }

    set material(value: Material) {
        this._material && this._material._removeReference(1);
        this._material = value;
        this._material && this._material._addReference(1);
       this._drawNodeCMDData.destShaderData = value.shaderData;
       this._drawNodeCMDData.destSubShader = value.shader.getSubShaderAt(0);
    }

    getRenderCMD(): DrawNodeCMDData {
        return this._drawNodeCMDData;
    }

    /**
     * @inheritDoc
     * @override
     */
    recover(): void {
        DrawRenderCMD._pool.push(this);
        super.recover();
        this._material && this._material._removeReference(1);
        this._material = null;
        this.render.sharedMaterial = this._prematerial;
        this.render = null;
    }

    destroy(): void {
        super.destroy();
        this._material && this._material._removeReference(1);
        this._material = null;
    }

}