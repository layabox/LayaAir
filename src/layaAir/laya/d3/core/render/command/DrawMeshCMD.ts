import { DefineDatas } from "../../../../RenderEngine/RenderShader/DefineDatas";
import { Matrix4x4 } from "../../../math/Matrix4x4";
import { Mesh } from "../../../resource/models/Mesh";
import { Material } from "../../material/Material";
import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";
import { MeshRenderer } from "../../../core/MeshRenderer";
import { RenderElement } from "../RenderElement";
import { Transform3D } from "../../Transform3D";
import { LayaGL } from "../../../../layagl/LayaGL";
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
        cmd._mesh = mesh;
        cmd._matrix = matrix;
		cmd._meshRender._onMeshChange(cmd._mesh);
        cmd._transform.worldMatrix = cmd._matrix;
		cmd._meshRender.sharedMaterial = cmd._material;
        cmd._material = material;
        cmd._subMeshIndex = subMeshIndex;
        cmd._subShaderIndex = subShaderIndex;
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
    _meshRender:MeshRenderer;

    /**@internal */
    _transform:Transform3D;
    
    /**
     * 
     */
    constructor() {
        super();
        this._meshRender = new MeshRenderer();
		this._transform = LayaGL.renderOBJCreate.createTransform(null);
    }

    /**
	 * @inheritDoc
	 * @override
	 */
    run(): void {
        this._meshRender._onMeshChange(this._mesh);
        this._transform.worldMatrix = this._matrix;
        this._meshRender.sharedMaterial = this._material;
        this.setContext(this._commandBuffer._context);
        this._context._contextOBJ.applyContext();
        if (this._subMeshIndex == -1) {
            let elements = this._meshRender._renderElements;
            for (var i: number = 0, n = elements.length; i < n; i++) {
                let element = elements[i];
                this.runRenderElement(element);
            }
        }
        else {
            let element = this._meshRender._renderElements[this._subMeshIndex];
            if(element) this.runRenderElement(element);
            
        }
    }

    /**
     * change && Run Element
     * @param element 
     */
    runRenderElement(element:RenderElement){
        var context = this._context;
        //Set RenderElement
        element.renderSubShader =  this._material._shader.getSubShaderAt(this._subShaderIndex);
        element.material = this._material;
        element.setTransform(this._transform);
        element._renderUpdatePre(context);
        element._render(context._contextOBJ);
    }

    /**
	 * @inheritDoc
	 * @override
	 */
    recover(): void {
        DrawMeshCMD._pool.push(this);
    }

    /**
     * @inheritDoc
     * @override
     */
    destroy(){
        super.destroy();
        this._meshRender.destroy();
        this._transform = null;
        this._material = null;
        this._matrix = null
    }
}