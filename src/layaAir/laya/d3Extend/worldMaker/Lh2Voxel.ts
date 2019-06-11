import { VoxTriangleFiller } from "././VoxTriangleFiller";
import { CubeInfo } from "../Cube/CubeInfo"
	import { CubeSprite3D } from "../Cube/CubeSprite3D"
	import { MeshFilter } from "laya/d3/core/MeshFilter"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { BaseMaterial } from "laya/d3/core/material/BaseMaterial"
	import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
	import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh"
	import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D"
	import { VertexElement } from "laya/d3/graphics/VertexElement"
	import { VertexElementFormat } from "laya/d3/graphics/VertexElementFormat"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
	import { Vector2 } from "laya/d3/math/Vector2"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Mesh } from "laya/d3/resource/models/Mesh"
	import { SubMesh } from "laya/d3/resource/models/SubMesh"
	import { CubeInfoArray } from "./CubeInfoArray"
	import { Handler } from "laya/utils/Handler"
	import { BaseTexture } from "laya/resource/BaseTexture"
	import { ColorQuantization_Mediancut } from "../vox/ColorQuantization_Mediancut"
	import { VoxFileData } from "../vox/VoxFileData"
	import { Texture2D } from "laya/resource/Texture2D"
	import { VoxDataCompress } from "../vox/VoxDataCompress"
	
	/**
	 * 使用方法：
	 * 
	 * var lv = new Lh2Voxel();
	 * lv.setModelData(vertices,indices);
	 * 
	 * var ret = lv.renderToPalVoxel(sz, colornum);
	 * 或者
	 * var ret = lv.renderToVoxel(xsize);				
	 * 		这种是不压缩颜色的。
	 *
	 * 如果要打印统计信息：
	 * lv.printDbgInfo();
	 * 
	 * 如果不使用贴图信息：
	 * lv.onlyMtl = true
	 * 
	 */
	
	export class Lh2Voxel {
		 tempPos:Vector3 = new Vector3();
		 tempUV:Vector2 =  new Vector2();
		
		private tmpP0:Vector3 = new Vector3();
		private tmpP1:Vector3 = new Vector3();
		private tmpP2:Vector3 = new Vector3();
		
		 faceIndex:Uint16Array = null;
		 vertexArray:any[] = [];	//[[x,y,z,u,v,Texture2D]]
		 modelXSize:number = 0;	//模型包围盒
		 modelYSize:number = 0;
		 modelZSize:number = 0;
		
		 gridXSize:number = 0;
		 gridYSize:number = 0;
		 gridZSize:number = 0;
		
		 gridSize:number = 0.1;	//每个小方格的大小。单位是米
		
		private tmpGridPos:any[] = [0, 0, 0];
					
		 static int32v:Uint32Array = new Uint32Array(1);
		
		private static sampleCol:any[] = [0, 0, 0, 0];
		private trifiller:VoxTriangleFiller = new VoxTriangleFiller();
		
		 onlyMtl:boolean = false;	// 只用材质中的颜色
		// 统计信息
		private duration_setModelData:number = 0;
		
		
		/**
		 * 设置模型数据。
		 * 
		 * @param	vertData 顶点数组。每个顶点又是一个数组。[x,y,z,u,v,texture2D][]
		 * 			其中的 texture2D可以是一个数组，直接表示颜色,[r,g,b], rgb范围是0~1
		 * @param	index	索引数组，例如 [0,1,2]
		 */
		 setModelData( vertData:any[], index:any[]) {
			console.time('setmodeldata');
			this.vertexArray = vertData.concat();
			vertData = this.vertexArray;
			
			var minx:number = 10000; var maxx:number = -10000;
			var miny:number = 10000; var maxy:number = -10000;
			var minz:number = 10000; var maxz:number = -10000;
			
			//计算包围盒
			for ( var vi = 0; vi < vertData.length; vi++) {
				var cvert:any[] = vertData[vi];
				if (minx > cvert[0]) minx = cvert[0];
				if (miny > cvert[1]) miny = cvert[1];
				if (minz > cvert[2]) minz = cvert[2];
				if (maxx < cvert[0]) maxx = cvert[0];
				if (maxy < cvert[1]) maxy = cvert[1];
				if (maxz < cvert[2]) maxz = cvert[2];
			}
			this.modelXSize = maxx - minx;
			this.modelYSize = maxy - miny;
			this.modelZSize = maxz - minz;
			
			//移动到正象限
			for ( var vi = 0; vi < vertData.length; vi++) {
				var cvert:any[] = vertData[vi];
				cvert[0] -= minx;
				cvert[1] -= miny;
				cvert[2] -= minz;
			}
			
			this.faceIndex = index;
			console.timeEnd('setmodeldata');
		}
		
		 pos2GridId(x:number, y:number, z:number) {
			//先计算x,y,z
			var xi:number = (x / this.gridSize) | 0;
			var yi:number = (y / this.gridSize) | 0;
			var zi:number = (z / this.gridSize) | 0;
			if (xi >= this.gridXSize) xi = this.gridXSize-1;
			if (yi >= this.gridYSize) yi = this.gridYSize-1;
			if (zi >= this.gridZSize) zi = this.gridZSize-1;
			/*
			if (xi >= gridXSize || yi >= gridYSize || zi >= gridZSize) {
				alert('格子数太少，至少要 ', +Math.max(xi, yi, zi));
				throw 'err';
			}
			*/
			//再计算id。如果要修改坐标系，在这里改
			return xi + zi * this.gridXSize + yi * this.gridXSize * this.gridZSize;
		}

		// 能恢复gridxyz的id
		 pos2GridId1(x:number, y:number, z:number) {
			if (x > 1023 || y > 1023 || z > 1023) {
				alert('最大不能超过1024');
			}
			//先计算x,y,z
			var xi:number = (x / this.gridSize) | 0;
			var yi:number = (y / this.gridSize) | 0;
			var zi:number = (z / this.gridSize) | 0;
			//console.log('grid', xi, yi, zi);
			if (xi >= this.gridXSize) xi = this.gridXSize-1;
			if (yi >= this.gridYSize) yi = this.gridYSize-1;
			if (zi >= this.gridZSize) zi = this.gridZSize-1;
			return xi << 20 | yi << 10 | zi;
		}
		
		/**
		 * 采用最近采样。 注意不要保留返回值，因为是共享的。
		 * @param	tex
		 * @param	u
		 * @param	v
		 * @return
		 */
		 sampleTexture( tex:Texture2D, u:number, v:number):any[] {
			if (!tex) return [255, 255, 255, 255];
			if (tex instanceof Array) return [tex[0]*255,tex[1]*255,tex[2]*255,255];
			var x:number = ((tex.width * u) | 0) % tex.width;	
			var y:number = ((tex.height * v) | 0) % tex.height;
			var dt:Uint8Array = tex.getPixels();
			var st:number = (x + y * tex.width) * 4;
			Lh2Voxel.sampleCol[0] = dt[st];
			Lh2Voxel.sampleCol[1] = dt[st + 1];
			Lh2Voxel.sampleCol[2] = dt[st + 2];
			Lh2Voxel.sampleCol[3] = dt[st + 3];
			return Lh2Voxel.sampleCol;
		}
		
		//rgba。0~255
		static  colorToU16(colorArr:any[]):number {
			Lh2Voxel.int32v[0] =  ((colorArr[2]>>>3) << 10) | ((colorArr[1]>>>3) << 5) | (colorArr[0]>>>3);
			return Lh2Voxel.int32v[0];
		}
		
		static  colorToU32(colorArr:any[]):number {
			Lh2Voxel.int32v[0] =  (colorArr[2] << 16) | (colorArr[1] << 8) | colorArr[0];
			return Lh2Voxel.int32v[0];
		}
		
		//rgba。0~1
		static  color1ToU16(colorArr:any[]):number {
			Lh2Voxel.int32v[0] =  ((colorArr[2]*255>>>3) << 10) | ((colorArr[1]*255>>>3) << 5) | (colorArr[0]*255>>>3);
			return Lh2Voxel.int32v[0];
		}
		
		/**
		 * 返回是一个三维数组，每个里面是rgba的数组
		 * @param	xsize	水平分成多少格子
		 * @return 返回 {x:number,y:number,z:number,color:Number[]}[]
		 */
		 renderToVoxel1(xsize:number):any[] {
			console.log('modelsize ', this.modelXSize, this.modelYSize, this.modelZSize);
			if (xsize <= 0) xsize = 1;
			this.gridSize = (this.modelXSize+0.1) / xsize;	// 避免点正好在边界
			this.gridXSize = xsize;
			this.gridYSize = Math.max( Math.ceil( this.modelYSize / this.gridSize),1);
			this.gridZSize = Math.max( Math.ceil(this.modelZSize / this.gridSize), 1);
			
			var ret1:any[] = [];		//x,y,z,color
			var ret:any[] = [];			//三维数组
			
			console.time('格子化');
			var faceNum:number = this.faceIndex.length / 3;
			var smpPos:any[] = [];
			var smpUV:any[] = [];
			for ( var fi = 0; fi < faceNum; fi++) {
				//取出纹理对象
				var vert:any[] = this.vertexArray[this.faceIndex[fi * 3]];	
				//三个顶点的贴图必然一致。只取第一个就行了
				var tex:Texture2D = vert[5];
				if (typeof(tex) !== 'object') {
					//有错误，没有贴图。如果打印会不会弄死浏览器
				}
				this.getSamplePoints(fi, smpPos, smpUV);
				var ptnum:number = smpPos.length / 3;
				var cp:number = 0;
				for ( var pi = 0; pi < ptnum; pi++) {
					//所属的格子
					var gridid = this.pos2GridId1(smpPos[cp++], smpPos[cp++], smpPos[cp++]);
					//取出颜色
					var col:any[] = this.sampleTexture( tex, smpUV[pi << 1], smpUV[(pi << 1) + 1]);
					var curcoldt:any[] = ret[gridid];
					if (!curcoldt)  ret[gridid] = [col[0], col[1], col[2], col[3], 1];
					else {
						curcoldt[0] += col[0];
						curcoldt[1] += col[1];
						curcoldt[2] += col[2];
						//curcoldt[3] += col[3];
						curcoldt[4]++;	// 多少个点
					}
				}
			}
			console.timeEnd('格子化');
			console.time('求平均值-输出');
			var gridnum:number = 0;
			var repeatNum:number = 0;
			//整理结果，每个格子只保留平均值
			for ( var posid  in ret) {
				var colsum:any[] = ret[posid];
				var rsum:number = colsum[0];
				var gsum:number = colsum[1];
				var bsum:number = colsum[2];
				var cnum:number = colsum[4];
				gridnum++;
				repeatNum += cnum;
				ret1.push( { x:posid>>>20, y:(posid>>10)&0x3ff, z:posid&0x3ff, color:[(rsum/cnum)|0,(gsum/cnum)|0,(bsum/cnum)|0,255] } );
			}
			console.timeEnd('求平均值-输出');
			console.log('gridnum=', gridnum, '每个格子重复度:', (repeatNum / gridnum) );
			return ret1;
		}
		
		/**
		 * 把当前对象保存的模型数据转换成格子信息。
		 * @param	xsize
		 * @return  返回一个对象数组 {x:number,y:number,z:number, color:number[]}[]  表示在什么位置有什么颜色。
		 */
		 renderToVoxel(xsize:number):any[] {
			return this.renderToVoxel2(xsize);
			console.log('modelsize ', this.modelXSize, this.modelYSize, this.modelZSize);
			if (xsize <= 0) xsize = 1;
			this.gridSize = (this.modelXSize+0.1) / xsize;	// 避免点正好在边界
			this.gridXSize = xsize;
			this.gridYSize = Math.max( Math.ceil( this.modelYSize / this.gridSize),1);
			this.gridZSize = Math.max( Math.ceil(this.modelZSize / this.gridSize), 1);
			
			var ret1:any[] = [];		//x,y,z,color
			var ret:any[] = [];			//三维数组
			
			console.time('格子化');
			var faceNum:number = this.faceIndex.length / 3;
			var smpPos:any[] = [];
			var smpUV:any[] = [];
			for ( var fi = 0; fi < faceNum; fi++) {
				var fidSt:number = fi * 3;
				//取出纹理对象
				var vert0:any[] = this.vertexArray[this.faceIndex[fidSt]];	
				//三个顶点的贴图必然一致。只取第一个就行了
				var tex:Texture2D = vert0[5];
				//if (typeof(tex) !== 'object') {
					//有错误，没有贴图。如果打印会不会弄死浏览器
				//}
				// 针对所有的采样点
				var x0 = vert0[0];
				var y0 = vert0[1];
				var z0 = vert0[2];
				var u0 = vert0[3]; 
				var v0 = vert0[4]; 
				
				var vert1:any[] = this.vertexArray[this.faceIndex[fidSt+1]];
				var x1 = vert1[0];
				var y1 = vert1[1];
				var z1 = vert1[2];
				var u1 = vert1[3]; 
				var v1 = vert1[4]; 

				var vert2:any[] = this.vertexArray[this.faceIndex[fidSt+2]];
				var x2 = vert2[0];
				var y2 = vert2[1];
				var z2 = vert2[2];
				var u2 = vert2[3]; 
				var v2 = vert2[4]; 
			
				//e1
				var e1x:number = x1 - x0;
				var e1y:number = y1 - y0;
				var e1z:number = z1 - z0;
				var e1len:number = Math.sqrt(e1x * e1x + e1y * e1y + e1z * e1z);
				//e2
				var e2x:number = x2 - x0;
				var e2y:number = y2 - y0;
				var e2z:number = z2 - z0;
				var e2len:number = Math.sqrt(e2x * e2x + e2y * e2y + e2z * e2z);
				//console.log('len=', e1len, e2len);
				
				var du1:number = u1 - u0;
				var dv1:number = v1 - v0;
				var du2:number = u2 - u0;
				var dv2:number = v2 - v0;
				
				var sampleK:number = 1.1;
				
				var sampleK_gridsize = sampleK / this.gridSize;
				var smpUNum:number = Math.ceil(e1len * sampleK_gridsize);
				var stepU:number = 1.0 / smpUNum;
				var smpVNum:number = Math.ceil(e2len * sampleK_gridsize);
				var stepV:number = 1.0 / smpVNum;
				for ( var cu:number = 0; cu < 1.0; cu += stepU) {
					var vEnd:number = 1 - cu;	// 只要三角形，所以v的取值范围是1-u
					for (var cv:number = 0; cv < vEnd; cv += stepV) {
						var smpx:number = x0 + e1x * cu + e2x * cv;
						var smpy:number = y0 + e1y * cu + e2y * cv;
						var smpz:number = z0 + e1z * cu + e2z * cv;
						var smpu:number = u0 + du1 * cu + du2 * cv;	// TODO有的不用
						var smpv:number = v0 + dv1 * cu + dv2 * cv;
						
						// 处理这个采样点
						var gridid:number = this.pos2GridId1(smpx, smpy, smpz);
						var col:any[] = this.sampleTexture(tex, smpu, smpv);//[cu*255,cv*255,0,255];//
						
						var curcoldt:any[] = ret[gridid];
						if (!curcoldt)  ret[gridid] = [col[0], col[1], col[2], col[3], 1];
						else {
							curcoldt[0] += col[0];
							curcoldt[1] += col[1];
							curcoldt[2] += col[2];
							//curcoldt[3] += col[3];
							curcoldt[4]++;	// 多少个点
						}
					}
				}
			}
			console.timeEnd('格子化');
			console.time('求平均值-输出');
			//整理结果，每个格子只保留平均值
			var gridnum:number = 0;
			var repeatNum:number = 0;
			for ( var posid  in ret) {
				var colsum:any[] = ret[posid];
				var rsum:number = colsum[0];
				var gsum:number = colsum[1];
				var bsum:number = colsum[2];
				var cnum:number = colsum[4];
				gridnum++;
				repeatNum += cnum;
				ret1.push( { x:posid>>>20, y:(posid>>10)&0x3ff, z:posid&0x3ff, color:[(rsum/cnum)|0,(gsum/cnum)|0,(bsum/cnum)|0,255] } );
			}
			console.timeEnd('求平均值-输出');
			console.log('gridnum=', gridnum, '每个格子重复度:', (repeatNum / gridnum) );
			return ret1;
		}
	
		 renderToVoxel2(xsize:number):any[] {
			console.log('modelsize ', this.modelXSize, this.modelYSize, this.modelZSize);

			if (xsize <= 0 || !xsize) {
				xsize = this.modelXSize;
			}
			this.gridSize = this.modelXSize / xsize;
			
			this.trifiller.gridw = this.gridSize;
			this.gridXSize = Math.max( Math.ceil( xsize),1);
			this.gridYSize = Math.max( Math.ceil( this.modelYSize / this.gridSize),1);
			this.gridZSize = Math.max( Math.ceil(this.modelZSize / this.gridSize), 1);
			
			var ret1:any[] = [];		//x,y,z,color
			var ret:any[] = [];			//三维数组
			
			console.time('格子化');
			var faceNum:number = this.faceIndex.length / 3;
			var gridnum:number = 0;
			var fidSt:number = 0;
			for ( var fi = 0; fi < faceNum; fi++) {
				//取出纹理对象
				var vert0:any[] = this.vertexArray[this.faceIndex[fidSt++]];	
				var vert1:any[] = this.vertexArray[this.faceIndex[fidSt++]];
				var vert2:any[] = this.vertexArray[this.faceIndex[fidSt++]];
				//三个顶点的贴图必然一致。只取第一个就行了
				var tex:Texture2D = vert0[5];
				//if (typeof(tex) !== 'object') {
					//有错误，没有贴图。如果打印会不会弄死浏览器
				//}
				this.trifiller.v0[0] = (vert0[0] / this.gridSize+0.5) | 0;
				this.trifiller.v0[1] = (vert0[1] / this.gridSize+0.5) | 0;
				this.trifiller.v0[2] = (vert0[2] / this.gridSize+0.5) | 0;
				this.trifiller.v0f[3] = vert0[3];
				this.trifiller.v0f[4] = vert0[4];
				
				this.trifiller.v1[0] = (vert1[0] / this.gridSize+0.5) | 0;
				this.trifiller.v1[1] = (vert1[1] / this.gridSize+0.5) | 0;
				this.trifiller.v1[2] = (vert1[2] / this.gridSize+0.5) | 0;
				this.trifiller.v1f[3] = vert1[3];
				this.trifiller.v1f[4] = vert1[4];
				
				this.trifiller.v2[0] = (vert2[0] / this.gridSize+0.5) | 0;
				this.trifiller.v2[1] = (vert2[1] / this.gridSize+0.5) | 0;
				this.trifiller.v2[2] = (vert2[2] / this.gridSize+0.5) | 0;
				this.trifiller.v2f[3] = vert2[3];
				this.trifiller.v2f[4] = vert2[4];
				
				// TODO 现在的uv其实是不对的，应该根据重心坐标重新计算
				this.trifiller.fill(function(x:number, y:number, z:number, u:number, v:number) {
					var gridid:number =  x << 20 | y << 10 | z;
					var col:any[] =  this.sampleTexture(tex, u, v);//[u*255,v*255,0,255];//
					var curcoldt:any[] = ret[gridid];
					if (!curcoldt) {
						ret[gridid] = [col[0], col[1], col[2], 255, 1];
						gridnum++;
					}
					else {
						curcoldt[0] += col[0];
						curcoldt[1] += col[1];
						curcoldt[2] += col[2];
						//curcoldt[3] += col[3];
						curcoldt[4]++;	// 多少个点
					}
				});
			}
			console.timeEnd('格子化');
			console.time('求平均值-输出');
			ret1.length = gridnum;
			gridnum = 0;
			var repeatNum:number = 0;
			//整理结果，每个格子只保留平均值
			//var keys:Array = Object.keys(ret);
			for ( var posid  in ret) {
				var colsum:any[] = ret[posid];
				var rsum:number = colsum[0];
				var gsum:number = colsum[1];
				var bsum:number = colsum[2];
				var cnum:number = colsum[4];
				repeatNum += cnum;
				ret1[gridnum++] = { x:posid >>> 20, y:(posid >> 10) & 0x3ff, z:posid & 0x3ff, color:[(rsum / cnum) | 0, (gsum / cnum) | 0, (bsum / cnum) | 0, 255] } ;
				//ret1.push( );
			}
			console.timeEnd('求平均值-输出');
			console.log('gridnum=', gridnum, '每个格子重复度:', (repeatNum / gridnum) );
			return ret1;
		}
		
		
		//这个不需要了。转voxel都用原色就行
		/**
		 * 
		 * @param	xsize  		x方向上的格子数量，根据包围盒可以知道每个格子的大小。
		 * @param	colorNum	颜色数。现在都是256就行。
		 * @return
		 */
		 renderToPalVoxel(xsize:number, colorNum:number=256):any {
			var ret:any[] = this.renderToVoxel(xsize);
			console.time('renderToPalVoxel计算调色板');
			var i:number = 0;
			// 统计所有的颜色
			var origColor:Uint8Array = new Uint8Array(ret.length * 4);
			for (i = 0; i < ret.length; i++) {
				var colarr:any[] = ret[i].color;
				origColor[i * 4] = colarr[0] | 0;
				origColor[i * 4 + 1] = colarr[1] | 0;
				origColor[i * 4 + 2] = colarr[2] | 0;
				origColor[i * 4 + 3] = 255;
			}
			// 转成调色板
			var reducer:ColorQuantization_Mediancut = new ColorQuantization_Mediancut();
			var pal:Uint8Array = reducer.mediancut(origColor, colorNum);
			var idxRet:Uint8Array = new Uint8Array(ret.length);
			// 获得原始颜色的索引
			for (i = 0; i < ret.length; i++) {
				var colarr:any[] = ret[i].color;
				var r:number = colarr[0] | 0;
				var g:number = colarr[1] | 0;
				var b:number = colarr[2] | 0;
				var idx:number = reducer.getNearestIndex(r, g, b, pal);
				idxRet[i] = idx;
				// TEST 原始颜色转成调色板颜色
				colarr[0] = pal[idx * 3];
				colarr[1] = pal[idx * 3 + 1];
				colarr[2] = pal[idx * 3 + 2];
			}
			console.timeEnd('renderToPalVoxel计算调色板');
			return {palcolor:ret, pal:pal,idx:idxRet};
		}
		
		/**
		 * 采样一个三角形，返回位置和uv。返回的是一个数组，根据三角形的面积返回不同的采样个数
		 * @param	id  面id
		 * @param	outPos
		 * @param	outUV
		 */
		 getSamplePoints(id:number, outPos:any[], outUV:any[]):void {
			if (!outPos) outPos = [];
			if (!outUV) outUV = [];
			outPos.length = 0;
			outUV.length = 0;
			var fidSt:number = id * 3;
			var vid = this.faceIndex[fidSt];
			var x0 = this.vertexArray[vid][0];
			var y0 = this.vertexArray[vid][1];
			var z0 = this.vertexArray[vid][2];
			var u0 = this.vertexArray[vid][3]; 
			var v0 = this.vertexArray[vid][4]; 
			
			vid = this.faceIndex[fidSt+1];
			var x1 = this.vertexArray[vid][0];
			var y1 = this.vertexArray[vid][1];
			var z1 = this.vertexArray[vid][2];
			var u1 = this.vertexArray[vid][3]; 
			var v1 = this.vertexArray[vid][4]; 

			vid = this.faceIndex[fidSt+2];
			var x2 = this.vertexArray[vid][0];
			var y2 = this.vertexArray[vid][1];
			var z2 = this.vertexArray[vid][2];
			var u2 = this.vertexArray[vid][3]; 
			var v2 = this.vertexArray[vid][4]; 
		
			//e0
			this.tmpP0.x  = x1 - x0;
			this.tmpP0.y  = y1 - y0;
			this.tmpP0.z  = z1 - z0;
			
			//e1
			this.tmpP1.x = x2 - x0;
			this.tmpP1.y = y2 - y0;
			this.tmpP1.z = z2 - z0;
			
			Vector3.cross(this.tmpP0, this.tmpP1, this.tmpP2);
			var area:number = Vector3.scalarLength(this.tmpP2);
			var k:number = 12;	//每单位面积的随机次数
		
			var smpleNum = (area / this.gridSize / this.gridSize * k) | 0 + 1;	//最少1个
			var du1:number = u1 - u0;
			var dv1:number = v1 - v0;
			var du2:number = u2 - u0;
			var dv2:number = v2 - v0;
			for (var i = 0; i < smpleNum; i++) {
				var u:number = Math.random();			//
				var v:number = Math.random()*(1-u);		// 问题 这样可能不均匀
				var px:number = x0 + this.tmpP0.x * u + this.tmpP1.x * v;
				var py:number = y0 + this.tmpP0.y * u + this.tmpP1.y * v;
				var pz:number = z0 + this.tmpP0.z * u + this.tmpP1.z * v;
				outPos.push(px, py, pz);
				outUV.push(
					u0 + du1 * u + du2 * v,
					v0 + dv1 * u + dv2 * v);
			}
		}
		
		/// 辅助函数
		/**
		 * 转换一个lh文件
		 * @param	f
		 * @param sz	x方向的格子的个数
		 * @param cb	完成的回调函数， cb(arr:CubeInfoArray)
		 */
		 loadLH(f:string, sz:number, cb:Function):void {
			// 先不支持贴图 TODO
			this.onlyMtl = true;
			
			Sprite3D.load( f, Handler.create(null, function(sprite:Sprite3D):void{
				var arr:any[] = new Array();
				this.ParseSprite3D(sprite, arr);
				var vertex:any[] = [];
				var index:any[] = [];
				var vnum = 0;
				for ( var vi = 0; vi < arr.length; vi++) {
					vertex = vertex.concat( arr[vi].vertexData);
					var ib:Uint16Array = arr[vi].indexData;
					var tindex:any[] = [];	
					ib.forEach(function(v:number, i:number) { 
						tindex[i] = v + vnum;
					} );
					index = index.concat(tindex);
					vnum += arr[vi].vertexData.length;
				}
				
				var carr:CubeInfoArray = this.toVoxel(vertex, index, sz);
				cb && cb(carr);
			}));
			
		}
		
		 toVoxel(verteices:any[], indices:any[], sz:number):CubeInfoArray {
			this.setModelData(verteices, indices);
			var i:number = 0;
			var ret:any[] = this.renderToVoxel(sz);
			var carr:CubeInfoArray  = CubeInfoArray.create();
			for (i = 0; i < ret.length; i++) {
				var o:any = ret[i];
				//cubeMeshSprite3D.AddCube(o.x, o.y, o.z, Lh2Voxel.colorToU32(o.color),0);
				carr.append(o.x, o.y, o.z, Lh2Voxel.colorToU32(o.color));
			}
			return carr;
		}
		
		private ParseSprite3D(sprite:Sprite3D, arr:any[]):void{
			if (sprite instanceof MeshSprite3D){
				arr.push(this.ParseMeshSprite3D(sprite));
			}
			var numChildren = sprite.numChildren;
			for (var i = 0; i < numChildren; i++){
				var mp:Sprite3D = (<Sprite3D>sprite.getChildAt(i) );
				this.ParseSprite3D(mp, arr);
			}
		}
		
		private ParseMeshSprite3D(meshsprite:MeshSprite3D):any[]{
			var data:any = {};
			var resultArray:any[] = new Array();
			data.vertexData = resultArray;
			//meshsprite.meshRenderer.sharedMaterials
			var altexture:BaseTexture =(meshsprite.meshRenderer && meshsprite.meshRenderer.sharedMaterial)?(meshsprite.meshRenderer.sharedMaterial).albedoTexture:null;
			
			var mf:MeshFilter = (<MeshFilter>meshsprite.meshFilter );
			var mh:Mesh = (<Mesh>mf.sharedMesh );
			
			var mypositions:Vector3[] = mh._getPositions();
			var uvs:Vector2[] = [];
			var indices:Uint16Array = mh._indexBuffer.getData();
			data.indexData = indices;
			var transformWorldMatrix:Matrix4x4 = meshsprite.transform.worldMatrix;
			
			//得到所有的subMesh
			var subMeshes:SubMesh[] = mh._subMeshes;
			//得到所有的材质
			var sharedMaterials:BaseMaterial[] =  meshsprite.meshRenderer.sharedMaterials;
			//得到所有的texture
			var subTextures:any[] = new Array();
			for (var m = 0; m < sharedMaterials.length; m++){
				subTextures.push(((<BlinnPhongMaterial>sharedMaterials[m] )).albedoTexture);
			}
			
			var i:number, j:number, vertexBuffer:VertexBuffer3D, uvElement:VertexElement, vertexElements:any[], vertexElement:VertexElement, ofset:number, verticesData:Float32Array;
			var vertexBufferCount:number = mh._vertexBuffers.length;
			
			for (i = 0; i < vertexBufferCount; i++){
				vertexBuffer = mh._vertexBuffers[i];
				vertexElements = vertexBuffer.vertexDeclaration.vertexElements;
				for (j = 0; j < vertexElements.length; j++){
					vertexElement = vertexElements[j];
					if (vertexElement.elementFormat === VertexElementFormat.Vector2 && vertexElement.elementUsage === VertexMesh.MESH_TEXTURECOORDINATE0){
						uvElement = vertexElement;
						break;
					}
				}
				
				verticesData = vertexBuffer.getData();
				for (j = 0; j < verticesData.length; j += vertexBuffer.vertexDeclaration.vertexStride / 4){
					ofset = j + uvElement.offset / 4;
					uvs.push(new Vector3(verticesData[ofset + 0], verticesData[ofset + 1]));
				}
				
			}
			
			var pointCount:number = mypositions.length;
			for (var k:number = 0; k < pointCount; k++){
				var resultVector:Vector3 = new Vector3();
				Vector3.transformV3ToV3(mypositions[k], transformWorldMatrix, resultVector);
				resultArray[k] = [resultVector.x, resultVector.y, resultVector.z, uvs[k].x, uvs[k].y, altexture];
			}
			
			for (var m:number = 0; m < subMeshes.length; m++) {
				var indexStart:number = subMeshes[m]._indexStart;
				var indexCount:number = subMeshes[m]._indexCount;
				var mtl:BlinnPhongMaterial = ((<BlinnPhongMaterial>sharedMaterials[m] ));
				var mtlcolor:any[] = [mtl._ColorR, mtl._ColorG, mtl._ColorB];
				for (var ii:number = 0; ii < indexCount; ii++) {
					resultArray[indices[ii + indexStart]][5] = this.onlyMtl?mtlcolor:subTextures[m];
				}
			}
			return data;
		}
		
	}

