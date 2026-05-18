import { Mesh } from "../../../resource/models/Mesh";
import { Material } from "../../../../resource/Material";
import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";
import { MeshRenderer } from "../../../core/MeshRenderer";
import { RenderElement } from "../RenderElement";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { Transform3D } from "../../Transform3D";
import { DrawElementCMDData, DrawNodeCMDData } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRender3DCMD";
import { RenderContext3D } from "../RenderContext3D";
import { Pool } from "../../../../utils/Pool";
import { Stat } from "../../../../utils/Stat";
import { LayaGL } from "../../../../layagl/LayaGL";

/**
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class DrawMeshCMD extends Command {
    private static readonly _pool = Pool.createPool(DrawMeshCMD);

    static create(mesh: Mesh, matrix: Matrix4x4, material: Material, subMeshIndex: number, subShaderIndex: number, commandBuffer: CommandBuffer): DrawMeshCMD {
        var cmd: DrawMeshCMD;
        cmd = DrawMeshCMD._pool.take();
        cmd._matrix = matrix;
        cmd._transform.worldMatrix = cmd._matrix;
        cmd.material = material;
        cmd.subMeshIndex = subMeshIndex;
        cmd._subShaderIndex = subShaderIndex;
        // probReflection 移到 run() 里赋值：_instance.scene 仅在 Camera.render 时有效，
        // create() 时（Scene.open 回调、首帧前）scene 还是 undefined
        cmd.mesh = mesh;
        cmd._commandBuffer = commandBuffer;
        return cmd;
    }

    /**@internal */
    private _material: Material;

    /**@internal */
    private _matrix: Matrix4x4;

    /**@internal */
    private _subMeshIndex: number;

    get subMeshIndex(): number {
        return this._subMeshIndex;
    }

    set subMeshIndex(value: number) {
        this._subMeshIndex = value;
        this._drawRenderCMDDData.subMeshIndex = value;
    }


    private _subShaderIndex: number;


    private _mesh: Mesh;


    private _renderElemnts: RenderElement[];

    /**@internal */
    _meshRender: MeshRenderer;


    private _transform: Transform3D;


    private _drawRenderCMDDData: DrawNodeCMDData;

    constructor() {
        super();
        this._drawRenderCMDDData = Laya3DRender.Render3DPassFactory.createDrawNodeCMDData();
        this._transform = Laya3DRender.Render3DModuleDataFactory.createTransform(null);
        // 合成 transform 不经过 scene 激活；手动 activeInScene 触发驱动层的 ECS/entity 创建，
        // 否则 LayaX 路径下 _baseRenderNode.transform 拿到的 entityId=0，u_WorldMat 永远是 0。
        // WebGL/WebGPU 的 activeInScene 是空实现，不受影响。
        this._transform.activeInScene();
        this._meshRender = new MeshRenderer();

        // LayaX: 预绑 transform 到 baseRenderNode。DrawMeshCMD.run() 每帧会重绑，
        // 触发 Rust 侧 render_node_set_transform 里 world_mat_version 自增，
        // 驱动 pre_render_update 把 ECS 计算好的 WorldMat 写入 Sprite3D UBO。
        // 这里不挂 CullComponent（挂了会让 node 走 scene 可见性/阴影采样路径，
        // 触发 bg_set1 sampler filtering 校验错误，且和 CommandBuffer 的主动绘制语义重复）。
        this._meshRender._baseRenderNode.transform = this._transform;
    }

    /**
     * @internal
     */
    set material(value: Material) {
        this._material && this._material._removeReference(1);
        this._material = value;
        this._material && this._material._addReference(1);
    }

    get material(): Material {
        return this._material;
    }

    /**
     * @internal
     */
    set mesh(value: Mesh) {
        if (this._mesh == value)
            return;
        this._meshRender._onMeshChange(value);
        this._mesh = value;
        this._renderElemnts = this._meshRender._renderElements;
        this._renderElemnts.forEach(element => {
            element.material = this._material;
            element.setTransform(this._transform);
            element.renderSubShader = this._material._shader.getSubShaderAt(this._subShaderIndex);
            element._subShaderIndex = this._subShaderIndex;
        });
    }

    /**
     * @override
     * @internal
     * @returns 
     */
    getRenderCMD(): DrawElementCMDData | DrawNodeCMDData {
        return this._drawRenderCMDDData;
    }

    /**
     * @inheritDoc
     * @override
     */

    run(): void {
        this._meshRender.sharedMaterial = this.material;
        this._meshRender._baseRenderNode.transform = this._transform;
        this._meshRender._baseRenderNode.ismoved.setValue(Stat.loopCount, LayaGL.renderEngine._framePassCount);
        this._meshRender.renderUpdate(RenderContext3D._instance);
        // 每帧 run() 时 _instance.scene 已由 Camera.render 赋值，此时拿 reflection probe 才安全
        // 没它 LayaX 路径会 strip 掉 ReflectionProbe uniform block，导致 u_AmbientColor 未声明
        this._meshRender.probReflection = RenderContext3D._instance.scene && RenderContext3D._instance.scene.sceneReflectionProb;

        this._drawRenderCMDDData.destSubShader = this.material.shader.getSubShaderAt(this._subShaderIndex);
        this._drawRenderCMDDData.destShaderData = this.material.shaderData;
        this._drawRenderCMDDData.node = this._meshRender._baseRenderNode;
    }

    /**
     * @inheritDoc
     * @override
     */
    recover(): void {
        DrawMeshCMD._pool.recover(this);
        super.recover();
        this._material && (this.material = null);
        this._mesh && (this.mesh = null);
        this._meshRender.lightProbe = null;
    }

    /**
     * @inheritDoc
     * @override
     */
    destroy() {
        super.destroy();
        this._renderElemnts.forEach(element => {
            element.destroy();
        });
        this._material && this._material._removeReference(1);
        this._material = null;
        this._renderElemnts = null;
        this._transform = null;
        this._material = null;
        this._matrix = null;
    }
}