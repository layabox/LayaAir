import { Mesh } from "./Mesh";
import { GeometryElement } from "../../core/GeometryElement"
import { SkinnedMeshRenderer } from "../../core/SkinnedMeshRenderer"
import { SkinnedMeshSprite3D } from "../../core/SkinnedMeshSprite3D"
import { RenderContext3D } from "../../core/render/RenderContext3D"
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D"
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D"
import { LayaGL } from "../../../layagl/LayaGL"
import { Stat } from "../../../utils/Stat"
import { WebGLContext } from "../../../webgl/WebGLContext"

	
	/**
	 * <code>SubMesh</code> 类用于创建子网格数据模板。
	 */
	export class SubMesh extends GeometryElement {
		/** @internal */
		private static _uniqueIDCounter:number = 0;
		/**@internal */
		private static _type:number = GeometryElement._typeCounter++;
		
		/** @internal */
		 _mesh:Mesh;
		
		/** @internal */
		 _boneIndicesList:Uint16Array[];
		/** @internal */
		 _subIndexBufferStart:number[];
		/** @internal */
		 _subIndexBufferCount:number[];
		/** @internal */
		 _skinAnimationDatas:Float32Array[];
		
		/** @internal */
		 _indexInMesh:number;
		
		/** @internal */
		 _vertexStart:number;
		/** @internal */
		 _indexStart:number;
		/** @internal */
		 _indexCount:number;
		/** @internal */
		 _indices:Uint16Array;
		/**@internal [只读]*/
		 _vertexBuffer:VertexBuffer3D;
		/**@internal [只读]*/
		 _indexBuffer:IndexBuffer3D;
		
		/** @internal */
		 _id:number;
		
		/**
		 * 创建一个 <code>SubMesh</code> 实例。
		 * @param	mesh  网格数据模板。
		 */
		constructor(mesh:Mesh){
			super();
this._id = ++SubMesh._uniqueIDCounter;
			this._mesh = mesh;
			this._boneIndicesList = [];
			this._subIndexBufferStart = [];
			this._subIndexBufferCount = [];
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _getType():number {
			return SubMesh._type;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _render(state:RenderContext3D):void {
			this._mesh._bufferState.bind();
			var skinnedDatas:any[] = ((<SkinnedMeshRenderer>state.renderElement.render ))._skinnedData;
			if (skinnedDatas) {
				var subSkinnedDatas:Float32Array[] = skinnedDatas[this._indexInMesh];
				var boneIndicesListCount:number = this._boneIndicesList.length;
				for (var i:number = 0; i < boneIndicesListCount; i++) {
					state.shader.uploadCustomUniform(SkinnedMeshSprite3D.BONES, subSkinnedDatas[i]);
					LayaGL.instance.drawElements(WebGLContext.TRIANGLES, this._subIndexBufferCount[i], WebGLContext.UNSIGNED_SHORT, this._subIndexBufferStart[i] * 2);
				}
			} else {
				LayaGL.instance.drawElements(WebGLContext.TRIANGLES, this._indexCount, WebGLContext.UNSIGNED_SHORT, this._indexStart * 2);
			}
			Stat.trianglesFaces += this._indexCount / 3;
			Stat.renderBatches++;
		}
		
		/**
		 * @internal
		 */
		 getIndices():Uint16Array {
			return this._indices;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  destroy():void {
			if (this._destroyed)
				return;
			super.destroy();
			this._indexBuffer.destroy();
			this._indexBuffer = null;
			this._mesh = null;
			this._boneIndicesList = null;
			this._subIndexBufferStart = null;
			this._subIndexBufferCount = null;
			this._skinAnimationDatas = null;
		
		}
	}

