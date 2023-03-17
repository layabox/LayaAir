import { Mesh } from "../../../resource/models/Mesh";
import { Material } from "../../material/Material";
import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";
import { MeshRenderer } from "../../../core/MeshRenderer";
import { RenderElement } from "../RenderElement";
import { Transform3D } from "../../Transform3D";
import { LayaGL } from "../../../../layagl/LayaGL";
import { RenderContext3D } from "../RenderContext3D";
import { Camera } from "../../Camera";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class DrawMeshCMD extends Command {

    /**@internal */
    private static _pool: DrawMeshCMD[] = [];

    /**
     * @internal
     */
    static create(mesh: Mesh, matrix: Matrix4x4, material: Material, subMeshIndex: number, subShaderIndex: number, commandBuffer: CommandBuffer): DrawMeshCMD {
        var cmd: DrawMeshCMD;
        cmd = DrawMeshCMD._pool.length > 0 ? DrawMeshCMD._pool.pop() : new DrawMeshCMD();

        cmd._matrix = matrix;
        cmd._transform.worldMatrix = cmd._matrix;
        cmd.material = material;
        cmd._subMeshIndex = subMeshIndex;
        cmd._subShaderIndex = subShaderIndex;
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

    /**@internal */
    private _subShaderIndex: number;

    /**@internal */
    private _mesh: Mesh;

    /**@internal */
    _renderElemnts: RenderElement[];

    /**@internal */
    _meshRender: MeshRenderer;

    /**@internal */
    _transform: Transform3D;

    /**
     * 
     */
    constructor() {
        super();
        this._transform = LayaGL.renderOBJCreate.createTransform(null);
        this._meshRender = new MeshRenderer();
    }

    set material(value: Material) {
        this._material && this._material._removeReference(1);
        this._material = value;
        this._material && this._material._addReference(1);
    }

    set mesh(value: Mesh) {
        if (this._mesh == value)
            return;
        this._mesh = value;
        this._meshRender._onMeshChange(this._mesh);
        this._renderElemnts = this._meshRender._renderElements;
        this._renderElemnts.forEach(element => {
            element.material = this._material;
            element.setTransform(this._transform);
            element.renderSubShader = this._material._shader.getSubShaderAt(this._subShaderIndex);
            element._subShaderIndex = this._subShaderIndex;
        });
    }
    /**
     * @inheritDoc
     * @override
     */
    run(): void {
        var context = RenderContext3D._instance;
        this._meshRender.probReflection = context.scene.sceneReflectionProb;
        context._contextOBJ.applyContext(Camera._updateMark);
        let submeshs = this._mesh._subMeshes
        if (this._subMeshIndex == -1) {
            for (let i = 0, n = submeshs.length; i < n; i++) {
                let element = this._renderElemnts[i];
                context.drawRenderElement(element);
            }
        } else {
            let element = this._renderElemnts[this._subMeshIndex];
            context.drawRenderElement(element);
        }
    }

    /**
     * @inheritDoc
     * @override
     */
    recover(): void {
        DrawMeshCMD._pool.push(this);
        super.recover();
        this._material && (this.material = null);
        this._mesh && (this.mesh = null);
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
        this._matrix = null
    }
}