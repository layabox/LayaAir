import { CubeGeometry } from "././CubeGeometry";
import { CubeInfo } from "././CubeInfo";
import { CubeRender } from "././CubeRender";
import { CubeMaterial } from "././CubeMaterial";
import { CubeMap } from "././CubeMap";
import { VoxFileData } from "./../vox/VoxFileData";
import { Handler } from "laya/utils/Handler";
import { Event } from "events/Event";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { PixelLineFilter } from "laya/d3/core/pixelLine/PixelLineFilter";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D"
	import { BaseMaterial } from "laya/d3/core/material/BaseMaterial"
	import { RenderState } from "laya/d3/core/material/RenderState"
	import { PixelLineMaterial } from "laya/d3/core/pixelLine/PixelLineMaterial"
	import { RenderElement } from "laya/d3/core/render/RenderElement"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { CubeInfoArray } from "../worldMaker/CubeInfoArray"
	/**
	 * <code>CubeSprite3D</code> 类用于实现方块精灵。
	 */
	export class CubeSprite3D extends RenderableSprite3D {
		 static MAXCUBES:number = 300000;
		
		/** @private */
		 _cubeGeometry:CubeGeometry
		 Layer:number = 0;
		/** @private */
		 _enableEditer:boolean;
		
		//public static const MAXCUBESIZE:int = 1600;
		
		 UpdataCube:CubeInfoArray[] = [];
		
		 CubeNums:number = 0;
		/**是否可以渲染。 */
		 enableRender:boolean = true;
		
		/**
		 * 获取是否可编辑。
		 * @return 是否可编辑。
		 */
		 get enableEditer():boolean {
			return this._enableEditer;
		}
		
		/**
		 * 创建一个 <code>CubeSprite3D</code> 实例。
		 * @param cubeSprite3D 源方块精灵,如果为空,则内部会自动创建几何体信息并可编辑,不为空则使用参数的几何体并不可编辑
		 * @param name 名字
		 */
		constructor(cubeSprite3D:CubeSprite3D = null, name:string = null){
			super(name);
			this.selectCube = CubeInfo.create(0, 0, 0);
			if (cubeSprite3D) {
				if (cubeSprite3D.enableEditer) {
					throw "CubeSprite3D: cubeSprite3D must be can't editer.";
				} else {
					this._cubeGeometry = cubeSprite3D._cubeGeometry;
					this._enableEditer = false;
				}
			} else {
				this._cubeGeometry = new CubeGeometry(this);
				this._enableEditer = true;
			}
			var render:CubeRender = new CubeRender(this);
			this._render = render;
			var renderObjects:RenderElement[] = render._renderElements;
			var renderElement:RenderElement = new RenderElement();
			//miner
			//	var material:BlinnPhongMaterial = new BlinnPhongMaterial();
			
			var material:CubeMaterial = new CubeMaterial();
			
			//material.enableVertexColor = true;
			material.modEnableVertexColor = true;
			material.enableVertexColor = true;
			
			material.albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
			material.specularColor = new Vector4(0.2, 0.2, 0.2, 1);
			renderElement.setTransform(this._transform);
			renderElement.setGeometry(this._cubeGeometry);
			renderElement.render = render;
			renderElement.material = material;
			renderObjects.push(renderElement);
			this._render._defineDatas.add(MeshSprite3D.SHADERDEFINE_COLOR);
			this._render.sharedMaterial = material;
			//12.10
			
			this.addChild(this.cubeMeshSpriteLines);
			this.cubeMeshSpriteLinesFill = this.cubeMeshSpriteLines._geometryFilter;
			
			var pm:PixelLineMaterial = new PixelLineMaterial();
			pm.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE + 1;
			pm.getRenderState(0).depthTest = RenderState.DEPTHTEST_LEQUAL;
			this.cubeMeshSpriteLines.pixelLineRenderer.material = pm;
			this.addComponent(Asynchronousloading);
		}
		
		/**
		 * 添加方块。
		 * @param	x X坐标
		 * @param	y Y坐标
		 * @param	z Z坐标
		 * @param	color 颜色
		 */
		 AddCube(x:number, y:number, z:number, color:number, layer:number = 0, isSetData:boolean = false):number {
			
			if (y <= -CubeGeometry.HLAFMAXSIZE || y >= CubeGeometry.HLAFMAXSIZE) {
				return -1;
			}
	
			//else if(enableEditer)
			return this._cubeGeometry.addCube(x, y, z, color, isSetData);
			//else 
			//return -1
		
		}
		
		/**
		 * 删除方块。
		 * @param	x X坐标
		 * @param	y Y坐标
		 * @param	z Z坐标
		 * @param	color 颜色
		 */
		 RemoveCube(x:number, y:number, z:number, isSetData:boolean = false):number {
			//if (_enableEditer)
			return (this.CubeNums == 1) ? -1 : this._cubeGeometry.removeCube(x, y, z, isSetData);
			//else
			//return -1;
		}
		
		/**
		 * 更新方块颜色。
		 * @param	x X坐标
		 * @param	y Y坐标
		 * @param	z Z坐标
		 * @param	color 颜色
		 */
		 UpdataColor(x:number, y:number, z:number, color:number):number {
			if (this._enableEditer)
				return this._cubeGeometry.updateColor(x, y, z, color);
			else
				return -1;
		}
		
		/**
		 * 更新方块的alpha属性
		 * @param	x
		 * @param	y
		 * @param	z
		 */
		 UpdataProperty(x:number, y:number, z:number, Property:number):number {
			if (this._enableEditer)
				return this._cubeGeometry.updataProperty(x, y, z, Property);
			else
				return -1;
		}
		
		/**
		 * 删掉没有面的函数
		 */
		 deletNoFaceCube():void {
			var cubemap:CubeMap = this._cubeGeometry.cubeMap;
			var cubeinfos:CubeInfo[] = cubemap.returnAllCube();
			for (var i:number = 0; i < cubeinfos.length; i++) {
				this.RemoveCube(cubeinfos[i].x - 1600, cubeinfos[i].y - 1600, cubeinfos[i].z - 1600);
			}
		}
		
		 UpdataAo(x:number, y:number, z:number):void {
			if (this._enableEditer)
				this._cubeGeometry.updateAO(x, y, z);
		}
		
		/**
		 * 寻找方块
		 * @param	x X坐标
		 * @param	y Y坐标
		 * @param	z Z坐标
		 * @return	color 颜色
		 */
		 FindCube(x:number, y:number, z:number):number {
			//if (_enableEditer)
			return this._cubeGeometry.findCube(x, y, z); //(x<0 || x>=CubeMap.SIZE || y<0 || y>=CubeMap.SIZE)?null:_cubeGeometry.findCube(x, y, z);
			//else
			//return -1;
		}
		
		/**
		 * 清除所有方块。
		 */
		 RemoveAllCube():void {
			if (this._enableEditer) {
				this._cubeGeometry.clear();
				this.UpdataCube && (this.UpdataCube.length = 0);
				this.CubeNums = 0;
			}
		}
		
		/**
		 * 清理编辑信息,清除后不可恢复编辑。
		 */
		 clearEditerInfo():void {
			if (this._enableEditer) {
				this.UpdataCube = null;
				this._enableEditer = false;
					//_cubeGeometry._clearEditerInfo();
			}
		}
		
		//________________________________________________________________________________
		/**
		 * 加载本地文件
		 * @param   文件地址
		 */
		
		private voxfile:VoxFileData;
		
		 loadFileData(url:string):void {
			this.RemoveAllCube();
			if (url.indexOf(".vox") != -1 || url.indexOf(".lm") != -1) {
				this.voxfile = this.voxfile || new VoxFileData();
				this.voxfile.LoadVoxFile(url, Handler.create(this, function(cubeArray:CubeInfoArray):void {
					
					cubeArray.Layar = this.layer;
					this.AddCubes(cubeArray);
					
					this.event(Event.COMPLETE);
				}));
			} else if (url.indexOf(".lvox") != -1 || url.indexOf(".lh") != -1) {
				this.lVoxFile.LoadlVoxFile(url, Handler.create(this, function(cubeArray:CubeInfoArray):void {
					//var cubeArray:CubeInfoArray = VectorCubeRevertCubeInfoArray(cubeinfoss);
					cubeArray.Layar = this.layer;
					this.AddCubes(cubeArray);
					this.event(Event.COMPLETE);
				}))
			}
		}
		private _src:string;
		
		 set src(str:string) {
			this._src = str;
			this.loadFileData(str);
		}
		
		/*override*/  _parse(data:any):void {
			super._parse(data);
			if (data.src) {
				this.src = data.src;
			}
		}
		
		 get src():string {
			return this._src;
		}
		 isReady:boolean = true;
		
		//通过ArrayBuffer初始化
		 loadByArrayBuffer(arrayBuffer:ArrayBuffer):void {
			this.isReady = false;
			var cubeInfo:CubeInfoArray = this.lVoxFile.LoadlVoxFilebyArray(arrayBuffer);
			if (cubeInfo) {
				this.AddCubeByArray(cubeInfo);
			}
		}
		
		//_______________________________________________________________________
		
		 VectorCubeRevertCubeInfoArray(cubearray:CubeInfo[]):CubeInfoArray {
			var cubeInfoarray:CubeInfoArray = new CubeInfoArray();
			var length:number = cubearray.length;
			for (var i:number = 0; i < length; i++) {
				cubeInfoarray.PositionArray.push(cubearray[i].x);
				cubeInfoarray.PositionArray.push(cubearray[i].y);
				cubeInfoarray.PositionArray.push(cubearray[i].z);
				cubeInfoarray.colorArray.push(cubearray[i]._color);
			}
			return cubeInfoarray;
		}
		
		 AddCubeByArray(cubeInfoArray:CubeInfoArray):void {
			
			cubeInfoArray.currentPosindex = 0;
			cubeInfoArray.currentColorindex = 0;
			this.Layer = cubeInfoArray.Layar;
			cubeInfoArray.operation = CubeInfoArray.Add;
			this.UpdataCube.push(cubeInfoArray);
			
			this._cubeGeometry.IsRender = false;
			
			var cubeAoArray:CubeInfoArray = CubeInfoArray.create();
			cubeAoArray.PositionArray.length = 0;
			
			cubeAoArray.PositionArray = cubeInfoArray.PositionArray.slice();
		
		}
		
		 returnArrayValues:number[] = [];
		
		/**
		 * 批量增加Cube
		 */
		 AddCubes(cubeInfoArray:CubeInfoArray, isUpdataAo:boolean = true):number[] {
			
			var lenth:number = cubeInfoArray.PositionArray.length / 3;
			var PositionArray:number[] = cubeInfoArray.PositionArray;
			cubeInfoArray.currentColorindex = 0;
			cubeInfoArray.currentPosindex = 0;
			this.returnArrayValues.length = lenth;
			for (var i:number = 0; i < lenth; i++) {
				var x:number = PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dx;
				var y:number = PositionArray[cubeInfoArray.currentPosindex + 1] + cubeInfoArray.dy;
				var z:number = PositionArray[cubeInfoArray.currentPosindex + 2] + cubeInfoArray.dz;
				var color:number = cubeInfoArray.colorArray[cubeInfoArray.currentColorindex];
				cubeInfoArray.currentPosindex += 3;
				cubeInfoArray.currentColorindex++;
				this.returnArrayValues[i] = this.AddCube(x, y, z, color, cubeInfoArray.Layar, isUpdataAo);
			}
			return this.returnArrayValues;
		}
		
		/**
		 * 批量减少Cube
		 */
		 RemoveCubes(cubeInfoArray:CubeInfoArray, CalAo:boolean = true):number[] {
			this.returnArrayValues.length = 0;
			var lenth:number = cubeInfoArray.PositionArray.length / 3;
			cubeInfoArray.currentPosindex = 0;
			for (var i:number = 0; i < lenth; i++) {
				var x:number = cubeInfoArray.PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dx;
				cubeInfoArray.currentPosindex++;
				var y:number = cubeInfoArray.PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dy;
				cubeInfoArray.currentPosindex++;
				var z:number = cubeInfoArray.PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dz;
				cubeInfoArray.currentPosindex++;
				if (this.FindCube(x, y, z) != -1) {
					this.returnArrayValues.push(this.RemoveCube(x, y, z, CalAo));
				} else {
					this.returnArrayValues.push(-1);
				}
			}
			
			return this.returnArrayValues;
		}
		
		/**
		 * 批量更换颜色
		 */
		 UpdateColors(cubeInfoArray:CubeInfoArray, color:number):number[] {
			this.returnArrayValues.length = 0;
			var len:number = cubeInfoArray.colorArray.length;
			var posarr:number[] = cubeInfoArray.PositionArray;
			for (var i:number = 0; i < len; i++) {
				var tempArr:number = this.UpdataColor(posarr[i * 3] + cubeInfoArray.dx, posarr[i * 3 + 1] + cubeInfoArray.dy, posarr[i * 3 + 2] + cubeInfoArray.dz, color == -1 ? cubeInfoArray.colorArray[i] : color, false);
				this.returnArrayValues.push(tempArr);
			}
			
			return this.returnArrayValues;
		}
		
		/**
		 * 批量修改AO
		 */
		 CalCubeAos(cubeInfoArray:CubeInfoArray):void {
			var lenth:number = cubeInfoArray.PositionArray.length / 3;
			cubeInfoArray.currentPosindex = 0;
			for (var i:number = 0; i < lenth; i++) {
				var x:number = cubeInfoArray.PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dx;
				cubeInfoArray.currentPosindex++;
				var y:number = cubeInfoArray.PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dy;
				cubeInfoArray.currentPosindex++;
				var z:number = cubeInfoArray.PositionArray[cubeInfoArray.currentPosindex] + cubeInfoArray.dz;
				cubeInfoArray.currentPosindex++;
				
				this.UpdataAo(x, y, z);
				
			}
		}
		
		//画线
		 cubeMeshSpriteLines:PixelLineSprite3D = new PixelLineSprite3D(100);
		 cubeMeshSpriteLinesFill:PixelLineFilter;
		private StarPoint:Vector3 = new Vector3(0, 0, 0);
		private EndPoint:Vector3 = new Vector3(0, 0, 0);
		protected lineCount:number;
		 selectCube:CubeInfo;
		 selectCubeMap:CubeMap = new CubeMap();
		
		//画一个面的线
		 drawLineFace(index:number, x:number, y:number, z:number, isSetData:boolean):void {
			switch (index) {
			case 0: 
				this.selectCube.selectArrayIndex.push(this.lineCount);
				this.drawoneLine(this.lineCount++, x + 1, y + 1, z + 1, x, y + 1, z + 1, isSetData);
				this.drawoneLine(this.lineCount++, x, y + 1, z + 1, x, y, z + 1, isSetData);
				this.drawoneLine(this.lineCount++, x, y, z + 1, x + 1, y, z + 1, isSetData);
				this.drawoneLine(this.lineCount++, x + 1, y, z + 1, x + 1, y + 1, z + 1, isSetData);
				break;
			case 1: 
				this.selectCube.selectArrayIndex.push(this.lineCount);
				this.drawoneLine(this.lineCount++, x + 1, y + 1, z + 1, x + 1, y, z + 1, isSetData);
				this.drawoneLine(this.lineCount++, x + 1, y, z + 1, x + 1, y, z, isSetData);
				this.drawoneLine(this.lineCount++, x + 1, y, z, x + 1, y + 1, z, isSetData);
				this.drawoneLine(this.lineCount++, x + 1, y + 1, z, x + 1, y + 1, z + 1, isSetData);
				
				break;
			case 2: 
				this.selectCube.selectArrayIndex.push(this.lineCount);
				this.drawoneLine(this.lineCount++, x + 1, y + 1, z + 1, x + 1, y + 1, z, isSetData);
				this.drawoneLine(this.lineCount++, x + 1, y + 1, z, x, y + 1, z, isSetData);
				this.drawoneLine(this.lineCount++, x, y + 1, z, x, y + 1, z + 1, isSetData);
				this.drawoneLine(this.lineCount++, x, y + 1, z + 1, x + 1, y + 1, z + 1, isSetData);
				
				break;
			case 3: 
				this.selectCube.selectArrayIndex.push(this.lineCount);
				this.drawoneLine(this.lineCount++, x, y + 1, z + 1, x, y + 1, z, isSetData);
				this.drawoneLine(this.lineCount++, x, y + 1, z, x, y, z, isSetData);
				this.drawoneLine(this.lineCount++, x, y, z, x, y, z + 1, isSetData);
				this.drawoneLine(this.lineCount++, x, y, z + 1, x, y + 1, z + 1, isSetData);
				
				break;
			case 4: 
				this.selectCube.selectArrayIndex.push(this.lineCount);
				this.drawoneLine(this.lineCount++, x, y, z, x + 1, y, z, isSetData);
				this.drawoneLine(this.lineCount++, x + 1, y, z, x + 1, y, z + 1, isSetData);
				this.drawoneLine(this.lineCount++, x + 1, y, z + 1, x, y, z + 1, isSetData);
				this.drawoneLine(this.lineCount++, x, y, z + 1, x, y, z, isSetData);
				
				break;
			case 5: 
				this.selectCube.selectArrayIndex.push(this.lineCount);
				this.drawoneLine(this.lineCount++, x + 1, y, z, x, y, z, isSetData);
				this.drawoneLine(this.lineCount++, x, y, z, x, y + 1, z, isSetData);
				this.drawoneLine(this.lineCount++, x, y + 1, z, x + 1, y + 1, z, isSetData);
				this.drawoneLine(this.lineCount++, x + 1, y + 1, z, x + 1, y, z, isSetData);
				break;
			}
		}
		private  cubeMeshSpriteKey:number;
		
		//选择Cube
		 SelectCube(x:number, y:number, z:number, isSetData:boolean = true, IsFanXuan:boolean = false):number {
			
			this.selectCube = this._cubeGeometry.findCubeToCubeInfo(x, y, z);
			if (!this.selectCube || !this.selectCube.subCube) {
				console.warn("this SelectCube is not exist");
				return 0;
			}
			//判断是否已经选中
			if (IsFanXuan) {
				if (((<CubeInfo>this.selectCubeMap.find(x + CubeGeometry.HLAFMAXSIZE, y + CubeGeometry.HLAFMAXSIZE, z + CubeGeometry.HLAFMAXSIZE) )) != null) {
					
					this.selectCubeMap.remove(x + CubeGeometry.HLAFMAXSIZE, y + CubeGeometry.HLAFMAXSIZE, z + CubeGeometry.HLAFMAXSIZE);
					this.CancelSelect(this.selectCube, isSetData);
					return 1;
					
				}
				return 0;
			}
			
			if (((<CubeInfo>this.selectCubeMap.find(x + CubeGeometry.HLAFMAXSIZE, y + CubeGeometry.HLAFMAXSIZE, z + CubeGeometry.HLAFMAXSIZE) )) == null) {	//选中
				this.selectCubeMap.add(x + CubeGeometry.HLAFMAXSIZE, y + CubeGeometry.HLAFMAXSIZE, z + CubeGeometry.HLAFMAXSIZE, this.selectCube);
				this.selectCube.ClearSelectArray();
				for (var j:number = 0; j < 6; j++) {
					
					if ((x + CubeGeometry.HLAFMAXSIZE + 1 < 0) || (y + CubeGeometry.HLAFMAXSIZE + 1 < 0) || (z + CubeGeometry.HLAFMAXSIZE + 1 < 0)) {
						return -1;
					}
					var otherCube:CubeInfo = this._cubeGeometry.cubeMap.find(x + CubeGeometry.HLAFMAXSIZE + 1, y + CubeGeometry.HLAFMAXSIZE + 1, z + CubeGeometry.HLAFMAXSIZE + 1);
					switch (j) {
					case 0: 
						if (otherCube.calDirectCubeExit(6) != -1) continue;
						break;
					case 1: 
						if (otherCube.calDirectCubeExit(5) != -1) continue;
						break;
					case 2: 
						if (otherCube.calDirectCubeExit(0) != -1) continue;
						break;
					case 3: 
						if (this.selectCube.calDirectCubeExit(2) != -1) continue;
						break;
					case 4: 
						if (this.selectCube.calDirectCubeExit(7) != -1) continue;
						break;
					case 5: 
						if (this.selectCube.calDirectCubeExit(1) != -1) continue;
						break;
					}
					this.drawLineFace(j, x, y, z, isSetData);
					
				}
				return 1;
			}
			return 0;
		
		}
		
		 SelectCubes(cubeInfoarray:CubeInfoArray, isFanXuan:boolean = false):number[] {
			var length:number = cubeInfoarray.colorArray.length;
			this.returnArrayValues.length = length;
			cubeInfoarray.currentPosindex = 0;
			for (var i:number = 0; i < length; i++) {
				var x:number = cubeInfoarray.PositionArray[i * 3] + cubeInfoarray.dx;
				var y:number = cubeInfoarray.PositionArray[i * 3 + 1] + cubeInfoarray.dy;
				var z:number = cubeInfoarray.PositionArray[i * 3 + 2] + cubeInfoarray.dz;
				this.returnArrayValues[i] = this.SelectCube(x, y, z, false, isFanXuan);
			}
			this.cubeMeshSpriteLinesFill._vertexBuffer.setData(this.cubeMeshSpriteLinesFill._vertices, 0, 0, this.lineCount * 14);
			return this.returnArrayValues;
		}
		
		//画一条线
		 drawoneLine(LineIndex:number, startx:number, starty:number, startz:number, endx:number, endy:number, endz:number, IssetData:boolean):void {
			var offset:number = LineIndex * 14;
			
			var vertices:Float32Array = this.cubeMeshSpriteLinesFill._vertices;
			vertices[offset + 0] = startx;
			vertices[offset + 1] = starty;
			vertices[offset + 2] = startz;
			
			vertices[offset + 3] = 1;
			vertices[offset + 4] = 1;
			vertices[offset + 5] = 1;
			vertices[offset + 6] = 1;
			
			vertices[offset + 7] = endx;
			vertices[offset + 8] = endy;
			vertices[offset + 9] = endz;
			
			vertices[offset + 10] = 1;
			vertices[offset + 11] = 1;
			vertices[offset + 12] = 1;
			vertices[offset + 13] = 1;
			this.cubeMeshSpriteLinesFill._lineCount += 1;
			if (this.cubeMeshSpriteLinesFill._lineCount == this.cubeMeshSpriteLinesFill._maxLineCount)
				this.cubeMeshSpriteLines.maxLineCount += 20000;
			if (IssetData)
				this.cubeMeshSpriteLinesFill._vertexBuffer.setData(vertices, offset, offset, 14);
		}
		
		 CancelSelect(cubeInfoCan:CubeInfo, IsSetData:boolean):void {
			var FaceNum:number = cubeInfoCan.selectArrayIndex.length;
			var arrayInt:number[] = cubeInfoCan.selectArrayIndex;
			for (var i:number = 0; i < FaceNum; i++) {
				
				this.CancelDrawOneFace(arrayInt[i], IsSetData);
			}
		}
		
		 CancelDrawOneFace(LineIndex:number, IssetData:boolean):void {
			for (var i:number = 0; i < 4; i++) {
				this.CancelDrawOneLine(LineIndex + i, IssetData);
			}
		}
		
		 CancelDrawOneLine(LineIndex:number, IssetData:boolean):void {
			var offset:number = LineIndex * 14;
			
			var vertices:Float32Array = this.cubeMeshSpriteLinesFill._vertices;
			vertices[offset + 0] = 0;
			vertices[offset + 1] = 0;
			vertices[offset + 2] = 0;
			
			vertices[offset + 3] = 1;
			vertices[offset + 4] = 1;
			vertices[offset + 5] = 1;
			vertices[offset + 6] = 1;
			
			vertices[offset + 7] = 0;
			vertices[offset + 8] = 0;
			vertices[offset + 9] = 0;
			
			vertices[offset + 10] = 1;
			vertices[offset + 11] = 1;
			vertices[offset + 12] = 1;
			vertices[offset + 13] = 1;
			
			if (IssetData)
				this.cubeMeshSpriteLinesFill._vertexBuffer.setData(vertices, offset, offset, 14);
		}
		
		 LineClear():void {
			this.cubeMeshSpriteLines.clear();
			this.selectCubeMap.clear();
			this.lineCount = 0;
		}
		
		 SelectAllCube():void {
			var vec:CubeInfo[] = this._cubeGeometry.cubeMap.returnCubeInfo();
			var length:number = vec.length;
			var cubeinfo:CubeInfo;
			for (var i:number = 0; i < length; i++) {
				cubeinfo = vec[i];
				this.SelectCube(cubeinfo.x - CubeGeometry.HLAFMAXSIZE, cubeinfo.y - CubeGeometry.HLAFMAXSIZE, cubeinfo.z - CubeGeometry.HLAFMAXSIZE, false, false);
			}
			this.cubeMeshSpriteLinesFill._vertexBuffer.setData(this.cubeMeshSpriteLinesFill._vertices, 0, 0, this.lineCount * 14);
		}
		
		/**
		 * @inheritDoc
		 * @param	destroyChild
		 */
		/*override*/  destroy(destroyChild:boolean = true):void {
			super.destroy(destroyChild);
			this._cubeGeometry.destroy();
			CubeInfo.recover(this.selectCube);
		}
		
		 cubeTrans(isTran:boolean = true):void {
			
			var maa:BaseMaterial = this._render.sharedMaterial;
			if (isTran) {
				((<CubeMaterial>maa )).renderMode = CubeMaterial.RENDERMODE_TRANSPARENT;
				((<CubeMaterial>maa )).albedoColorA = 0.5;
			} else {
				((<CubeMaterial>maa )).renderMode = CubeMaterial.RENDERMODE_OPAQUE;
				((<CubeMaterial>maa )).albedoColorA = 1.0;
			}
		}
	
	}




