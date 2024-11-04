import { DrawNodeCMDData } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRender3DCMD";
import { Material } from "../../../../resource/Material";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { BaseRender } from "../BaseRender";
import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";

/**
 * @en Represents a draw render command.
 * @zh 表示一个绘制渲染命令。
 */
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

    /**
     * @en The render object.
     * @zh 渲染对象。
     */
    get render(): BaseRender {
        return this._render;
    }

    set render(render: BaseRender) {
        this._drawNodeCMDData.node = render._baseRenderNode;
        this._render = render;
    }


    /**@internal */
    private _material: Material;

    /**
     * @en The material.
     * @zh 材质。
     */
    get material(): Material {
        return this._material;
    }

    set material(value: Material) {
        this._material && this._material._removeReference(1);

        if (value) {
            value._addReference(1);
            this._drawNodeCMDData.destShaderData = value.shaderData;
            this._drawNodeCMDData.destSubShader = value.shader.getSubShaderAt(0);
        }
        else {
            this._drawNodeCMDData.destShaderData = null;
            this._drawNodeCMDData.destSubShader = null;
        }

        this._material = value;
    }


    private _subMeshIndex: number;

    /**
     * @en The sub-mesh index.
     * @zh 子网格索引。
     */
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

    /**
     * @en Gets the render command data.
     * @zh 获取渲染命令数据。
     */
    getRenderCMD(): DrawNodeCMDData {
        return this._drawNodeCMDData;
    }

    /**
     * @en Runs the  command.
     * @zh 运行命令。
     */
    run(): void {
        if (this.render) {
            this.render.renderUpdate(this._context);
            this._prematerial = this.render.sharedMaterials[this.subMeshIndex];
        }
    }

    /**
     * @inheritDoc
     * @override
     * @en Recovers the render command for reuse.
     * @zh 回收渲染命令以供重用。
     */
    recover(): void {
        DrawRenderCMD._pool.push(this);
        super.recover();
        this.material = null;
        this.render.sharedMaterials[this.subMeshIndex] = this._prematerial;
        this._render = null;
        this.subMeshIndex = 0;
    }

    /**
     * @en Destroys the render command.
     * @zh 销毁渲染命令。
     */
    destroy(): void {
        super.destroy();
        this.material = null;
    }

}