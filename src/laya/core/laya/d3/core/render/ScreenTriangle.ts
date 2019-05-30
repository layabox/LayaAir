import { BufferState } from "../BufferState"
	import { VertexBuffer3D } from "../../graphics/VertexBuffer3D"
	import { VertexDeclaration } from "../../graphics/VertexDeclaration"
	import { VertexElement } from "../../graphics/VertexElement"
	import { VertexElementFormat } from "../../graphics/VertexElementFormat"
	import { Vector4 } from "../../math/Vector4"
	import { LayaGL } from "laya/layagl/LayaGL"
	import { Resource } from "laya/resource/Resource"
	import { Stat } from "laya/utils/Stat"
	import { WebGLContext } from "laya/webgl/WebGLContext"
	
	/**
	 * <code>ScreenTriangle</code> 类用于创建全屏三角形。
	 */
	export class ScreenTriangle extends Resource {
		/** @private */
		 static SCREENTRIANGLE_POSITION_UV:number = 0;
		/** @private */
		private static _vertexDeclaration:VertexDeclaration = new VertexDeclaration(16, [new VertexElement(0, VertexElementFormat.Vector4, ScreenTriangle.SCREENTRIANGLE_POSITION_UV)]);
		/** @private */
		private static _vertices:Float32Array = new Float32Array([1, -1, 0, 1,  -1, 3, 0, -1,   3, -1, 2, 1]);
		/** @private */ 
		private static _verticesInvertUV:Float32Array = new Float32Array([1, -1, 0, 0,   -1, 3, 0, 2,   3, -1, 2, 0]);
		
		/**@private */
		 static instance:ScreenTriangle;
		
		/**
		 * @private
		 */
		 static __init__():void {
			ScreenTriangle.instance = new ScreenTriangle();
			ScreenTriangle.instance.lock = true;
		}
		
		/** @private */
		private _vertexBuffer:VertexBuffer3D;
		/** @private */
		private _bufferState:BufferState = new BufferState();
		/** @private */
		private _vertexBufferInvertUV:VertexBuffer3D;
		/** @private */
		private _bufferStateInvertUV:BufferState = new BufferState();
		
		/**
		 * 创建一个 <code>ScreenTriangle</code> 实例,禁止使用。
		 */
		constructor(){
			super();
this._vertexBuffer = new VertexBuffer3D(12 * 4, WebGLContext.STATIC_DRAW, false);
			this._vertexBuffer.vertexDeclaration = ScreenTriangle._vertexDeclaration;
			this._vertexBuffer.setData(ScreenTriangle._vertices);
			this._bufferState.bind();
			this._bufferState.applyVertexBuffer(this._vertexBuffer);
			this._bufferState.unBind();
			
			this._vertexBufferInvertUV = new VertexBuffer3D(12 * 4, WebGLContext.STATIC_DRAW, false);
			this._vertexBufferInvertUV.vertexDeclaration = ScreenTriangle._vertexDeclaration;
			this._vertexBufferInvertUV.setData(ScreenTriangle._verticesInvertUV);
			this._bufferStateInvertUV.bind();
			this._bufferStateInvertUV.applyVertexBuffer(this._vertexBufferInvertUV);
			this._bufferStateInvertUV.unBind();
			
			this._setGPUMemory(this._vertexBuffer._byteLength + this._vertexBufferInvertUV._byteLength);
		}
		
		/**
		 * @private
		 */
		 render():void {
			this._bufferState.bind();
			LayaGL.instance.drawArrays(WebGLContext.TRIANGLES, 0, 3);
			Stat.renderBatches++;
		}
		
		/**
		 * @private
		 */
		 renderInvertUV():void {
			this._bufferStateInvertUV.bind();
			LayaGL.instance.drawArrays(WebGLContext.TRIANGLES, 0, 3);
			Stat.renderBatches++;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  destroy():void {
			super.destroy();
			this._bufferState.destroy();
			this._vertexBuffer.destroy();
			this._bufferStateInvertUV.destroy();
			this._vertexBufferInvertUV.destroy();
			this._setGPUMemory(0);
		}
	
	}