import { Script3D } from "laya/d3/component/Script3D"
import { Sprite3D } from "laya/d3/core/Sprite3D"



import { Color } from "laya/d3/math/Color"



import { Stat } from "laya/utils/Stat"

class Asynchronousloading extends Script3D {
	private _pixelline:PixelLineSprite3D;
	private _pixelMaterial:PixelLineMaterial;
	private _linecolor:Vector4 = new Vector4(1, 1, 1, 1);
	private _tim:number = 0;
	
	private cubeSprite3D:CubeSprite3D;
	private color:number;
	private cubeinfoarray:CubeInfoArray;
	private  x:number;
	private  y:number;
	private  z:number;
	
	/*override*/  onStart():void {
		this.cubeSprite3D = (<CubeSprite3D>this.owner );
		this._pixelline = this.cubeSprite3D.cubeMeshSpriteLines;
		
		this._pixelMaterial = (<PixelLineMaterial>this._pixelline._render.material );
	}
	
	/*override*/  onUpdate():void {
		this.AddCubeYiBu();
		if (this._pixelline.lineCount > 0) {
			if (Stat.loopCount % 2 == 0) {
				this.changeLineColor();
			}
		}
	}
	
	 AddCubeYiBu():void {
		if (this.cubeSprite3D.UpdataCube.length != 0) {
			this.cubeinfoarray = this.cubeSprite3D.UpdataCube[0];
			var currentPosIndex:number = this.cubeinfoarray.currentPosindex;
			if ((this.cubeinfoarray.PositionArray.length - currentPosIndex - 1) / 3 < CubeGeometry.updateCubeCount) {
				//1增加 2减少
				var length:number = (this.cubeinfoarray.PositionArray.length - (currentPosIndex + 1)) / 3;
				for (var i:number = 0; i < length; i++) {
					this.x = this.cubeinfoarray.PositionArray[currentPosIndex++] + this.cubeinfoarray.dx;
					this.y = this.cubeinfoarray.PositionArray[currentPosIndex++] + this.cubeinfoarray.dy;
					this.z = this.cubeinfoarray.PositionArray[currentPosIndex++] + this.cubeinfoarray.dz;
					
					this.color = this.cubeinfoarray.colorArray[this.cubeinfoarray.currentColorindex++];
					this.cubeSprite3D.AddCube(this.x, this.y, this.z, this.color, this.cubeinfoarray.Layar, false);
					
				}
				this.cubeinfoarray.currentColorindex = this.cubeinfoarray.currentPosindex = 0;
				this.cubeSprite3D.UpdataCube.shift();
				this.cubeSprite3D._cubeGeometry.IsRender = true;
				if (this.cubeSprite3D.UpdataCube.length == 0) {
					this.cubeSprite3D.isReady = true;
				}
				
				
				
			} else {
				for (var i:number = 0; i < CubeGeometry.updateCubeCount; i++) {
					this.x = this.cubeinfoarray.PositionArray[currentPosIndex++] + this.cubeinfoarray.dx;
					this.y = this.cubeinfoarray.PositionArray[currentPosIndex++] + this.cubeinfoarray.dy;
					this.z = this.cubeinfoarray.PositionArray[currentPosIndex++] + this.cubeinfoarray.dz;
					
					this.color = this.cubeinfoarray.colorArray[this.cubeinfoarray.currentColorindex++];
					this.cubeSprite3D.AddCube(this.x, this.y, this.z, this.color, this.cubeinfoarray.Layar, false);
				}
				this.cubeinfoarray.currentPosindex += CubeGeometry.updateCubeCount * 3;
				
			}
		}
	
	}
	
	 changeLineColor():void {
		this._tim += 0.05;
		this._linecolor.y = Math.abs(Math.cos(this._tim));
		this._linecolor.z = Math.abs(Math.cos(this._tim));
		this._pixelMaterial.color = this._linecolor;
	
	}

}


