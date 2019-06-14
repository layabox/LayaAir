import { PixelLineSprite3D } from "././PixelLineSprite3D";
import { PixelLineVertex } from "././PixelLineVertex";
import { PixelLineData } from "././PixelLineData";
import { BufferState } from "../BufferState"
import { GeometryElement } from "../GeometryElement"
import { RenderContext3D } from "../render/RenderContext3D"
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D"
import { Color } from "../../math/Color"
import { Vector3 } from "../../math/Vector3"
import { LayaGL } from "../../../layagl/LayaGL"
import { Stat } from "../../../utils/Stat"
import { WebGLContext } from "../../../webgl/WebGLContext"
	
	/**
	 * <code>PixelLineFilter</code> 类用于线过滤器。
	 */
	export class PixelLineFilter extends GeometryElement {
		/**@private */
		private static _type:number = GeometryElement._typeCounter++;
		
		/** @private */
		private _floatCountPerVertices:number = 7;
		
		/** @private */
		private _owner:PixelLineSprite3D;
		/** @private */
		private _vertexBuffer:VertexBuffer3D;
		/** @private */
		private _vertices:Float32Array;
		/** @private */
		private _minUpdate:number = Number.MAX_VALUE;
		/** @private */
		private _maxUpdate:number = Number.MIN_VALUE;
		/** @private */
		private _bufferState:BufferState = new BufferState();
		
		/** @private */
		 _maxLineCount:number = 0;
		/** @private */
		 _lineCount:number = 0;
		
		constructor(owner:PixelLineSprite3D, maxLineCount:number){
			super();
var pointCount:number = maxLineCount * 2;
			this._owner = owner;
			this._maxLineCount = maxLineCount;
			this._vertices = new Float32Array(pointCount * this._floatCountPerVertices);
			this._vertexBuffer = new VertexBuffer3D(PixelLineVertex.vertexDeclaration.vertexStride * pointCount, WebGLContext.STATIC_DRAW, false);
			this._vertexBuffer.vertexDeclaration = PixelLineVertex.vertexDeclaration;
			
			this._bufferState.bind();
			this._bufferState.applyVertexBuffer(this._vertexBuffer);
			this._bufferState.unBind();
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _getType():number {
			return PixelLineFilter._type;
		}
		
		/**
		 * @private
		 */
		 _resizeLineData(maxCount:number):void {
			var pointCount:number = maxCount * 2;
			var lastVertices:Float32Array = this._vertices;
			
			this._vertexBuffer.destroy();
			this._maxLineCount = maxCount;
			
			var vertexCount:number = pointCount * this._floatCountPerVertices;
			this._vertices = new Float32Array(vertexCount);
			this._vertexBuffer = new VertexBuffer3D(PixelLineVertex.vertexDeclaration.vertexStride * pointCount, WebGLContext.STATIC_DRAW, false);
			this._vertexBuffer.vertexDeclaration = PixelLineVertex.vertexDeclaration;
			
			if (vertexCount < lastVertices.length) {//取最小长度,拷贝旧数据
				this._vertices.set(new Float32Array(lastVertices.buffer, 0, vertexCount));
				this._vertexBuffer.setData(this._vertices, 0, 0, vertexCount);
			} else {
				this._vertices.set(lastVertices);
				this._vertexBuffer.setData(this._vertices, 0, 0, lastVertices.length);
			}
			
			this._bufferState.bind();
			this._bufferState.applyVertexBuffer(this._vertexBuffer);
			this._bufferState.unBind();
		}
		
		/**
		 * @private
		 */
		private _updateLineVertices(offset:number, startPosition:Vector3, endPosition:Vector3, startColor:Color, endColor:Color):void {
			if (startPosition) {
				this._vertices[offset + 0] = startPosition.x;
				this._vertices[offset + 1] = startPosition.y;
				this._vertices[offset + 2] = startPosition.z;
			}
			
			if (startColor) {
				this._vertices[offset + 3] = startColor.r;
				this._vertices[offset + 4] = startColor.g;
				this._vertices[offset + 5] = startColor.b;
				this._vertices[offset + 6] = startColor.a;
			}
			
			if (endPosition) {
				this._vertices[offset + 7] = endPosition.x;
				this._vertices[offset + 8] = endPosition.y;
				this._vertices[offset + 9] = endPosition.z;
			}
			
			if (endColor) {
				this._vertices[offset + 10] = endColor.r;
				this._vertices[offset + 11] = endColor.g;
				this._vertices[offset + 12] = endColor.b;
				this._vertices[offset + 13] = endColor.a;
			}
			this._minUpdate = Math.min(this._minUpdate, offset);
			this._maxUpdate = Math.max(this._maxUpdate, offset + this._floatCountPerVertices * 2);
		}
		
		/**
		 * @private
		 */
		 _removeLineData(index:number):void {
			var floatCount:number = this._floatCountPerVertices * 2;
			var nextIndex:number = index + 1;
			var offset:number = index * floatCount;
			var nextOffset:number = nextIndex * floatCount;
			var rightPartVertices:Float32Array = new Float32Array(this._vertices.buffer, nextIndex * floatCount * 4, (this._lineCount - nextIndex) * floatCount);
			this._vertices.set(rightPartVertices, offset);
			this._minUpdate = offset;
			this._maxUpdate = offset + this._floatCountPerVertices * 2;
			this._lineCount--;
		}
		
		/**
		 * @private
		 */
		 _updateLineData(index:number, startPosition:Vector3, endPosition:Vector3, startColor:Color, endColor:Color):void {
			var floatCount:number = this._floatCountPerVertices * 2;
			var offset:number = index * floatCount;
			this._updateLineVertices(offset, startPosition, endPosition, startColor, endColor);
		}
		
		/**
		 * @private
		 */
		 _updateLineDatas(index:number, data:PixelLineData[]):void {
			var floatCount:number = this._floatCountPerVertices * 2;
			var offset:number = index * floatCount;
			var count:number = data.length;
			for (var i:number = 0; i < count; i++) {
				var line:PixelLineData = data[i];
				this._updateLineVertices((index + i) * floatCount, line.startPosition, line.endPosition, line.startColor, line.endColor);
			}
		}
		
		/**
		 * 获取线段数据
		 * @return 线段数据。
		 */
		 _getLineData(index:number, out:PixelLineData):void {
			var startPosition:Vector3 = out.startPosition;
			var startColor:Color = out.startColor;
			var endPosition:Vector3 = out.endPosition;
			var endColor:Color = out.endColor;
			
			var vertices:Float32Array = this._vertices;
			var offset:number = index * this._floatCountPerVertices * 2;
			
			startPosition.x = vertices[offset + 0];
			startPosition.y = vertices[offset + 1];
			startPosition.z = vertices[offset + 2];
			startColor.r = vertices[offset + 3];
			startColor.g = vertices[offset + 4];
			startColor.b = vertices[offset + 5];
			startColor.a = vertices[offset + 6];
			
			endPosition.x = vertices[offset + 7];
			endPosition.y = vertices[offset + 8];
			endPosition.z = vertices[offset + 9];
			endColor.r = vertices[offset + 10];
			endColor.g = vertices[offset + 11];
			endColor.b = vertices[offset + 12];
			endColor.a = vertices[offset + 13];
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _prepareRender(state:RenderContext3D):boolean {
			return true;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _render(state:RenderContext3D):void {
			if (this._minUpdate !== Number.MAX_VALUE && this._maxUpdate !== Number.MIN_VALUE) {
				this._vertexBuffer.setData(this._vertices, this._minUpdate, this._minUpdate, this._maxUpdate - this._minUpdate);
				this._minUpdate = Number.MAX_VALUE;
				this._maxUpdate = Number.MIN_VALUE;
			}
			
			if (this._lineCount > 0) {
				this._bufferState.bind();
				LayaGL.instance.drawArrays(WebGLContext.LINES, 0, this._lineCount * 2);
				Stat.renderBatches++;
			}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  destroy():void {
			if (this._destroyed)
				return;
			super.destroy();
			this._bufferState.destroy();
			this._vertexBuffer.destroy();
			this._bufferState = null;
			this._vertexBuffer = null;
			this._vertices = null;
		}
	}

