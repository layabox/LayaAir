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
    static create(render: BaseRender, material: Material, subMeshIndex: number, commandBuffer: CommandBuffer): DrawRenderCMD {
        var cmd: DrawRenderCMD;
        cmd = DrawRenderCMD._pool.length > 0 ? DrawRenderCMD._pool.pop() : new DrawRenderCMD();
        cmd.render = render;
        cmd.material = material;
        cmd.subMeshIndex = subMeshIndex;
        cmd._commandBuffer = commandBuffer;
        return cmd;
    }

    /**@internal */
    private _render: BaseRender;

    set render(render: BaseRender) {
        this._drawNodeCMDData.node = render._baseRenderNode;
        this._render = render;
    }

    get render(): BaseRender {
        return this._render;
    }

    /**@internal */
    private _material: Material;

    set material(value: Material) {
        this._material && this._material._removeReference(1);
        this._material = value;
        this._material && this._material._addReference(1);
        this._drawNodeCMDData.destShaderData = value.shaderData;
        this._drawNodeCMDData.destSubShader = value.shader.getSubShaderAt(0);
    }

    private _subMeshIndex: number;

    public get subMeshIndex(): number {
        return this._subMeshIndex;
    }
    public set subMeshIndex(value: number) {
        this._subMeshIndex = value;
        this._drawNodeCMDData.subMeshIndex = value;
    }


    /**@internal */
    private _prematerial: Material;

    /**@internal */
    _drawNodeCMDData: DrawNodeCMDData;

    constructor() {
        super();
        this._drawNodeCMDData = Laya3DRender.Render3DPassFactory.createDrawNodeCMDData();
    }

    getRenderCMD(): DrawNodeCMDData {
        return this._drawNodeCMDData;
    }

    run(): void {
        if (this.render) {
            this._prematerial = this.render.sharedMaterials[this.subMeshIndex];
        }
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
        this.render.sharedMaterials[this.subMeshIndex] = this._prematerial;
        this._render = null;
        this.subMeshIndex = 0;
    }

    destroy(): void {
        super.destroy();
        this._material && this._material._removeReference(1);
        this._material = null;
    }

}