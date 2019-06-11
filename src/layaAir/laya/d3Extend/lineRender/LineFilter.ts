import { LineVertex } from "././LineVertex";
import { BufferState } from "laya/d3/core/BufferState"
	import { Camera } from "laya/d3/core/Camera"
	import { GeometryElement } from "laya/d3/core/GeometryElement"
	import { RenderContext3D } from "laya/d3/core/render/RenderContext3D"
	import { IndexBuffer3D } from "laya/d3/graphics/IndexBuffer3D"
	import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { Context } from "laya/resource/Context"
	import { Stat } from "laya/utils/Stat"
	import { WebGL } from "laya/webgl/WebGL"
	import { WebGLContext } from "laya/webgl/WebGLContext"
	
	/**
	 * ...
	 * @author
	 */
	export class LineFilter extends GeometryElement {
		/**@private */
		private static _type:number = this._typeCounter++;
		
		 _camera:Camera;
		 width:number = 0.001;
		
		private _vertexBuffer:VertexBuffer3D;
		private _vertices:Float32Array;
		private _verticesIndex:number = 0;
		private _everyAddVerticeCount:number = 0;
		private _maxVertexCount:number = 1000;
		private _floatCountPerVertices:number = 9;
		
		private positionCount:number = 0;
		private _firstPosition:Vector3 = new Vector3();
		private _delVector3:Vector3 = new Vector3();
		private _lastPosition:Vector3 = new Vector3();
		private _pointAtoBVector3:Vector3 = new Vector3();
		
		 color:Vector4 = new Vector4(1, 0, 0, 1);
		
		private _pointe:Float32Array;
		private _pointAtoBVector3e:Float32Array;
		private _colore:Float32Array;
		
		constructor(){
			super();
this._vertices = new Float32Array(this._maxVertexCount * this._floatCountPerVertices);
			this._vertexBuffer = new VertexBuffer3D(LineVertex.vertexDeclaration.vertexStride * this._maxVertexCount, WebGLContext.STATIC_DRAW, false);
			this._vertexBuffer.vertexDeclaration = LineVertex.vertexDeclaration;
			
			var bufferState:BufferState = new BufferState();
			bufferState.bind();
			bufferState.applyVertexBuffer(this._vertexBuffer);
			bufferState.unBind();
			this._applyBufferState(bufferState);
		}
		
		private _addLineByFirstPosition(firstPosition:Vector3, secondPosition:Vector3):void {
			Vector3.subtract(secondPosition, firstPosition, this._delVector3);
			Vector3.cross(this._delVector3, this._camera.transform.forward, this._pointAtoBVector3);
			Vector3.normalize(this._pointAtoBVector3, this._pointAtoBVector3);
			Vector3.scale(this._pointAtoBVector3, this.width / 2, this._pointAtoBVector3);
			
			this._updateVerticesByPosition(firstPosition);
			
			firstPosition.cloneTo(this._lastPosition);
		}
		
		private _addLineByNextPosition(position:Vector3):void {
			
			Vector3.subtract(position, this._lastPosition, this._delVector3);
			Vector3.cross(this._delVector3, this._camera.transform.forward, this._pointAtoBVector3);
			Vector3.normalize(this._pointAtoBVector3, this._pointAtoBVector3);
			Vector3.scale(this._pointAtoBVector3, this.width / 2, this._pointAtoBVector3);
			
			this._updateVerticesByPosition(position);
			position.cloneTo(this._lastPosition);
		}
		
		 _updateVerticesByPosition(position:Vector3):void {
			
			this._everyAddVerticeCount = 0;
			this._pointe = position.elements;
			this._pointAtoBVector3e = this._pointAtoBVector3.elements;
			this._colore = this.color.elements;
			
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._pointe[0] - this._pointAtoBVector3e[0];
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._pointe[1] - this._pointAtoBVector3e[1];
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._pointe[2] - this._pointAtoBVector3e[2];
			
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._colore[0];
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._colore[1];
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._colore[2];
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._colore[3];
			
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = 0;
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = 0;
			
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._pointe[0] + this._pointAtoBVector3e[0];
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._pointe[1] + this._pointAtoBVector3e[1];
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._pointe[2] + this._pointAtoBVector3e[2];
			
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._colore[0];
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._colore[1];
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._colore[2];
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = this._colore[3];
			
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = 0;
			this._vertices[this._verticesIndex + this._everyAddVerticeCount++] = 0;
			
			this._vertexBuffer.setData(this._vertices, this._verticesIndex, this._verticesIndex, this._everyAddVerticeCount);
			this._verticesIndex += this._everyAddVerticeCount;
		
		}
		
		 addDataForVertexBuffer(position:Vector3):void {
			
			this.positionCount++;
			
			if (this.positionCount == 1) {
				position.cloneTo(this._firstPosition);
			} else if (this.positionCount == 2) {
				this._addLineByFirstPosition(this._firstPosition, position);
				this._addLineByNextPosition(position);
			} else {
				this._addLineByNextPosition(position);
			}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _getType():number {
			return LineFilter._type;
		}
		
		 _update(state:Context):void {
			//_camera = state.camera;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _prepareRender(state:RenderContext3D):boolean {
			//_setVertexBuffer(_vertexBuffer);
			return true;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _render(state:RenderContext3D):void {
			WebGLContext.mainContext.drawArrays(WebGLContext.TRIANGLE_STRIP, 0, this._verticesIndex / this._floatCountPerVertices);
			Stat.renderBatches++;
		}
	
	}


