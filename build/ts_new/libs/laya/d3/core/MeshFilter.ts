import { VertexMesh } from "../graphics/Vertex/VertexMesh";
import { VertexElement } from "../graphics/VertexElement";
import { Mesh } from "../resource/models/Mesh";
import { SubMesh } from "../resource/models/SubMesh";
import { ShaderData } from "../shader/ShaderData";
import { ShaderDefine } from "../shader/ShaderDefine";
import { MeshRenderer } from "./MeshRenderer";
import { MeshSprite3DShaderDeclaration } from "./MeshSprite3DShaderDeclaration";
import { RenderableSprite3D } from "./RenderableSprite3D";

/**
 * <code>MeshFilter</code> 类用于创建网格过滤器。
 */
export class MeshFilter {
	/** @internal */
	private static _meshVerticeDefine: Array<ShaderDefine> = [];

	/** @internal */
	private _owner: RenderableSprite3D;
	/** @internal */
	private _sharedMesh: Mesh;

	/**
	 * 共享网格。
	 */
	get sharedMesh(): Mesh {
		return this._sharedMesh;
	}

	set sharedMesh(value: Mesh) {
		if (this._sharedMesh !== value) {
			var defineDatas: ShaderData = this._owner._render._shaderValues;
			var lastValue: Mesh = this._sharedMesh;
			if (lastValue) {
				lastValue._removeReference();
				this._getMeshDefine(lastValue, MeshFilter._meshVerticeDefine);
				for (var i: number = 0, n: number = MeshFilter._meshVerticeDefine.length; i < n; i++)
					defineDatas.removeDefine(MeshFilter._meshVerticeDefine[i]);
			}

			if (value) {
				value._addReference();
				this._getMeshDefine(value, MeshFilter._meshVerticeDefine);
				for (var i: number = 0, n: number = MeshFilter._meshVerticeDefine.length; i < n; i++)
					defineDatas.addDefine(MeshFilter._meshVerticeDefine[i]);
			}

			((<MeshRenderer>this._owner._render))._onMeshChange(value);
			this._sharedMesh = value;
		}
	}

	/**
	 * 创建一个新的 <code>MeshFilter</code> 实例。
	 * @param owner 所属网格精灵。
	 */
	constructor(owner: RenderableSprite3D) {
		this._owner = owner;
	}

	/**
	 * @internal
	 * @param mesh 
	 * @param out 
	 */
	private _getMeshDefine(mesh: Mesh, out: Array<ShaderDefine>): number {
		out.length = 0;
		var define: number;
		for (var i: number = 0, n: number = mesh._subMeshes.length; i < n; i++) {
			var subMesh: SubMesh = (<SubMesh>mesh.getSubMesh(i));
			var vertexElements: any[] = subMesh._vertexBuffer._vertexDeclaration._vertexElements;
			for (var j: number = 0, m: number = vertexElements.length; j < m; j++) {
				var vertexElement: VertexElement = vertexElements[j];
				var name: number = vertexElement._elementUsage;
				switch (name) {
					case VertexMesh.MESH_COLOR0:
						out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR);
						break
					case VertexMesh.MESH_TEXTURECOORDINATE0:
						out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0);
						break;
					case VertexMesh.MESH_TEXTURECOORDINATE1:
						out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1);
						break;
				}
			}
		}
		return define;
	}

	/**
	 * @inheritDoc
	 */
	destroy(): void {
		this._owner = null;
		(this._sharedMesh) && (this._sharedMesh._removeReference(), this._sharedMesh = null);
	}

}


