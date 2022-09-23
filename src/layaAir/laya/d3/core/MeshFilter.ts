
import { Component } from "../../components/Component";
import { ShaderData } from "../../RenderEngine/RenderShader/ShaderData";
import { ShaderDefine } from "../../RenderEngine/RenderShader/ShaderDefine";
import { VertexMesh } from "../graphics/Vertex/VertexMesh";
import { VertexElement } from "../graphics/VertexElement";
import { Mesh } from "../resource/models/Mesh";
import { SubMesh } from "../resource/models/SubMesh";
import { MeshRenderer } from "./MeshRenderer";
import { MeshSprite3DShaderDeclaration } from "./MeshSprite3DShaderDeclaration";

/**
 * <code>MeshFilter</code> 类用于创建网格过滤器。
 */
export class MeshFilter extends Component {
    /** @internal */
    static _meshVerticeDefine: Array<ShaderDefine> = [];

    /** @internal */
    private _sharedMesh: Mesh;

    constructor() {
        super();

        this.runInEditor = true;
    }

    /**
     * @internal
     */
    protected _onEnable(): void {
        const render = this.owner.getComponent(MeshRenderer) as MeshRenderer;
        render && render._enabled && render._onMeshChange(this._sharedMesh);
    }

    /**
     * @internal
     */
    protected _onDisable(): void {
        const render = this.owner.getComponent(MeshRenderer) as MeshRenderer;
       // render && render._enabled && render._onMeshChange(null);
    }

    /**
     * 共享网格。
     */
    get sharedMesh(): Mesh {
        return this._sharedMesh;
    }

    set sharedMesh(value: Mesh) {
        if (this._sharedMesh !== value) {
            //meshReference
            var lastValue: Mesh = this._sharedMesh;
            if (lastValue) {
                lastValue._removeReference();
            }
            if (value) {
                value._addReference();
            }
            this._sharedMesh = value;

            const render = this.owner.getComponent(MeshRenderer);
            if (!render) {
                return;
            }
            // var defineDatas: ShaderData = render._shaderValues;
            // var lastValue: Mesh = this._sharedMesh;
            // if (lastValue) {
            // 	this._getMeshDefine(lastValue, MeshFilter._meshVerticeDefine);
            // 	for (var i: number = 0, n: number = MeshFilter._meshVerticeDefine.length; i < n; i++)
            // 		defineDatas.removeDefine(MeshFilter._meshVerticeDefine[i]);
            // }

            // if (value) {
            // 	this._getMeshDefine(value, MeshFilter._meshVerticeDefine);
            // 	for (var i: number = 0, n: number = MeshFilter._meshVerticeDefine.length; i < n; i++)
            // 		defineDatas.addDefine(MeshFilter._meshVerticeDefine[i]);
            // }

            render._onMeshChange(value);
            this._sharedMesh = value;
        }
    }

    // /**
    //  * @internal
    //  * @param mesh 
    //  * @param out 
    //  */
    // private _getMeshDefine(mesh: Mesh, out: Array<ShaderDefine>): number {
    // 	out.length = 0;
    // 	var define: number;
    // 	for (var i: number = 0, n: number = mesh._subMeshes.length; i < n; i++) {
    // 		var subMesh: SubMesh = (<SubMesh>mesh.getSubMesh(i));
    // 		var vertexElements: any[] = subMesh._vertexBuffer._vertexDeclaration._vertexElements;
    // 		for (var j: number = 0, m: number = vertexElements.length; j < m; j++) {
    // 			var vertexElement: VertexElement = vertexElements[j];
    // 			var name: number = vertexElement._elementUsage;
    // 			switch (name) {
    // 				case VertexMesh.MESH_COLOR0:
    // 					out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR);
    // 					break
    // 				case VertexMesh.MESH_TEXTURECOORDINATE0:
    // 					out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0);
    // 					break;
    // 				case VertexMesh.MESH_TEXTURECOORDINATE1:
    // 					out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1);
    // 					break;
    // 			}
    // 		}
    // 	}
    // 	return define;
    // }

    protected _onDestroy() {
        (this._sharedMesh) && (this._sharedMesh._removeReference(), this._sharedMesh = null);
    }

    /**
     * @internal
     * @param dest 
     */
    _cloneTo(dest: Component): void {
        let meshfilter = dest as MeshFilter;
        meshfilter.sharedMesh = this.sharedMesh;
        super._cloneTo(dest);
    }

}


