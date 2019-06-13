import { CubeGeometry } from "././CubeGeometry";
import { CubeMap } from "././CubeMap";
import { CubeInfo } from "././CubeInfo";
import { BufferState } from "laya/d3/core/BufferState"
	import { Camera } from "laya/d3/core/Camera"
	import { RenderContext3D } from "laya/d3/core/render/RenderContext3D"
	import { IndexBuffer3D } from "laya/d3/graphics/IndexBuffer3D"
	import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh"
	import { Resource } from "laya/resource/Resource"
	import { Handler } from "laya/utils/Handler"
	import { Texture2D } from "laya/resource/Texture2D"

	import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D"
	import { VertexDeclaration } from "laya/d3/graphics/VertexDeclaration"
	import { BoundBox } from "laya/d3/math/BoundBox"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { LayaGL } from "laya/layagl/LayaGL"
	
	import { Stat } from "laya/utils/Stat"
	import { WebGLContext } from "laya/webgl/WebGLContext"

	/**
	 * <code>SubCubeGeometry</code> 类用于实现方块子几何体。
	 */
	export class SubCubeGeometry {
		/**@private */
		 static SIZE:number = 32;
		/**@private */
		 static MAXSUBCOUNT:number = CubeGeometry.HLAFMAXSIZE * 2 / SubCubeGeometry.SIZE;
		/**@private */
		 static SUBVERTEXCOUNT:number = 65536 / 8;//8192个顶点结构,最多2048个plane
		/**@private */
		 static MaxVertexCount:number = 0;
		/**@private */
		 static FLOATCOUNTPERVERTEX:number = 10;
		/**@private */
		 static FLOATCOUNTPERPLANE:number = 40;
		/**@private */
		 static HALFMAXNumCube:number = 1600;
		
		/**@private */
		private static _pool:SubCubeGeometry[] = [];
		/**@private */
		private static _indexBuffer:IndexBuffer3D;
		
		//12.10
		/**@private */
		private static _UVvertexBuffer:VertexBuffer3D
		
		
		/**
		 * @private
		 */
		 static create(owner:CubeGeometry):SubCubeGeometry {
			var subCube:SubCubeGeometry;
			if (SubCubeGeometry._pool.length) {
				subCube = SubCubeGeometry._pool.pop();
				subCube._cubeMap = owner.cubeMap;
				subCube._currentVertexCount = 0;
			} else {
				subCube = new SubCubeGeometry();
				subCube._cubeMap = owner.cubeMap;
			}
			return subCube;
		}
		
		/**
		 * @private
		 */
		 static recover(cube:SubCubeGeometry):void {
			SubCubeGeometry._pool.push(cube);
		}
		
		/**
		 * @private
		 */
		 static __init__():void {
			//indexBuffer
			var maxFaceNums:number = 65536 / 4;
			var indexCount:number = maxFaceNums * 6;
			SubCubeGeometry._indexBuffer = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, indexCount, WebGLContext.STATIC_DRAW, false);
			var indices:Uint16Array = new Uint16Array(indexCount);
			for (var i:number = 0; i < maxFaceNums; i++) {
				var indexOffset:number = i * 6;
				var pointOffset:number = i * 4;
				indices[indexOffset] = pointOffset;
				indices[indexOffset + 1] = 2 + pointOffset;
				indices[indexOffset + 2] = 1 + pointOffset;
				indices[indexOffset + 3] = pointOffset;
				indices[indexOffset + 4] = 3 + pointOffset;
				indices[indexOffset + 5] = 2 + pointOffset;
			}
			SubCubeGeometry._indexBuffer.setData(indices);
			
			//UVvertexBuffer
			//12.10
			var uvArrayCount:number = maxFaceNums * 4 * 2;
			SubCubeGeometry._UVvertexBuffer = new VertexBuffer3D(uvArrayCount * 4, WebGLContext.STATIC_DRAW, false);
			var uvs:Float32Array = new Float32Array(uvArrayCount);
			for (var j:number = 0; j < maxFaceNums; j++) {
				var uvoffset:number = j * 8;
				uvs[uvoffset] = 1;
				uvs[uvoffset + 1] = 0;
				
				uvs[uvoffset + 2] = 0;
				uvs[uvoffset + 3] = 0;
				
				uvs[uvoffset + 4] = 0;
				uvs[uvoffset + 5] = 1;
				
				uvs[uvoffset + 6] = 1;
				uvs[uvoffset + 7] = 1;
			}
			SubCubeGeometry._UVvertexBuffer.setData(uvs);
			var verDec:VertexDeclaration = VertexMesh.getVertexDeclaration("UV");
			SubCubeGeometry._UVvertexBuffer.vertexDeclaration = verDec;
		}
		
		/**
		 * @private
		 */
		 static getKey(x:number, y:number, z:number):number {
			return (Math.floor(x / SubCubeGeometry.SIZE)) * SubCubeGeometry.MAXSUBCOUNT * SubCubeGeometry.MAXSUBCOUNT + (Math.floor(y / SubCubeGeometry.SIZE)) * SubCubeGeometry.MAXSUBCOUNT + Math.floor(z / SubCubeGeometry.SIZE);
		}
		
		/**@private 当前渲染点的数量 加减4*/
		 _currentVertexCount:number = 0;
		/**@private */
		 _currentVertexSize:number;
		/**@private */
		 _vertices:Float32Array[] = [];//长度一般为1,最大为4
		/**@private */
		 _vertexbuffers:VertexBuffer3D[] = [];//长度一般为1,最大为4
		/**@private */
		 _vertexUpdateFlag:any[][] = [];//长度一般为1,最大为4
		/**@private */
		 _bufferStates:BufferState[] = [];//长度一般为1,最大为4
		/**@private */
		 _cubeMap:CubeMap;
		
		/**@private */
		 cubeCount:number = 0;
		
		/**@private */
		//public var boundBox:BoundBox = new BoundBox(new Vector3(),new Vector3());
		
		/**
		 * 创建一个新的<code>SubCubeGeometry</code> 实例
		 * @param cubeGeometry父几何体
		 */
		constructor(){
			this._createVertexBuffer(SubCubeGeometry.SUBVERTEXCOUNT);
			this._currentVertexSize = SubCubeGeometry.SUBVERTEXCOUNT;
			
			var memory:number = this._currentVertexSize * SubCubeGeometry.FLOATCOUNTPERVERTEX * 4;
			Resource._addCPUMemory(memory);
			Resource._addGPUMemory(memory);
		}
		
		/**
		 * @private
		 */
		 _clearEditerInfo():void {
			this._cubeMap = null;
		}
		
		/**
		 * @private
		 */
		private _createVertexBuffer(verticesCount:number):void {
			var verDec:VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR"); /*VertexPositionNormalColor.vertexDeclaration*/
			var newVertices:Float32Array = new Float32Array(verticesCount * SubCubeGeometry.FLOATCOUNTPERVERTEX);
			var newVertecBuffer:VertexBuffer3D = new VertexBuffer3D(verDec.vertexStride * verticesCount, WebGLContext.DYNAMIC_DRAW, false);
			//
			var vertexbufferVector:VertexBuffer3D[] = [];
			var bufferState:BufferState = new BufferState();
			newVertecBuffer.vertexDeclaration = verDec;
			
			
			//12.10
			
			bufferState.bind();
			vertexbufferVector.push(newVertecBuffer);
			//bufferState.applyVertexBuffer(newVertecBuffer);
			vertexbufferVector.push(SubCubeGeometry._UVvertexBuffer);

			bufferState.applyVertexBuffers(vertexbufferVector);
			bufferState.applyIndexBuffer(SubCubeGeometry._indexBuffer);
			
			bufferState.unBind();
			
			this._vertices.push(newVertices);
			this._vertexbuffers.push(newVertecBuffer);
			this._vertexUpdateFlag.push([2147483647/*int.MAX_VALUE*/, -2147483647]);//0:startUpdate,1:endUpdate
			this._bufferStates.push(bufferState);
		}
		
		/**
		 * @private
		 */
		private _resizeVertexBuffer(vertexCount:number):void {
			var needBufferCount:number = Math.ceil(vertexCount / 65536);
			var curBufferIndex:number = this._vertexbuffers.length - 1;
			
			var curBufferResizeCount:number = Math.min(vertexCount - curBufferIndex * 65536, 65536);
			
			if (this._currentVertexSize % 65536 !== 0) {
				var curVertices:Float32Array = this._vertices[curBufferIndex];
				var curVertexBuffer:VertexBuffer3D = this._vertexbuffers[curBufferIndex];
				var bufferState:BufferState = this._bufferStates[curBufferIndex];
				var lastVertices:Float32Array = curVertices;
				curVertexBuffer.destroy();//销毁旧Buffer
				
				curVertices = new Float32Array(curBufferResizeCount * SubCubeGeometry.FLOATCOUNTPERVERTEX);
				curVertices.set(lastVertices, 0);//拷贝旧数据
				var verdec:VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR");
				curVertexBuffer = new VertexBuffer3D(verdec.vertexStride* curBufferResizeCount, WebGLContext.DYNAMIC_DRAW, false);
				curVertexBuffer.vertexDeclaration = verdec/*VertexPositionNormalColor.vertexDeclaration*/;
				curVertexBuffer.setData(curVertices);
				this._vertices[curBufferIndex] = curVertices;
				this._vertexbuffers[curBufferIndex] = curVertexBuffer;
				
				bufferState.bind();
				bufferState.applyVertexBuffer(curVertexBuffer);
				bufferState.unBind();
			}
			for (var i:number = curBufferIndex + 1; i < needBufferCount; i++) {
				var verticesCount:number = Math.min(vertexCount - i * 65536, 65536);
				this._createVertexBuffer(verticesCount);
			}
			
			var memory:number = (vertexCount - this._currentVertexSize) * SubCubeGeometry.FLOATCOUNTPERVERTEX * 4;
		
			Resource._addCPUMemory(memory);
			Resource._addGPUMemory(memory);
			this._currentVertexSize = vertexCount;
		}
		
		/**
		 * @private
		 * 增加一个面
		 */
		 _addFaceVertex(cubeInfo:CubeInfo, FaceIndex:number):void {
		
			if (cubeInfo.getVBPointbyFaceIndex(FaceIndex) != -1) {
				return;
			}
			
			var subCube:SubCubeGeometry = cubeInfo.subCube;
			if (!subCube)
			{
				return;
			}
			if (subCube._currentVertexCount === subCube._currentVertexSize)
				subCube._resizeVertexBuffer(subCube._currentVertexSize + SubCubeGeometry.SUBVERTEXCOUNT);//一帧增加不会超过2048平面,扩一次够用
			
			var point1Factor:number, point2Factor:number, point3Factor:number, point4Factor:number;
			var cubeInfo1:CubeInfo, cubeInfo2:CubeInfo, cubeInfo3:CubeInfo, cubeInfo4:CubeInfo;
			var aoFactor:number[] = CubeInfo.aoFactor;
			//获得绝对位置
			//添加面前找到对应的subCubeGeometry
			var vertices:Float32Array[] = subCube._vertices;
			var vertexUpdateFlag:any[][] = subCube._vertexUpdateFlag;
			
			var x:number = cubeInfo.x - CubeGeometry.HLAFMAXSIZE;
			var y:number = cubeInfo.y - CubeGeometry.HLAFMAXSIZE;
			var z:number = cubeInfo.z - CubeGeometry.HLAFMAXSIZE;
			var colorIndex:number = cubeInfo.color;
			
			var offset:number = Math.floor(subCube._currentVertexCount % 65536) * 10;
			
			//第几个vertexbuffer
			var verticesIndex:number = subCube._currentVertexCount==0?0:Math.ceil(subCube._currentVertexCount /65536) - 1;
			
			var vertexArray:Float32Array = vertices[verticesIndex];
			var updateFlag:any[] = vertexUpdateFlag[verticesIndex];
			
			//维护StartEnd
			(updateFlag[0] > offset) && (updateFlag[0] = offset);
			(updateFlag[1] < offset + 39) && (updateFlag[1] = offset + 39);
			
			//总点+4
			subCube._currentVertexCount += 4;
			
			//将颜色值解压
			//var r:Number = ((colorIndex & 0x1f) << 3) / 255;
			//var g:Number = ((colorIndex & 0x3e0) >> 2) / 255;
			//var b:Number = ((colorIndex >> 10) << 3) / 255;
			//var a:Number = 1;
			var r:number = (colorIndex & 0xff)/255;
			var g:number = ((colorIndex & 0xff00) >> 8) / 255;
			var b:number = ((colorIndex & 0xff0000) >> 16) / 255;
			var a:number = (colorIndex & 0xff000000) >> 24;
			
			var num1:number;
			var num2:number;
			var num3:number;
			var num4:number;
			
			switch (FaceIndex) {
			case 0: 
				cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z + 1);
				cubeInfo2 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z + 1);
				cubeInfo3 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z + 1);
				cubeInfo4 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z + 1);
				num1 = CubeInfo.Objcect4front[cubeInfo1.point];
				num2 = CubeInfo.Objcect5front[cubeInfo2.point];
				num3 = CubeInfo.Objcect1front[cubeInfo3.point];
				num4 = CubeInfo.Objcect0front[cubeInfo4.point];
				//维护AO
				
				point1Factor = aoFactor[num1];
				point2Factor = aoFactor[num2];
				point3Factor = aoFactor[num3];
				point4Factor = aoFactor[num4];
				
				//_addOnePlaneVertex(0, cubeInfo, point1Factor, point2Factor, point3Factor, point4Factor);
				cubeInfo.frontVBIndex = (verticesIndex << 24) + offset;
				vertexArray[offset] = x + 1;
				vertexArray[offset + 1] = y + 1;
				vertexArray[offset + 2] = z + 1;
				vertexArray[offset + 3] = 0.0;
				vertexArray[offset + 4] = 0.0;
				vertexArray[offset + 5] = 1.0;
				vertexArray[offset + 6] = r * point1Factor;
				vertexArray[offset + 7] = g * point1Factor;
				vertexArray[offset + 8] = b * point1Factor;
				vertexArray[offset + 9] = a;
				vertexArray[offset + 10] = x;
				vertexArray[offset + 11] = y + 1;
				vertexArray[offset + 12] = z + 1;
				vertexArray[offset + 13] = 0.0;
				vertexArray[offset + 14] = 0.0;
				vertexArray[offset + 15] = 1.0;
				vertexArray[offset + 16] = r * point2Factor;
				vertexArray[offset + 17] = g * point2Factor;
				vertexArray[offset + 18] = b * point2Factor;
				vertexArray[offset + 19] = a;
				vertexArray[offset + 20] = x;
				vertexArray[offset + 21] = y;
				vertexArray[offset + 22] = z + 1;
				vertexArray[offset + 23] = 0.0;
				vertexArray[offset + 24] = 0.0;
				vertexArray[offset + 25] = 1.0;
				vertexArray[offset + 26] = r * point3Factor;
				vertexArray[offset + 27] = g * point3Factor;
				vertexArray[offset + 28] = b * point3Factor;
				vertexArray[offset + 29] = a;
				vertexArray[offset + 30] = x + 1;
				vertexArray[offset + 31] = y;
				vertexArray[offset + 32] = z + 1;
				vertexArray[offset + 33] = 0.0;
				vertexArray[offset + 34] = 0.0;
				vertexArray[offset + 35] = 1.0;
				vertexArray[offset + 36] = r * point4Factor;
				vertexArray[offset + 37] = g * point4Factor;
				vertexArray[offset + 38] = b * point4Factor;
				vertexArray[offset + 39] = a;
				break;
			case 1: 
				
				cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z + 1);
				cubeInfo2 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z + 1);
				cubeInfo3 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z);
				cubeInfo4 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z);
				num1 = CubeInfo.Objcect4right[cubeInfo1.point];
				num2 = CubeInfo.Objcect0right[cubeInfo2.point];
				num3 = CubeInfo.Objcect2right[cubeInfo3.point];
				num4 = CubeInfo.Objcect6right[cubeInfo4.point];
				point1Factor = aoFactor[num1];
				point2Factor = aoFactor[num2];
				point3Factor = aoFactor[num3];
				point4Factor = aoFactor[num4];
				//_addOnePlaneVertex(1, cubeInfo, point1Factor, point2Factor, point3Factor, point4Factor);
				cubeInfo.rightVBIndex = (verticesIndex << 24) + offset;
				vertexArray[offset] = x + 1;
				vertexArray[offset + 1] = y + 1;
				vertexArray[offset + 2] = z + 1;
				vertexArray[offset + 3] = 1.0;
				vertexArray[offset + 4] = 0.0;
				vertexArray[offset + 5] = 0.0;
				vertexArray[offset + 6] = r * point1Factor;
				vertexArray[offset + 7] = g * point1Factor;
				vertexArray[offset + 8] = b * point1Factor;
				vertexArray[offset + 9] = a;
				vertexArray[offset + 10] = x + 1;
				vertexArray[offset + 11] = y;
				vertexArray[offset + 12] = z + 1;
				vertexArray[offset + 13] = 1.0;
				vertexArray[offset + 14] = 0.0;
				vertexArray[offset + 15] = 0.0;
				vertexArray[offset + 16] = r * point2Factor;
				vertexArray[offset + 17] = g * point2Factor;
				vertexArray[offset + 18] = b * point2Factor;
				vertexArray[offset + 19] = a;
				vertexArray[offset + 20] = x + 1;
				vertexArray[offset + 21] = y;
				vertexArray[offset + 22] = z;
				vertexArray[offset + 23] = 1.0;
				vertexArray[offset + 24] = 0.0;
				vertexArray[offset + 25] = 0.0;
				vertexArray[offset + 26] = r * point3Factor;
				vertexArray[offset + 27] = g * point3Factor;
				vertexArray[offset + 28] = b * point3Factor;
				vertexArray[offset + 29] = a;
				vertexArray[offset + 30] = x + 1;
				vertexArray[offset + 31] = y + 1;
				vertexArray[offset + 32] = z;
				vertexArray[offset + 33] = 1.0;
				vertexArray[offset + 34] = 0.0;
				vertexArray[offset + 35] = 0.0;
				vertexArray[offset + 36] = r * point4Factor;
				vertexArray[offset + 37] = g * point4Factor;
				vertexArray[offset + 38] = b * point4Factor;
				vertexArray[offset + 39] = a;
				break;
			case 2: 
				cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z + 1);
				cubeInfo2 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z);
				cubeInfo3 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z);
				cubeInfo4 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z + 1);
				num1 = CubeInfo.Objcect4up[cubeInfo1.point];
				num2 = CubeInfo.Objcect6up[cubeInfo2.point];
				num3 = CubeInfo.Objcect7up[cubeInfo3.point];
				num4 = CubeInfo.Objcect5up[cubeInfo4.point];
				point1Factor = aoFactor[num1];
				point2Factor = aoFactor[num2];
				point3Factor = aoFactor[num3];
				point4Factor = aoFactor[num4];
				//_addOnePlaneVertex(2, cubeInfo, point1Factor, point2Factor, point3Factor, point4Factor);
				cubeInfo.topVBIndex = (verticesIndex << 24) + offset;
				vertexArray[offset] = x + 1;
				vertexArray[offset + 1] = y + 1;
				vertexArray[offset + 2] = z + 1;
				vertexArray[offset + 3] = 0.0;
				vertexArray[offset + 4] = 1.0;
				vertexArray[offset + 5] = 0.0;
				vertexArray[offset + 6] = r * point1Factor;
				vertexArray[offset + 7] = g * point1Factor;
				vertexArray[offset + 8] = b * point1Factor;
				vertexArray[offset + 9] = a;
				vertexArray[offset + 10] = x + 1;
				vertexArray[offset + 11] = y + 1;
				vertexArray[offset + 12] = z;
				vertexArray[offset + 13] = 0.0;
				vertexArray[offset + 14] = 1.0;
				vertexArray[offset + 15] = 0.0;
				vertexArray[offset + 16] = r * point2Factor;
				vertexArray[offset + 17] = g * point2Factor;
				vertexArray[offset + 18] = b * point2Factor;
				vertexArray[offset + 19] = a;
				vertexArray[offset + 20] = x;
				vertexArray[offset + 21] = y + 1;
				vertexArray[offset + 22] = z;
				vertexArray[offset + 23] = 0.0;
				vertexArray[offset + 24] = 1.0;
				vertexArray[offset + 25] = 0.0;
				vertexArray[offset + 26] = r * point3Factor;
				vertexArray[offset + 27] = g * point3Factor;
				vertexArray[offset + 28] = b * point3Factor;
				vertexArray[offset + 29] = a;
				vertexArray[offset + 30] = x;
				vertexArray[offset + 31] = y + 1;
				vertexArray[offset + 32] = z + 1;
				vertexArray[offset + 33] = 0.0;
				vertexArray[offset + 34] = 1.0;
				vertexArray[offset + 35] = 0.0;
				vertexArray[offset + 36] = r * point4Factor;
				vertexArray[offset + 37] = g * point4Factor;
				vertexArray[offset + 38] = b * point4Factor;
				vertexArray[offset + 39] = a;
				break;
			case 3: 
				cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z + 1);
				cubeInfo2 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z);
				cubeInfo3 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z);
				cubeInfo4 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z + 1);
				num1 = CubeInfo.Objcect5left[cubeInfo1.point];
				num2 = CubeInfo.Objcect7left[cubeInfo2.point];
				num3 = CubeInfo.Objcect3left[cubeInfo3.point];
				num4 = CubeInfo.Objcect1left[cubeInfo4.point];
				point1Factor = aoFactor[num1];
				point2Factor = aoFactor[num2];
				point3Factor = aoFactor[num3];
				point4Factor = aoFactor[num4];
				//_addOnePlaneVertex(3, cubeInfo, point1Factor, point2Factor, point3Factor, point4Factor);
				cubeInfo.leftVBIndex = (verticesIndex << 24) + offset;
				vertexArray[offset] = x;
				vertexArray[offset + 1] = y + 1;
				vertexArray[offset + 2] = z + 1;
				vertexArray[offset + 3] = -1.0;
				vertexArray[offset + 4] = 0.0;
				vertexArray[offset + 5] = 0.0;
				vertexArray[offset + 6] = r * point1Factor;
				vertexArray[offset + 7] = g * point1Factor;
				vertexArray[offset + 8] = b * point1Factor;
				vertexArray[offset + 9] = a;
				vertexArray[offset + 10] = x;
				vertexArray[offset + 11] = y + 1;
				vertexArray[offset + 12] = z;
				vertexArray[offset + 13] = -1.0;
				vertexArray[offset + 14] = 0.0;
				vertexArray[offset + 15] = 0.0;
				vertexArray[offset + 16] = r * point2Factor;
				vertexArray[offset + 17] = g * point2Factor;
				vertexArray[offset + 18] = b * point2Factor;
				vertexArray[offset + 19] = a;
				vertexArray[offset + 20] = x;
				vertexArray[offset + 21] = y;
				vertexArray[offset + 22] = z;
				vertexArray[offset + 23] = -1.0;
				vertexArray[offset + 24] = 0.0;
				vertexArray[offset + 25] = 0.0;
				vertexArray[offset + 26] = r * point3Factor;
				vertexArray[offset + 27] = g * point3Factor;
				vertexArray[offset + 28] = b * point3Factor;
				vertexArray[offset + 29] = a;
				vertexArray[offset + 30] = x;
				vertexArray[offset + 31] = y;
				vertexArray[offset + 32] = z + 1;
				vertexArray[offset + 33] = -1.0;
				vertexArray[offset + 34] = 0.0;
				vertexArray[offset + 35] = 0.0;
				vertexArray[offset + 36] = r * point4Factor;
				vertexArray[offset + 37] = g * point4Factor;
				vertexArray[offset + 38] = b * point4Factor;
				vertexArray[offset + 39] = a;
				break;
			case 4: 
				cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z);
				cubeInfo2 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z);
				cubeInfo3 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z + 1);
				cubeInfo4 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z + 1);
				num1 = CubeInfo.Objcect3down[cubeInfo1.point];
				num2 = CubeInfo.Objcect2down[cubeInfo2.point];
				num3 = CubeInfo.Objcect0down[cubeInfo3.point];
				num4 = CubeInfo.Objcect1down[cubeInfo4.point];
				point1Factor = aoFactor[num1];
				point2Factor = aoFactor[num2];
				point3Factor = aoFactor[num3];
				point4Factor = aoFactor[num4];
				//_addOnePlaneVertex(4, cubeInfo, point1Factor, point2Factor, point3Factor, point4Factor);
				cubeInfo.downVBIndex = (verticesIndex << 24) + offset;
				vertexArray[offset] = x;
				vertexArray[offset + 1] = y;
				vertexArray[offset + 2] = z;
				vertexArray[offset + 3] = 0.0;
				vertexArray[offset + 4] = -1.0;
				vertexArray[offset + 5] = 0.0;
				vertexArray[offset + 6] = r * point1Factor;
				vertexArray[offset + 7] = g * point1Factor;
				vertexArray[offset + 8] = b * point1Factor;
				vertexArray[offset + 9] = a;
				vertexArray[offset + 10] = x + 1;
				vertexArray[offset + 11] = y;
				vertexArray[offset + 12] = z;
				vertexArray[offset + 13] = 0.0;
				vertexArray[offset + 14] = -1.0;
				vertexArray[offset + 15] = 0.0;
				vertexArray[offset + 16] = r * point2Factor;
				vertexArray[offset + 17] = g * point2Factor;
				vertexArray[offset + 18] = b * point2Factor;
				vertexArray[offset + 19] = a;
				vertexArray[offset + 20] = x + 1;
				vertexArray[offset + 21] = y;
				vertexArray[offset + 22] = z + 1;
				vertexArray[offset + 23] = 0.0;
				vertexArray[offset + 24] = -1.0;
				vertexArray[offset + 25] = 0.0;
				vertexArray[offset + 26] = r * point3Factor;
				vertexArray[offset + 27] = g * point3Factor;
				vertexArray[offset + 28] = b * point3Factor;
				vertexArray[offset + 29] = a;
				vertexArray[offset + 30] = x;
				vertexArray[offset + 31] = y;
				vertexArray[offset + 32] = z + 1;
				vertexArray[offset + 33] = 0.0;
				vertexArray[offset + 34] = -1.0;
				vertexArray[offset + 35] = 0.0;
				vertexArray[offset + 36] = r * point4Factor;
				vertexArray[offset + 37] = g * point4Factor;
				vertexArray[offset + 38] = b * point4Factor;
				vertexArray[offset + 39] = a;
				break;
			case 5: 
				cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z);
				cubeInfo2 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z);
				cubeInfo3 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z);
				cubeInfo4 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z);
				
				num1 = CubeInfo.Objcect2back[cubeInfo1.point];
				num2 = CubeInfo.Objcect3back[cubeInfo2.point];
				num3 = CubeInfo.Objcect7back[cubeInfo3.point];
				num4 = CubeInfo.Objcect6back[cubeInfo4.point];
				
				point1Factor = aoFactor[num1];
				point2Factor = aoFactor[num2];
				point3Factor = aoFactor[num3];
				point4Factor = aoFactor[num4];
				//_addOnePlaneVertex(5, cubeInfo, point1Factor, point2Factor, point3Factor, point4Factor);
				cubeInfo.backVBIndex = (verticesIndex << 24) + offset;
				vertexArray[offset] = x + 1;
				vertexArray[offset + 1] = y;
				vertexArray[offset + 2] = z;
				vertexArray[offset + 3] = 0.0;
				vertexArray[offset + 4] = 0.0;
				vertexArray[offset + 5] = -1.0;
				vertexArray[offset + 6] = r * point1Factor;
				vertexArray[offset + 7] = g * point1Factor;
				vertexArray[offset + 8] = b * point1Factor;
				vertexArray[offset + 9] = a;
				vertexArray[offset + 10] = x;
				vertexArray[offset + 11] = y;
				vertexArray[offset + 12] = z;
				vertexArray[offset + 13] = 0.0;
				vertexArray[offset + 14] = 0.0;
				vertexArray[offset + 15] = -1.0;
				vertexArray[offset + 16] = r * point2Factor;
				vertexArray[offset + 17] = g * point2Factor;
				vertexArray[offset + 18] = b * point2Factor;
				vertexArray[offset + 19] = a;
				vertexArray[offset + 20] = x;
				vertexArray[offset + 21] = y + 1;
				vertexArray[offset + 22] = z;
				vertexArray[offset + 23] = 0.0;
				vertexArray[offset + 24] = 0.0;
				vertexArray[offset + 25] = -1.0;
				vertexArray[offset + 26] = r * point3Factor;
				vertexArray[offset + 27] = g * point3Factor;
				vertexArray[offset + 28] = b * point3Factor;
				vertexArray[offset + 29] = a;
				vertexArray[offset + 30] = x + 1;
				vertexArray[offset + 31] = y + 1;
				vertexArray[offset + 32] = z;
				vertexArray[offset + 33] = 0.0;
				vertexArray[offset + 34] = 0.0;
				vertexArray[offset + 35] = -1.0;
				vertexArray[offset + 36] = r * point4Factor;
				vertexArray[offset + 37] = g * point4Factor;
				vertexArray[offset + 38] = b * point4Factor;
				vertexArray[offset + 39] = a;
				break;
			}
		}
		
		 _updataColorPropertyFaceVertex(selfCube:CubeInfo, FaceIndex:number, property:number):void
		{
			var vertexArray:Float32Array = this._vertices[FaceIndex >> 24];
			var endStartArray:any[] = this._vertexUpdateFlag[FaceIndex >> 24];
			var offset:number = FaceIndex & 0x00ffffff;
			
			//维护StartEnd
			if (endStartArray[0] > offset) endStartArray[0] = offset
			
			if (endStartArray[1] < offset + 39) endStartArray[1] = offset + 39;

			vertexArray[offset + 9]  = property;
			vertexArray[offset + 19] = property;
			vertexArray[offset + 29] = property;
			vertexArray[offset + 39] = property;
			
		}
		
		/**
		 * @private
		 * 改变一个面的颜色，可能是改变颜色，也可能改变AO
		 */
		 _updataColorFaceVertex(selfCube:CubeInfo, FaceIndex:number, color:number):void {
			var point1Factor:number;
			var point2Factor:number;
			var point3Factor:number;
			var point4Factor:number;
			var cubeInfo1:CubeInfo;
			var cubeInfo2:CubeInfo;
			var cubeInfo3:CubeInfo;
			var cubeInfo4:CubeInfo;
			//获得绝对位置
			
			switch (FaceIndex) {
			case 0: 
				cubeInfo1 = this._cubeMap.find(selfCube.x + 1, selfCube.y + 1, selfCube.z + 1);
				cubeInfo2 = this._cubeMap.find(selfCube.x, selfCube.y + 1, selfCube.z + 1);
				cubeInfo3 = this._cubeMap.find(selfCube.x, selfCube.y, selfCube.z + 1);
				cubeInfo4 = this._cubeMap.find(selfCube.x + 1, selfCube.y, selfCube.z + 1);
				point1Factor = CubeInfo.aoFactor[CubeInfo.Objcect4front[cubeInfo1.point]];
				point2Factor = CubeInfo.aoFactor[CubeInfo.Objcect5front[cubeInfo2.point]];
				point3Factor = CubeInfo.aoFactor[CubeInfo.Objcect1front[cubeInfo3.point]];
				point4Factor = CubeInfo.aoFactor[CubeInfo.Objcect0front[cubeInfo4.point]];
				this._updataOnePlaneVertex(selfCube.frontVBIndex, color, point1Factor, point2Factor, point3Factor, point4Factor);
				break;
			case 1: 
				cubeInfo1 = this._cubeMap.find(selfCube.x + 1, selfCube.y + 1, selfCube.z + 1);
				cubeInfo2 = this._cubeMap.find(selfCube.x + 1, selfCube.y, selfCube.z + 1);
				cubeInfo3 = this._cubeMap.find(selfCube.x + 1, selfCube.y, selfCube.z);
				cubeInfo4 = this._cubeMap.find(selfCube.x + 1, selfCube.y + 1, selfCube.z);
				point1Factor = CubeInfo.aoFactor[CubeInfo.Objcect4right[cubeInfo1.point]];
				point2Factor = CubeInfo.aoFactor[CubeInfo.Objcect0right[cubeInfo2.point]];
				point3Factor = CubeInfo.aoFactor[CubeInfo.Objcect2right[cubeInfo3.point]];
				point4Factor = CubeInfo.aoFactor[CubeInfo.Objcect6right[cubeInfo4.point]];
				this._updataOnePlaneVertex(selfCube.rightVBIndex, color, point1Factor, point2Factor, point3Factor, point4Factor);
				break;
			case 2: 
				cubeInfo1 = this._cubeMap.find(selfCube.x + 1, selfCube.y + 1, selfCube.z + 1);
				cubeInfo2 = this._cubeMap.find(selfCube.x + 1, selfCube.y + 1, selfCube.z);
				cubeInfo3 = this._cubeMap.find(selfCube.x, selfCube.y + 1, selfCube.z);
				cubeInfo4 = this._cubeMap.find(selfCube.x, selfCube.y + 1, selfCube.z + 1);
				point1Factor = CubeInfo.aoFactor[CubeInfo.Objcect4up[cubeInfo1.point]];
				point2Factor = CubeInfo.aoFactor[CubeInfo.Objcect6up[cubeInfo2.point]];
				point3Factor = CubeInfo.aoFactor[CubeInfo.Objcect7up[cubeInfo3.point]];
				point4Factor = CubeInfo.aoFactor[CubeInfo.Objcect5up[cubeInfo4.point]];
				this._updataOnePlaneVertex(selfCube.topVBIndex, color, point1Factor, point2Factor, point3Factor, point4Factor);
				break;
			case 3: 
				cubeInfo1 = this._cubeMap.find(selfCube.x, selfCube.y + 1, selfCube.z + 1);
				cubeInfo2 = this._cubeMap.find(selfCube.x, selfCube.y + 1, selfCube.z);
				cubeInfo3 = this._cubeMap.find(selfCube.x, selfCube.y, selfCube.z);
				cubeInfo4 = this._cubeMap.find(selfCube.x, selfCube.y, selfCube.z + 1);
				point1Factor = CubeInfo.aoFactor[CubeInfo.Objcect5left[cubeInfo1.point]];
				point2Factor = CubeInfo.aoFactor[CubeInfo.Objcect7left[cubeInfo2.point]];
				point3Factor = CubeInfo.aoFactor[CubeInfo.Objcect3left[cubeInfo3.point]];
				point4Factor = CubeInfo.aoFactor[CubeInfo.Objcect1left[cubeInfo4.point]];
				this._updataOnePlaneVertex(selfCube.leftVBIndex, color, point1Factor, point2Factor, point3Factor, point4Factor);
				break;
			case 4: 
				cubeInfo1 = this._cubeMap.find(selfCube.x, selfCube.y, selfCube.z);
				cubeInfo2 = this._cubeMap.find(selfCube.x + 1, selfCube.y, selfCube.z);
				cubeInfo3 = this._cubeMap.find(selfCube.x + 1, selfCube.y, selfCube.z + 1);
				cubeInfo4 = this._cubeMap.find(selfCube.x, selfCube.y, selfCube.z + 1);
				point1Factor = CubeInfo.aoFactor[CubeInfo.Objcect3down[cubeInfo1.point]];
				point2Factor = CubeInfo.aoFactor[CubeInfo.Objcect2down[cubeInfo2.point]];
				point3Factor = CubeInfo.aoFactor[CubeInfo.Objcect0down[cubeInfo3.point]];
				point4Factor = CubeInfo.aoFactor[CubeInfo.Objcect1down[cubeInfo4.point]];
				this._updataOnePlaneVertex(selfCube.downVBIndex, color, point1Factor, point2Factor, point3Factor, point4Factor);
				break;
			case 5: 
				cubeInfo1 = this._cubeMap.find(selfCube.x + 1, selfCube.y, selfCube.z);
				cubeInfo2 = this._cubeMap.find(selfCube.x, selfCube.y, selfCube.z);
				cubeInfo3 = this._cubeMap.find(selfCube.x, selfCube.y + 1, selfCube.z);
				cubeInfo4 = this._cubeMap.find(selfCube.x + 1, selfCube.y + 1, selfCube.z);
				point1Factor = CubeInfo.aoFactor[CubeInfo.Objcect2back[cubeInfo1.point]];
				point2Factor = CubeInfo.aoFactor[CubeInfo.Objcect3back[cubeInfo2.point]];
				point3Factor = CubeInfo.aoFactor[CubeInfo.Objcect7back[cubeInfo3.point]];
				point4Factor = CubeInfo.aoFactor[CubeInfo.Objcect6back[cubeInfo4.point]];
				this._updataOnePlaneVertex(selfCube.backVBIndex, color, point1Factor, point2Factor, point3Factor, point4Factor);
				
				break;
				
			}
		}
		
		 _updataCubeInfoAO(cubeInfo:CubeInfo):void {
			for (var i:number = 0; i < 6; i++) {
				//传入本身cubeinfo，faceindex，frontfaceAO的
				this._updataOnePlaneAO(cubeInfo, i, cubeInfo.frontFaceAO[i])
			}
		
		}
		
		private _updataOnePlaneAO(cubeInfo:CubeInfo, faceIndex:number, UpdataData:number):void {
			
			if (UpdataData == 0) {
				return;
			}
			var VBPoint:number = cubeInfo.getVBPointbyFaceIndex(faceIndex);
			
			if (VBPoint == -1) {
				return;
			}
			var vertices:Float32Array[] = cubeInfo.subCube._vertices;
			
			var vertexUpdateFlag:any[][] = cubeInfo.subCube._vertexUpdateFlag;
			
			var vertexArray:Float32Array = vertices[VBPoint >> 24];
			var endStartArray:any[] = vertexUpdateFlag[VBPoint >> 24];
			var offset:number = VBPoint & 0x00ffffff;
			
			//维护StartEnd
			if (endStartArray[0] > offset) endStartArray[0] = offset
			
			if (endStartArray[1] < offset + 39) endStartArray[1] = offset + 39;
			var colorindex:number = cubeInfo.color;
			var r:number = (colorindex & 0xff)/255;
			var g:number = ((colorindex & 0xff00) >> 8) / 255;
			var b:number = ((colorindex & 0xff0000) >> 16) / 255;
			var pointFactor:number;
			var cubeInfo1:CubeInfo;
			if ((UpdataData & CubeInfo.PanduanWei[0]) != 0) {
				
				//计算pointFactor
				switch (faceIndex) {
				case 0: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z + 1);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect4front[cubeInfo1.point]];
					break;
				case 1: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z + 1);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect4right[cubeInfo1.point]];
					break;
				case 2: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z + 1);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect4up[cubeInfo1.point]];
					break;
				case 3: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z + 1);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect5left[cubeInfo1.point]];
					break;
				case 4: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect3down[cubeInfo1.point]];
					break;
				case 5: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect2back[cubeInfo1.point]];
					break;
				}
				vertexArray[offset + 6] = r * pointFactor;
				vertexArray[offset + 7] = g * pointFactor;
				vertexArray[offset + 8] = b * pointFactor;
				
			}
			if ((UpdataData & CubeInfo.PanduanWei[1]) != 0) {
				switch (faceIndex) {
				case 0: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z + 1);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect5front[cubeInfo1.point]];
					break;
				case 1: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z + 1);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect0right[cubeInfo1.point]];
					break;
				case 2: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect6up[cubeInfo1.point]];
					break;
				case 3: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect7left[cubeInfo1.point]];
					break;
				case 4: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect2down[cubeInfo1.point]];
					break;
				case 5: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect3back[cubeInfo1.point]];
					break;
				}
				vertexArray[offset + 16] = r * pointFactor;
				vertexArray[offset + 17] = g * pointFactor;
				vertexArray[offset + 18] = b * pointFactor;
				
			}
			if ((UpdataData & CubeInfo.PanduanWei[2]) != 0) {
				switch (faceIndex) {
				case 0: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z + 1);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect1front[cubeInfo1.point]];
					break;
				case 1: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect2right[cubeInfo1.point]];
					break;
				case 2: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect7up[cubeInfo1.point]];
					break;
				case 3: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect3left[cubeInfo1.point]];
					break;
				case 4: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z + 1);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect0down[cubeInfo1.point]];
					break;
				case 5: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect7back[cubeInfo1.point]];
					break;
					
				}
				vertexArray[offset + 26] = r * pointFactor;
				vertexArray[offset + 27] = g * pointFactor;
				vertexArray[offset + 28] = b * pointFactor;
				
			}
			if ((UpdataData & CubeInfo.PanduanWei[3]) != 0) {
				switch (faceIndex) {
				case 0: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y, cubeInfo.z + 1);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect0front[cubeInfo1.point]];
					break;
				case 1: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect6right[cubeInfo1.point]];
					break;
				case 2: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y + 1, cubeInfo.z + 1);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect5up[cubeInfo1.point]];
					break;
				case 3: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z + 1);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect1left[cubeInfo1.point]];
					break;
				case 4: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x, cubeInfo.y, cubeInfo.z + 1);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect1down[cubeInfo1.point]];
					break;
				case 5: 
					cubeInfo1 = this._cubeMap.find(cubeInfo.x + 1, cubeInfo.y + 1, cubeInfo.z);
					pointFactor = CubeInfo.aoFactor[CubeInfo.Objcect6back[cubeInfo1.point]];
					break;
					
				}
				vertexArray[offset + 36] = r * pointFactor;
				vertexArray[offset + 37] = g * pointFactor;
				vertexArray[offset + 38] = b * pointFactor;
				
			}
		
		}
		
		/*
		 * @private
		 * 画所有点的颜色
		 */
		
		/**
		 * @private
		 * 移除一个面
		 */
		 _removeOnePlaneVertex(cubeInfo:CubeInfo, VBPoint:number):void {
			//找到最后的值
			
			if (VBPoint == -1) {
				return;
			}
			
			var This_vertices:Float32Array[] = cubeInfo.updateCube._vertices;
			
			var This_vertexUpdateFlag:any[][] = cubeInfo.updateCube._vertexUpdateFlag;
			
			var vertexArray:Float32Array = This_vertices[VBPoint >> 24];
			var endStartArray:any[] = This_vertexUpdateFlag[VBPoint >> 24];
			var offset:number = VBPoint & 0x00ffffff;
			
			//找到最后的数组
			var endVertexArray:Float32Array = This_vertices[Math.ceil(cubeInfo.updateCube._currentVertexCount / 65536)-1];
			var offsetEnd:number = Math.floor((cubeInfo.updateCube._currentVertexCount - 4) % 65536) * 10;
			
			//维护StartEnd
			if (endStartArray[0] > offset) endStartArray[0] = offset
			
			if (endStartArray[1] < offset + 39) endStartArray[1] = offset + 39;
			
			//总点减4
			cubeInfo.updateCube._currentVertexCount -= 4;
			
			//换位置
			this._changeCubeInfoFaceVBIndex(endVertexArray[offsetEnd], endVertexArray[offsetEnd + 1], endVertexArray[offsetEnd + 2], endVertexArray[offsetEnd + 3], endVertexArray[offsetEnd + 4], endVertexArray[offsetEnd + 5], VBPoint);
			for (var i:number = 0; i < 40; i++) {
				vertexArray[offset + i] = endVertexArray[offsetEnd + i];
			}
		
		}
		
		/*
		 * @private
		 * 换一个面的颜色
		 */
		private _updataOnePlaneVertex(VBPoint:number, colorindex:number, point1Factor:number, point2Factor:number, point3Factor:number, point4Factor:number):void {
			
			var vertexArray:Float32Array = this._vertices[VBPoint >> 24];
			var endStartArray:any[] = this._vertexUpdateFlag[VBPoint >> 24];
			var offset:number = VBPoint & 0x00ffffff;
			
			//维护StartEnd
			if (endStartArray[0] > offset) endStartArray[0] = offset
			
			if (endStartArray[1] < offset + 39) endStartArray[1] = offset + 39;
			
			var r:number = (colorindex & 0xff)/255;
			var g:number = ((colorindex & 0xff00) >> 8) / 255;
			var b:number = ((colorindex & 0xff0000) >> 16) / 255;
			
			
			vertexArray[offset + 6] = r * point1Factor;
			vertexArray[offset + 7] = g * point1Factor;
			vertexArray[offset + 8] = b * point1Factor;
			
			vertexArray[offset + 16] = r * point2Factor;
			vertexArray[offset + 17] = g * point2Factor;
			vertexArray[offset + 18] = b * point2Factor;
			
			vertexArray[offset + 26] = r * point3Factor;
			vertexArray[offset + 27] = g * point3Factor;
			vertexArray[offset + 28] = b * point3Factor;
			
			vertexArray[offset + 36] = r * point4Factor;
			vertexArray[offset + 37] = g * point4Factor;
			vertexArray[offset + 38] = b * point4Factor;
		}
		
		//根据法线和xyz的值得到CubeInfo
		private _changeCubeInfoFaceVBIndex(x:number, y:number, z:number, norx:number, nory:number, norz:number, VBPoint:number):void {
			var cubeinfox:number;
			var cubeinfoy:number;
			var cubeinfoz:number;
			var cubeinfo:CubeInfo;
			if (norx == 0 && nory == 0 && norz == 1) {
				//前面
				cubeinfox = x - 1;
				cubeinfoy = y - 1;
				cubeinfoz = z - 1;
				cubeinfo = this._cubeMap.find(cubeinfox + SubCubeGeometry.HALFMAXNumCube, cubeinfoy + SubCubeGeometry.HALFMAXNumCube, cubeinfoz + SubCubeGeometry.HALFMAXNumCube);
				cubeinfo.frontVBIndex = VBPoint;
			} else if (norx == 1 && nory == 0 && norz == 0) {
				//右面
				cubeinfox = x - 1;
				cubeinfoy = y - 1;
				cubeinfoz = z - 1;
				cubeinfo = this._cubeMap.find(cubeinfox + SubCubeGeometry.HALFMAXNumCube, cubeinfoy + SubCubeGeometry.HALFMAXNumCube, cubeinfoz + SubCubeGeometry.HALFMAXNumCube);
				cubeinfo.rightVBIndex = VBPoint;
				
			} else if (norx == 0 && nory == 1 && norz == 0) {
				//上面
				cubeinfox = x - 1;
				cubeinfoy = y - 1;
				cubeinfoz = z - 1;
				cubeinfo = this._cubeMap.find(cubeinfox + SubCubeGeometry.HALFMAXNumCube, cubeinfoy + SubCubeGeometry.HALFMAXNumCube, cubeinfoz + SubCubeGeometry.HALFMAXNumCube);
				cubeinfo.topVBIndex = VBPoint;
				
			} else if (norx == -1 && nory == 0 && norz == 0) {
				//左面
				cubeinfox = x;
				cubeinfoy = y - 1;
				cubeinfoz = z - 1;
				cubeinfo = this._cubeMap.find(cubeinfox + SubCubeGeometry.HALFMAXNumCube, cubeinfoy + SubCubeGeometry.HALFMAXNumCube, cubeinfoz + SubCubeGeometry.HALFMAXNumCube);
				cubeinfo.leftVBIndex = VBPoint;
				
			} else if (norx == 0 && nory == -1 && norz == 0) {
				//下面
				cubeinfox = x;
				cubeinfoy = y;
				cubeinfoz = z;
				cubeinfo = this._cubeMap.find(cubeinfox + SubCubeGeometry.HALFMAXNumCube, cubeinfoy + SubCubeGeometry.HALFMAXNumCube, cubeinfoz + SubCubeGeometry.HALFMAXNumCube);
				cubeinfo.downVBIndex = VBPoint;
				
			} else if (norx == 0 && nory == 0 && norz == -1) {
				//后面
				cubeinfox = x - 1;
				cubeinfoy = y;
				cubeinfoz = z;
				cubeinfo = this._cubeMap.find(cubeinfox + SubCubeGeometry.HALFMAXNumCube, cubeinfoy + SubCubeGeometry.HALFMAXNumCube, cubeinfoz + SubCubeGeometry.HALFMAXNumCube);
				cubeinfo.backVBIndex = VBPoint;
			}
		}
		
		/**
		 * @private
		 */
		private _addCubeInfo(selfCube:CubeInfo):void {
			var x:number = selfCube.x;
			var y:number = selfCube.y;
			var z:number = selfCube.z;
			var otherCube:CubeInfo = this._cubeMap.find(x + 1, y + 1, z + 1);
			var cubeInfo:CubeInfo;
			this._cubeMap.data[(x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16)].save = null;
			//front
			if (otherCube.calDirectCubeExit(6) == -1) {
				//如果前面没有点，加一个面
				selfCube.frontVBIndex == -1 && this._addFaceVertex(selfCube, 0);
			} else {
				cubeInfo = this._cubeMap.find(x, y, z + 1);
				//如果有cube，就判断然后减面
				this._removeOnePlaneVertex(cubeInfo, cubeInfo.backVBIndex);
				cubeInfo.backVBIndex = -1;
			}
			//right
			if (otherCube.calDirectCubeExit(5) == -1) {
				selfCube.rightVBIndex == -1 && this._addFaceVertex(selfCube, 1);
			} else {
				cubeInfo = this._cubeMap.find(x + 1, y, z);
				this._removeOnePlaneVertex(cubeInfo, cubeInfo.leftVBIndex);
				cubeInfo.leftVBIndex = -1;
			}
			//up
			if (otherCube.calDirectCubeExit(0) == -1) {
				selfCube.topVBIndex == -1 && this._addFaceVertex(selfCube, 2);
			} else {
				cubeInfo = this._cubeMap.find(x, y + 1, z);
				this._removeOnePlaneVertex(cubeInfo, cubeInfo.downVBIndex);
				cubeInfo.downVBIndex = -1;
			}
			//left
			if (selfCube.calDirectCubeExit(2) == -1) {
				selfCube.leftVBIndex == -1 && this._addFaceVertex(selfCube, 3);
			} else {
				cubeInfo = this._cubeMap.find(x - 1, y, z);
				this._removeOnePlaneVertex(cubeInfo, cubeInfo.rightVBIndex);
				cubeInfo.rightVBIndex = -1;
			}
			//down
			if (selfCube.calDirectCubeExit(7) == -1) {
				selfCube.downVBIndex == -1 && this._addFaceVertex(selfCube, 4);
			} else {
				cubeInfo = this._cubeMap.find(x, y - 1, z);
				this._removeOnePlaneVertex(cubeInfo, cubeInfo.topVBIndex);
				cubeInfo.topVBIndex = -1;
			}
			
			//back
			if (selfCube.calDirectCubeExit(1) == -1) {
				selfCube.backVBIndex == -1 && this._addFaceVertex(selfCube, 5);
			} else {
				cubeInfo = this._cubeMap.find(x, y, z - 1);
				this._removeOnePlaneVertex(cubeInfo, cubeInfo.frontVBIndex);
				cubeInfo.frontVBIndex = -1;
			}
		
		}
		
		/**
		 * @private
		 */
		private _removeCubeInfo(selfCube:CubeInfo):void {
			
			var x:number = selfCube.x;
			var y:number = selfCube.y;
			var z:number = selfCube.z;
			var otherCube:CubeInfo = this._cubeMap.find(x + 1, y + 1, z + 1);
			var cubeInfo:CubeInfo;
			this._cubeMap.data[(x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16)].save = null;
			//front
			if (selfCube.frontVBIndex != -1) {
				//如果前面没有点，加一个面
				this._removeOnePlaneVertex(selfCube, selfCube.frontVBIndex);
				selfCube.frontVBIndex = -1;
			}
			if (otherCube.calDirectCubeExit(6) != -1) {
				cubeInfo = this._cubeMap.find(x, y, z + 1);
				cubeInfo.backVBIndex == -1 && this._addFaceVertex(cubeInfo, 5);
			}
			
			//right
			if (selfCube.rightVBIndex != -1) {
				this._removeOnePlaneVertex(selfCube, selfCube.rightVBIndex);
				selfCube.rightVBIndex = -1;
			}
			if (otherCube.calDirectCubeExit(5) != -1) {
				cubeInfo = this._cubeMap.find(x + 1, y, z);
				this._addFaceVertex(cubeInfo, 3);
			}
			
			//up
			if (selfCube.topVBIndex != -1) {
				this._removeOnePlaneVertex(selfCube, selfCube.topVBIndex);
				selfCube.topVBIndex = -1;
			}
			if (otherCube.calDirectCubeExit(0) != -1) {
				cubeInfo = this._cubeMap.find(x, y + 1, z);
				this._addFaceVertex(cubeInfo, 4);
			}
			//left
			if (selfCube.leftVBIndex != -1) {
				this._removeOnePlaneVertex(selfCube, selfCube.leftVBIndex);
				selfCube.leftVBIndex = -1;
			}
			if (selfCube.calDirectCubeExit(2) != -1) {
				cubeInfo = this._cubeMap.find(x - 1, y, z);
				this._addFaceVertex(cubeInfo, 1);
			}
			//down
			if (selfCube.downVBIndex != -1) {
				this._removeOnePlaneVertex(selfCube, selfCube.downVBIndex);
				selfCube.downVBIndex = -1;
			}
			if (selfCube.calDirectCubeExit(7) != -1) {
				cubeInfo = this._cubeMap.find(x, y - 1, z);
				this._addFaceVertex(cubeInfo, 2);
			}
			
			//back
			if (selfCube.backVBIndex != -1) {
				this._removeOnePlaneVertex(selfCube, selfCube.backVBIndex);
				selfCube.backVBIndex = -1;
			}
			if (selfCube.calDirectCubeExit(1) != -1) {
				cubeInfo = this._cubeMap.find(x, y, z - 1);
				this._addFaceVertex(cubeInfo, 0);
			}
		}
		
		/**
		 * @private
		 */
		private _updateCubeInfo(selfCube:CubeInfo):void {
			var color:number = selfCube.color;
			this._cubeMap.data[(selfCube.x >> 5) + ((selfCube.y >> 5) << 8) + ((selfCube.z >> 5) << 16)].save = null;
			if (selfCube.frontVBIndex != -1) this._updataColorFaceVertex(selfCube, 0, color);
			if (selfCube.rightVBIndex != -1) this._updataColorFaceVertex(selfCube, 1, color);
			if (selfCube.topVBIndex != -1) this._updataColorFaceVertex(selfCube, 2, color);
			if (selfCube.leftVBIndex != -1) this._updataColorFaceVertex(selfCube, 3, color);
			if (selfCube.downVBIndex != -1) this._updataColorFaceVertex(selfCube, 4, color);
			if (selfCube.backVBIndex != -1) this._updataColorFaceVertex(selfCube, 5, color);
		
		}
		/**
		 * @private
		 * 更新cube属性
		 */
		private _updateCubeInfoProperty(selfCube:CubeInfo):void
		{
			var color:number = (selfCube.color & 0xff000000)>>24;
			
			this._cubeMap.data[(selfCube.x >> 5) + ((selfCube.y >> 5) << 8) + ((selfCube.z >> 5) << 16)].save = null;
			if (selfCube.frontVBIndex != -1) this._updataColorPropertyFaceVertex(selfCube, selfCube.frontVBIndex, color);
			if (selfCube.rightVBIndex != -1) this._updataColorPropertyFaceVertex(selfCube, selfCube.rightVBIndex, color);
			if (selfCube.topVBIndex != -1) this._updataColorPropertyFaceVertex(selfCube, selfCube.topVBIndex, color);
			if (selfCube.leftVBIndex != -1) this._updataColorPropertyFaceVertex(selfCube, selfCube.leftVBIndex, color);
			if (selfCube.downVBIndex != -1) this._updataColorPropertyFaceVertex(selfCube, selfCube.downVBIndex, color);
			if (selfCube.backVBIndex != -1) this._updataColorPropertyFaceVertex(selfCube, selfCube.backVBIndex, color);
		}
		
		
		/**
		 * @private
		 */
		 updatePlane(cubeInfo:CubeInfo):void {
			var modifyFlag:number = cubeInfo.modifyFlag;
			switch (modifyFlag) {
			case CubeInfo.MODIFYE_ADD: 
				this._addCubeInfo(cubeInfo);
				
				break;
			case CubeInfo.MODIFYE_REMOVE: 
				this._removeCubeInfo(cubeInfo);
				//if (cubeInfo.point === 0) {//异步处理完删除数据,保证删除安全,但可能回收不干净
				//CubeInfo.recover(cubeInfo);
				//_cubeMap.remove(cubeInfo.x, cubeInfo.y, cubeInfo.z);
				//}
				break;
			case CubeInfo.MODIFYE_UPDATE: 
				this._updateCubeInfo(cubeInfo);
				break;
			case CubeInfo.MODIFYE_UPDATEAO: 
				this._updataCubeInfoAO(cubeInfo);
				cubeInfo.clearAoData();
				break;
			case CubeInfo.MODIFYE_UPDATEPROPERTY:
				this._updateCubeInfoProperty(cubeInfo);
			}
			
			cubeInfo.modifyFlag = CubeInfo.MODIFYE_NONE;
			return;
		}
		
		/**
		 * @private
		 */
		 updateBuffer():void {
			var count:number = Math.ceil(this._currentVertexCount / 65536);
			for (var i:number = 0, n:number = this._vertexUpdateFlag.length; i < n; i++) {
				var flag:any[] = this._vertexUpdateFlag[i];
				if (i < count) {
					var updateStart:number = flag[0];
					var updateEnd:number = flag[1]+1;
					if (updateStart !== 2147483647 && updateEnd !== -2147483647) {
						this._vertexbuffers[i].setData(this._vertices[i], updateStart, updateStart, updateEnd - updateStart);
						flag[0] = 2147483647; /*int.MAX_VALUE*/
						flag[1] = -2147483647; /*int.MIN_VALUE*/
					}
				} else {
					flag[0] = 2147483647; /*int.MAX_VALUE*/
					flag[1] = -2147483647; /*int.MIN_VALUE*/
				}
			}
		}
		
		/**
		 * @private
		 */
		 render(state:RenderContext3D):void {
			//(state.camera as Camera).boundFrustum
			
			var gl:WebGLContext = LayaGL.instance;
			
			
			var count:number = Math.ceil(this._currentVertexCount / 65536);
			var endIndex:number = count - 1;
			for (var i:number = 0; i < count; i++) {
				this._bufferStates[i].bind();
				var renderCount:number = (i === endIndex) ? this._currentVertexCount - 65536 * endIndex : 65536;
			
				gl.drawElements(WebGLContext.TRIANGLES, (renderCount / 4) * 6, WebGLContext.UNSIGNED_SHORT, 0);
			}
			
			Stat.renderBatches += count;
			Stat.trianglesFaces += this._currentVertexCount / 2;
		}
		
		/**
		 * @private
		 */
		 clear():void {
	
			this._currentVertexCount = 0;
			this.cubeCount = 0;
		}
		
		
		/**
		 * @private
		 */
		 destroy():void{
			for (var i:number = 0, n:number = this._vertexbuffers.length; i < n; i++){
				this._bufferStates[i].destroy();
				this._vertexbuffers[i].destroy();
			}
			this._vertexbuffers = null;
			this._vertices = null;
			var memory:number = this._currentVertexSize * SubCubeGeometry.FLOATCOUNTPERVERTEX * 4;
			Resource._addCPUMemory(-memory);
			Resource._addGPUMemory(-memory);
		}
	
	}

