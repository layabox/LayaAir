import { CubeMap } from "././CubeMap";
import { CubeInfo } from "././CubeInfo";
import { SubCubeGeometry } from "././SubCubeGeometry";
import { FileSaver } from "./../FileSaver";
import { GeometryElement } from "laya/d3/core/GeometryElement"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
	import { RenderContext3D } from "laya/d3/core/render/RenderContext3D"
	import { MeshReader } from "laya/d3/loaders/MeshReader"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { Mesh } from "laya/d3/resource/models/Mesh"
	import { SubMesh } from "laya/d3/resource/models/SubMesh"
	import { CubeSprite3D } from "./CubeSprite3D"
	import { Byte } from "laya/utils/Byte"

	/**
	 * <code>CubeGeometry</code> 类用于实现方块几何体。
	 */
	export class CubeGeometry extends GeometryElement {
		/**@private */
		private static _type:number = GeometryElement._typeCounter++;
			
		
		/**@private */
		 static CUBEINDEX:number = 9;
		/**@private */
		 static HLAFMAXSIZE:number = 1600;
		
		/**@private 方块8个点局部坐标*/
		 static POINTS:any[] = [1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0];
		
		/**@private 需要每帧处理的盒子数组 */
		private _modifyCubes:any[] = [];
		
		/**小方块Map [只读]*/
		 cubeMap:CubeMap = new CubeMap();
		/**大方块Map [只读]*/
		 subBoxMap:any = {};
		/**每帧处理的个数 */
		 static updateCubeCount:number = 1000;
		/**是否允许每帧更新数据 */
		 enableUpdate:boolean = true;
		
		 cubeSprite3D:CubeSprite3D;
		
		 IsRender:boolean = true;
		
	
		
		
		constructor(cubeGeometry:CubeSprite3D){
			super();
this.cubeSprite3D = cubeGeometry;
		}
		
		/**
		 * @private
		 * @private
		 */
		 addCube(x:number, y:number, z:number, color:number, isUpdataAO:boolean = false):number {
			
			x += CubeGeometry.HLAFMAXSIZE;
			y += CubeGeometry.HLAFMAXSIZE;
			z += CubeGeometry.HLAFMAXSIZE;
			
			var mainCube:CubeInfo = this.cubeMap.find(x, y, z);
			if (mainCube && mainCube.subCube) {
				console.log("CubeGeometry: this cube has exits.");
				return mainCube.color;
			}
			var POINTS:any[] = CubeGeometry.POINTS;
			for (var i:number = 0; i < 24; i += 3) {
				var pX:number = x + POINTS[i];
				var pY:number = y + POINTS[i + 1];
				var pZ:number = z + POINTS[i + 2];
				var cube:CubeInfo = this.cubeMap.find(pX, pY, pZ);
				
				if (!cube) {
					cube = CubeInfo.create(pX, pY, pZ);
					this.cubeMap.add(pX, pY, pZ, cube);
				}
				cube.point |= 1 << (i / 3);
				if (i === CubeGeometry.CUBEINDEX) {
					cube.x = pX;
					cube.y = pY;
					cube.z = pZ;
					cube.color = color;
					
					var keybox:number = SubCubeGeometry.getKey(pX, pY, pZ);
					var subBox:SubCubeGeometry = this.subBoxMap[keybox];
					if (!subBox) {
						subBox = this.subBoxMap[keybox] = SubCubeGeometry.create(this);
					}
					cube.subCube = cube.updateCube = subBox;
					
					switch (cube.modifyFlag) {
					case CubeInfo.MODIFYE_NONE: 
						cube.modifyIndex = this._modifyCubes.length;
						cube.modifyFlag = CubeInfo.MODIFYE_ADD;
						subBox.cubeCount++;
						this._modifyCubes.push(cube);
						break;
					case CubeInfo.MODIFYE_REMOVE: //已有移除指令修改为添加指令,变更为更新指令
						cube.modifyFlag = CubeInfo.MODIFYE_UPDATE;
						subBox.cubeCount++;
						break;
					case CubeInfo.MODIFYE_ADD://已有添加指令,重复操作,无需变更 
					case CubeInfo.MODIFYE_UPDATE://已有更新指令,无效操作,无需变更 
					case CubeInfo.MODIFYE_UPDATEAO://已有更新AO指令无需操作无需变更
					case CubeInfo.MODIFYE_UPDATEPROPERTY:
						break;
						
					}
				}
			}
			isUpdataAO && this.calOneCubeAO(x, y, z);
			this.cubeSprite3D.CubeNums++;
			//更新AO
			return -1
		}
		
		/**
		 * @private
		 */
		 removeCube(x:number, y:number, z:number, isUpdataAO:boolean = false):number {
			x += CubeGeometry.HLAFMAXSIZE;
			y += CubeGeometry.HLAFMAXSIZE;
			z += CubeGeometry.HLAFMAXSIZE;
			
			var mainCube:CubeInfo = this.cubeMap.find(x, y, z);
			if (!mainCube || !mainCube.subCube) {
				console.log("CubeGeometry: this cube not exits.");
				return -1;
			}
			var oldcolor:number = mainCube.color;
			var POINTS:any[] = CubeGeometry.POINTS;
			for (var i:number = 0; i < 24; i += 3) {
				var pX:number = x + POINTS[i];
				var pY:number = y + POINTS[i + 1];
				var pZ:number = z + POINTS[i + 2];
				
				var cube:CubeInfo = this.cubeMap.find(pX, pY, pZ);
				cube.point &= ~(1 << (i / 3));
				
				if (i === CubeGeometry.CUBEINDEX) {
					var keybox:number = SubCubeGeometry.getKey(pX, pY, pZ);
					var subBox:SubCubeGeometry = this.subBoxMap[keybox];
					
					cube.subCube = null;
					
					switch (cube.modifyFlag) {
					case CubeInfo.MODIFYE_NONE: 
						cube.modifyIndex = this._modifyCubes.length;
						cube.modifyFlag = CubeInfo.MODIFYE_REMOVE;
						subBox.cubeCount--;
						this._modifyCubes.push(cube);
						break;
					case CubeInfo.MODIFYE_ADD://已有添加指令,再移除,变更为空指令并从修改队列中移除
						cube.modifyFlag = CubeInfo.MODIFYE_NONE;
						subBox.cubeCount--;
						
						var lengh:number = this._modifyCubes.length - 1;
						var modifyIndex:number = cube.modifyIndex;
						if (modifyIndex !== lengh) {
							var end:CubeInfo = this._modifyCubes[lengh];
							this._modifyCubes[modifyIndex] = end;
							end.modifyIndex = modifyIndex;
						}
						this._modifyCubes.length--;
						break;
					case CubeInfo.MODIFYE_UPDATE://已有更新指令，变更为删除指令
					case CubeInfo.MODIFYE_UPDATEAO://已有更新AO指令，变更为删除指令
					case CubeInfo.MODIFYE_UPDATEPROPERTY:
						cube.modifyFlag = CubeInfo.MODIFYE_REMOVE;
						subBox.cubeCount--;
						break;
					case CubeInfo.MODIFYE_REMOVE: //重复移除不做任何操作
						break;
					case CubeInfo.MODIFYE_UPDATEAO: 
					}
					
					//TODO:有问题
					//if (subBox.cubeCount === 0) {//无可渲染点时直接回收
						//SubCubeGeometry.recover(subBox);
						//delete subBoxMap[keybox];
					//}
					
				}
			}
			if (isUpdataAO) {
				
				this.calOneCubeAO(x, y, z);
			}
			this.cubeSprite3D.CubeNums--;
			return oldcolor;
		}
		
		/**
		 * @private
		 */
		 updateColor(x:number, y:number, z:number, color:number):number {
			x += CubeGeometry.HLAFMAXSIZE;
			y += CubeGeometry.HLAFMAXSIZE;
			z += CubeGeometry.HLAFMAXSIZE;
			var cube:CubeInfo = this.cubeMap.find(x, y, z);
			if (!cube || !cube.subCube) {
				console.log("CubeGeometry: this cube not exits.");
				return -1;
			}
			var oldcolor:number = cube.color;
			cube.color = color;
			switch (cube.modifyFlag) {
			case CubeInfo.MODIFYE_NONE: 
			case CubeInfo.MODIFYE_UPDATEPROPERTY:
			case CubeInfo.MODIFYE_UPDATEAO://已有更新指令，变更为更换颜色
				cube.modifyIndex = this._modifyCubes.length;
				this._modifyCubes.push(cube);
				cube.modifyFlag = CubeInfo.MODIFYE_UPDATE;
				break;
			case CubeInfo.MODIFYE_ADD://已有添加指令,无需操作
			case CubeInfo.MODIFYE_REMOVE://已有删除指令,无需操作
			case CubeInfo.MODIFYE_UPDATE://已有更新指令,无需操作
				break;
			}
			return oldcolor;
		}
		
		/**
		 * @private
		 */
		 updateAO(cube:CubeInfo):void {
			switch (cube.modifyFlag) {
			case CubeInfo.MODIFYE_NONE: 
				cube.modifyIndex = this._modifyCubes.length;
				this._modifyCubes.push(cube);
				cube.modifyFlag = CubeInfo.MODIFYE_UPDATEAO;
				break;
			case CubeInfo.MODIFYE_ADD://已有添加指令,无需操作
			case CubeInfo.MODIFYE_REMOVE://已有删除指令,无需操作
			case CubeInfo.MODIFYE_UPDATE://已有更新指令,无需操作
				break;
			}
		}
		
		/**
		 * @private 
		 */
		 updataProperty(x:number, y:number, z:number, Property:number):number{
			x += CubeGeometry.HLAFMAXSIZE;
			y += CubeGeometry.HLAFMAXSIZE;
			z += CubeGeometry.HLAFMAXSIZE;
			var cube:CubeInfo = this.cubeMap.find(x, y, z);
			if (!cube || !cube.subCube) {
				console.log("CubeGeometry: this cube not exits.");
				return -1;
			}
			var oldcolor:number = cube.color;
			cube.color = (oldcolor & 0x00ffffff) + (Property << 24);
			switch (cube.modifyFlag) {
				case CubeInfo.MODIFYE_NONE: 
				case CubeInfo.MODIFYE_UPDATEPROPERTY:
					cube.modifyIndex = this._modifyCubes.length;
					this._modifyCubes.push(cube);
					cube.modifyFlag = CubeInfo.MODIFYE_UPDATEPROPERTY;
					break;
				case CubeInfo.MODIFYE_UPDATEAO://已有更新指令，变更为更换颜色
				case CubeInfo.MODIFYE_ADD://已有添加指令,无需操作
				case CubeInfo.MODIFYE_REMOVE://已有删除指令,无需操作
				case CubeInfo.MODIFYE_UPDATE://已有更新指令,无需操作
					break;
			}
			return oldcolor;
			
		}
		
		private calOneCubeAO(x:number, y:number, z:number):void {
			var _x:number = x + 1;
			var _y:number = y + 1;
			var _z:number = z + 1;
			var x_:number = x - 1;
			var y_:number = y - 1;
			var z_:number = z - 1;
			var cube:CubeInfo;
			cube = this.cubeMap.find(x, _y, _z);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(5) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
					cube.frontFaceAO[4] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[1];
					cube.frontFaceAO[5] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[1];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(_x, y, _z);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(5) != -1 || cube.getVBPointbyFaceIndex(3) != -1) {
					cube.frontFaceAO[3] |= CubeInfo.PanduanWei[1] + CubeInfo.PanduanWei[2];
					cube.frontFaceAO[5] |= CubeInfo.PanduanWei[1] + CubeInfo.PanduanWei[2];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(x_, y, _z);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(5) != -1) {
					cube.frontFaceAO[1] |= CubeInfo.PanduanWei[2] + CubeInfo.PanduanWei[3];
					cube.frontFaceAO[5] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[3];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(x, y_, _z);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(5) != -1 || cube.getVBPointbyFaceIndex(2) != -1) {
					cube.frontFaceAO[2] |= CubeInfo.PanduanWei[1] + CubeInfo.PanduanWei[2];
					cube.frontFaceAO[5] |= CubeInfo.PanduanWei[2] + CubeInfo.PanduanWei[3];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(_x, y_, z);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(2) != -1 || cube.getVBPointbyFaceIndex(3) != -1) {
					cube.frontFaceAO[2] |= CubeInfo.PanduanWei[2] + CubeInfo.PanduanWei[3];
					cube.frontFaceAO[3] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[1];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(_x, y, z_);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(3) != -1) {
					cube.frontFaceAO[0] |= CubeInfo.PanduanWei[1] + CubeInfo.PanduanWei[2];
					cube.frontFaceAO[3] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[3];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(_x, _y, z);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(3) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
					cube.frontFaceAO[3] |= CubeInfo.PanduanWei[2] + CubeInfo.PanduanWei[3];
					cube.frontFaceAO[4] |= CubeInfo.PanduanWei[3] + CubeInfo.PanduanWei[0];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(x, _y, z_);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
					cube.frontFaceAO[0] |= CubeInfo.PanduanWei[2] + CubeInfo.PanduanWei[3];
					cube.frontFaceAO[4] |= CubeInfo.PanduanWei[2] + CubeInfo.PanduanWei[3];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(x_, _y, z);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
					cube.frontFaceAO[1] |= CubeInfo.PanduanWei[1] + CubeInfo.PanduanWei[2];
					cube.frontFaceAO[4] |= CubeInfo.PanduanWei[1] + CubeInfo.PanduanWei[2];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(x_, y, z_);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(1) != -1) {
					cube.frontFaceAO[0] |= CubeInfo.PanduanWei[3] + CubeInfo.PanduanWei[0];
					cube.frontFaceAO[1] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[1];
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(x_, y_, z);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(2) != -1) {
					cube.frontFaceAO[1] |= CubeInfo.PanduanWei[3] + CubeInfo.PanduanWei[0];
					cube.frontFaceAO[2] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[1];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(x, y_, z_);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(2) != -1) {
					cube.frontFaceAO[0] |= CubeInfo.PanduanWei[0] + CubeInfo.PanduanWei[1];
					cube.frontFaceAO[2] |= CubeInfo.PanduanWei[3] + CubeInfo.PanduanWei[0];
					
					this.updateAO(cube);
				}
			}
			
			cube = this.cubeMap.find(_x, _y, _z);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(3) != -1 || cube.getVBPointbyFaceIndex(4) != -1 || cube.getVBPointbyFaceIndex(5) != -1) {
					cube.frontFaceAO[3] |= CubeInfo.PanduanWei[2];
					cube.frontFaceAO[4] |= CubeInfo.PanduanWei[0];
					cube.frontFaceAO[5] |= CubeInfo.PanduanWei[1];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(_x, _y, z_);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(3) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
					cube.frontFaceAO[0] |= CubeInfo.PanduanWei[2];
					cube.frontFaceAO[3] |= CubeInfo.PanduanWei[3];
					cube.frontFaceAO[4] |= CubeInfo.PanduanWei[3];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(_x, y_, _z);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(2) != -1 || cube.getVBPointbyFaceIndex(3) != -1 || cube.getVBPointbyFaceIndex(5) != -1) {
					cube.frontFaceAO[2] |= CubeInfo.PanduanWei[2];
					cube.frontFaceAO[3] |= CubeInfo.PanduanWei[1];
					cube.frontFaceAO[5] |= CubeInfo.PanduanWei[2];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(_x, y_, z_);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(3) != -1 || cube.getVBPointbyFaceIndex(2) != -1) {
					cube.frontFaceAO[0] |= CubeInfo.PanduanWei[1];
					cube.frontFaceAO[3] |= CubeInfo.PanduanWei[0];
					cube.frontFaceAO[2] |= CubeInfo.PanduanWei[3];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(x_, _y, _z);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(5) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
					cube.frontFaceAO[1] |= CubeInfo.PanduanWei[2];
					cube.frontFaceAO[5] |= CubeInfo.PanduanWei[0];
					cube.frontFaceAO[4] |= CubeInfo.PanduanWei[1];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(x_, _y, z_);
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(4) != -1) {
					cube.frontFaceAO[0] |= CubeInfo.PanduanWei[3];
					cube.frontFaceAO[1] |= CubeInfo.PanduanWei[1];
					cube.frontFaceAO[4] |= CubeInfo.PanduanWei[2];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(x_, y_, _z)
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(2) != -1 || cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(5) != -1) {
					cube.frontFaceAO[2] |= CubeInfo.PanduanWei[1];
					cube.frontFaceAO[1] |= CubeInfo.PanduanWei[3];
					cube.frontFaceAO[5] |= CubeInfo.PanduanWei[3];
					
					this.updateAO(cube);
				}
			}
			cube = this.cubeMap.find(x_, y_, z_)
			if (cube != null && cube.subCube != null) {
				if (cube.getVBPointbyFaceIndex(0) != -1 || cube.getVBPointbyFaceIndex(1) != -1 || cube.getVBPointbyFaceIndex(2) != -1) {
					cube.frontFaceAO[0] |= CubeInfo.PanduanWei[0];
					cube.frontFaceAO[1] |= CubeInfo.PanduanWei[0];
					cube.frontFaceAO[2] |= CubeInfo.PanduanWei[0];
					
					this.updateAO(cube);
				}
			}
		
		}
		//
		 findCube(x:number, y:number, z:number):number {
			if ((x + CubeGeometry.HLAFMAXSIZE < 0) || (y + CubeGeometry.HLAFMAXSIZE < 0) || (z + CubeGeometry.HLAFMAXSIZE < 0)) {
				return -1;
			}
			var cubeinfo:CubeInfo = this.cubeMap.find(x + CubeGeometry.HLAFMAXSIZE, y + CubeGeometry.HLAFMAXSIZE, z + CubeGeometry.HLAFMAXSIZE);
			if (cubeinfo && cubeinfo.subCube) {
				return cubeinfo.color;
			} else {
				return -1;
			}
		}
		
		 findCubeToCubeInfo(x:number, y:number, z:number):CubeInfo
		{
			if ((x + CubeGeometry.HLAFMAXSIZE < 0) || (y + CubeGeometry.HLAFMAXSIZE < 0) || (z + CubeGeometry.HLAFMAXSIZE < 0))
			{
				return null;
			}
			var cubeinfo:CubeInfo = this.cubeMap.find(x + CubeGeometry.HLAFMAXSIZE, y + CubeGeometry.HLAFMAXSIZE, z + CubeGeometry.HLAFMAXSIZE);
			if (cubeinfo && cubeinfo.subCube) 
			{
				return cubeinfo;
			} 
			else 
			{
				return null;
			}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _getType():number {
			return CubeGeometry._type;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _prepareRender(state:RenderContext3D):boolean {
			if (!this.IsRender)
			{
				return false;
			}
			
			if (this._modifyCubes.length == 0 || !this.enableUpdate)
				return true;
			var end:number = Math.max(this._modifyCubes.length - CubeGeometry.updateCubeCount, 0);
			  
			//var tm:Number = Browser.now();
			//end = 0;
			for (var i:number = this._modifyCubes.length - 1; i >= end; i--)
				this._modifyCubes[i].update();
			this._modifyCubes.length = end;
			
			//trace("---------------------delay:" + (Browser.now() - tm));
			
			return true;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _render(state:RenderContext3D):void {
			for (var key  in this.subBoxMap) {
				var subCube:SubCubeGeometry = (<SubCubeGeometry>this.subBoxMap[key] );
				subCube.updateBuffer();
				(this.cubeSprite3D.enableRender)&&(subCube.render(state));
			}
		}
		
		/**
		 * @private
		 */
		 clear():void {
			this._modifyCubes.length = 0;
			var cubMapData:any = this.cubeMap.data;
			for (var key  in cubMapData) {
				var subData:any[] = cubMapData[key];
				for (var subkey  in subData)
					CubeInfo.recover(subData[subkey]);
				subData.save = null;
			}

			for (key in this.subBoxMap) {
				var subCube:SubCubeGeometry = this.subBoxMap[key];
				//subCube.clear();
				//SubCubeGeometry.recover(subCube);
				subCube.destroy();
			}
			this.cubeMap.clear();
			this.subBoxMap = {};
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  destroy():void {
			super.destroy();
			this.clear();
		}
		
		
		//导出经过优化的lm
		  ExportCubeMeshLm():void
		 {

			 var object:any = new Object();
			 var ss:Uint8Array = new Uint8Array( this.compressData().buffer);
			FileSaver.saveBlob(FileSaver.createBlob([ss],{}), "CubeModel.lm");
			
			
			 
		 }
		
		 
		 
		 	
		 static shareMaterial:BlinnPhongMaterial;
		 static initStaticBlin():void
		{
			CubeGeometry.shareMaterial = new BlinnPhongMaterial();
			CubeGeometry.shareMaterial.enableVertexColor = true;
			CubeGeometry.shareMaterial.albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
			CubeGeometry.shareMaterial.specularColor = new Vector4(0.2, 0.2, 0.2, 1);
		}
		 
		  lmToMeshSprite3D(byte:Byte):MeshSprite3D
		 {
			var subeMeshs:SubMesh[] = [];
			var mesh:Mesh = new Mesh();
			MeshReader.read(byte.buffer, mesh, subeMeshs);
			var sprite:MeshSprite3D = new MeshSprite3D(mesh);
			sprite.meshRenderer.material = CubeGeometry.shareMaterial;
			return sprite;
		 }
		 
		 
		 
		/**
		 * @private 
		 * 类用来组织所有的VBIB并且将同色面合并
		 */
		 compressData():Byte
		{
			 var byteArray:Byte = new Byte();
			
			//顶点位置
			var surfaceVertexPosArray:number[] = [];
			//法线
			var surfaceVertexNolArray:number[] = [];
			//颜色
			var surfaceVertexColArray:number[] = [];
			//索引
			var surfaceVertexIndArray:number[] = [];
			//获得所有的CubeInfo
			var allCubeInfo:CubeInfo[] = this.cubeMap.returnAllCube();
			//遍历所有的Cubeinfo进行合并面
		
			var cubeLength:number = allCubeInfo.length;
			for (var i:number = 0; i < cubeLength; i++) 
			{
				this.calOneCubeSurface(allCubeInfo[i], surfaceVertexPosArray, surfaceVertexNolArray, surfaceVertexColArray);
			}
			//組織Ib
			var maxFaceNums = surfaceVertexPosArray.length / 12;
			surfaceVertexIndArray.length = maxFaceNums * 6;
			for (var i:number = 0; i < maxFaceNums; i++) {
				var indexOffset:number = i * 6;
				var pointOffset:number = i * 4;
				surfaceVertexIndArray[indexOffset] = pointOffset;
				surfaceVertexIndArray[indexOffset + 1] = 2 + pointOffset;
				surfaceVertexIndArray[indexOffset + 2] = 1 + pointOffset;
				surfaceVertexIndArray[indexOffset + 3] = pointOffset;
				surfaceVertexIndArray[indexOffset + 4] = 3 + pointOffset;
				surfaceVertexIndArray[indexOffset + 5] = 2 + pointOffset;
			}
			
			 var stringDatas:string[] = [];
			 stringDatas.push("MESH");
			 stringDatas.push("SUBMESH");
			 //版本号
			 var LmVersion:string = "LAYAMODEL:0400";
			 //顶点描述数据
			 var vbDeclaration:string = "POSITION,NORMAL,COLOR"
			 //VB大小
			 var everyVBSize:number = 12 + 12 + 16;
			  //版本号
			 byteArray.writeUTFString(LmVersion);
			
			 byteArray.pos = 0;
			 console.log(byteArray.readUTFString());
			 var verionsize:number = byteArray.pos;
			 
			 //标记数据信息区
			 var ContentAreaPostion_Start:number = byteArray.pos;//预留数据区偏移地址
			 byteArray.writeUint32(0);
			 byteArray.writeUint32(0);
			 //内容段落信息区
			 var BlockAreaPosition_Start:number = byteArray.pos;//预留段落偏移地址
			 byteArray.writeUint16(2);
			 for (var i:number = 0; i < 2; i++ )
			 {
				byteArray.writeUint32(0);//Uint32 blockStart
				byteArray.writeUint32(0);//Uint32 blockLength
			 }
			 //字符区
			 var StringAreaPosition_Start:number = byteArray.pos;
			 byteArray.writeUint32(0);//Uint32 offset
			 byteArray.writeUint16(0);//count
			 //网格区
			 var MeshAreaPosition_Start:number = byteArray.pos;
			 byteArray.writeUint16(0);//解析函数名字索引
			 stringDatas.push("CubeMesh");
			 byteArray.writeUint16(2);//网格名字索引
			 
			  //vb
			 byteArray.writeUint16(1);//vb数量
			 var VBMeshAreaPosition_Start:number = byteArray.pos;
			 byteArray.writeUint32(0);//vbStart
			 byteArray.writeUint32(0);//vbLength
			 stringDatas.push(vbDeclaration);
			 byteArray.writeUint16(3);
			
			 //ib
			 var IBMeshAreaPosition_Start:number = byteArray.pos;
			 byteArray.writeUint32(0);//ibStart
			 byteArray.writeUint32(0);//ibLength
			 
			 //Bone
			 var BoneAreaPosition_Start:number = byteArray.pos;
			 byteArray.writeUint16(0);//boneCount
			 byteArray.writeUint32(0);//bindPosStart
			 byteArray.writeUint32(0);//bindPosLength
			 byteArray.writeUint32(0);//inverseGlobalBindPoseStart
			 byteArray.writeUint32(0);//inverseGlobalBindPoseLength
			 
			 var MeshAreaPosition_End:number = byteArray.pos;
			 var MeshAreaSize:number = MeshAreaPosition_End - MeshAreaPosition_Start;
			 
			 //子网格区
			 var subMeshAreaPosition_Start:number = byteArray.pos;
			 byteArray.writeUint16(1);//解析函数名字字符索引
			 byteArray.writeUint16(0);//vbIndex
			 byteArray.writeUint32(0);//vbStart
			 byteArray.writeUint32(0);//vbLength
			 
			 byteArray.writeUint32(0);//ibStart
			 byteArray.writeUint32(0);//ibLength
			 
			 byteArray.writeUint16(1);//drawCount
			 
			 byteArray.writeUint32(0);//subIbStart
			 byteArray.writeUint32(0);//subibLength
			 
			 byteArray.writeUint32(0);//boneDicStart
			 byteArray.writeUint32(0);//boneDicLength
			 
			 var subMeshAreaPosition_End:number = byteArray.pos;
			 
			 var subMeshAreaSize:number = subMeshAreaPosition_End - subMeshAreaPosition_Start;
			 
			 //字符数据区
			 var StringDatasAreaPosition_Start:number = byteArray.pos;
			 for (var i:number = 0; i < stringDatas.length; i++)
			 {
				byteArray.writeUTFString(stringDatas[i]);
			 }
			 var StringDatasAreaPosition_End:number = byteArray.pos;
			 var StringDatasAreaSize:number = StringDatasAreaPosition_End - StringDatasAreaPosition_Start;
			 
			 //内容数据区
			 //VB
			 var VBContentDatasAreaPosition_Start:number = byteArray.pos;
			 var VertexCount:number = surfaceVertexPosArray.length / 3;//顶点数量
			 var posIndex:number = 0;
			 var NorIndex:number = 0;
			 var colIndex:number = 0;
			 for (var j:number = 0; j < VertexCount; j++) 
			 {
				 //顶点数据
					byteArray.writeFloat32(surfaceVertexPosArray[posIndex]);
					posIndex++;
					byteArray.writeFloat32(surfaceVertexPosArray[posIndex]);
					posIndex++;
					byteArray.writeFloat32(surfaceVertexPosArray[posIndex]);
					posIndex++;
					byteArray.writeFloat32(surfaceVertexNolArray[NorIndex]);
					NorIndex++;
					byteArray.writeFloat32(surfaceVertexNolArray[NorIndex]);
					NorIndex++;
					byteArray.writeFloat32(surfaceVertexNolArray[NorIndex]);
					NorIndex++;
					byteArray.writeFloat32(surfaceVertexColArray[colIndex]);
					colIndex++;
					byteArray.writeFloat32(surfaceVertexColArray[colIndex]);
					colIndex++;
					byteArray.writeFloat32(surfaceVertexColArray[colIndex]);
					colIndex++;
					byteArray.writeFloat32(surfaceVertexColArray[colIndex]);
					colIndex++;
			 }
			 var VBContentDatasAreaPosition_End:number = byteArray.pos;
			 var VBContentDatasAreaSize:number = VBContentDatasAreaPosition_End - VBContentDatasAreaPosition_Start;
			 
		     //ib
		     var IBContentDatasAreaPosition_Start:number = byteArray.pos;
		     var vertexIndexArrayLength:number = surfaceVertexIndArray.length;
		     for (var j:number = 0; j < vertexIndexArrayLength; j++)
		     {
			        byteArray.writeUint16(surfaceVertexIndArray[j]);
			 }
			 var IBContentDatasAreaPosition_End:number = byteArray.pos;
			 var IBContentDatasAreaSize:number = IBContentDatasAreaPosition_End - IBContentDatasAreaPosition_Start;
			 
			   //倒推子网格区
			  var vbstart:number = 0;
			  var vblength:number = 0;
			  var ibstart:number = 0;
			  var iblength:number = 0;
			  var _ibstart = 0;
			  
			  byteArray.pos = subMeshAreaPosition_Start + 4;
			  vbstart = 0;
			  vblength = VBContentDatasAreaSize / everyVBSize;
			  ibstart = 0;
			  iblength = IBContentDatasAreaSize / 2;
			  
			  byteArray.writeUint32(vbstart);
			  byteArray.writeUint32(vblength);
			  byteArray.writeUint32(ibstart);
			  byteArray.writeUint32(iblength);
			  
			  byteArray.pos += 2;
			  
			  byteArray.writeUint32(ibstart);
			  byteArray.writeUint32(iblength);
			  
			  //倒推网格区
			  byteArray.pos = VBMeshAreaPosition_Start;
			  byteArray.writeUint32(VBContentDatasAreaPosition_Start - StringDatasAreaPosition_Start);
			  byteArray.writeUint32(VBContentDatasAreaSize);
			  
			  byteArray.pos = IBMeshAreaPosition_Start;
			  byteArray.writeUint32(IBContentDatasAreaPosition_Start - StringDatasAreaPosition_Start);
			  byteArray.writeUint32(IBContentDatasAreaSize);
			  
			  //倒推字符区
			  byteArray.pos = StringAreaPosition_Start;
			  byteArray.writeUint32(0);
			  byteArray.writeUint16(stringDatas.length);
			  StringDatasAreaPosition_End = byteArray.pos;
			  
			  //倒推段落区
			  byteArray.pos = BlockAreaPosition_Start + 2;
			  byteArray.writeUint32(MeshAreaPosition_Start);
			  byteArray.writeUint32(MeshAreaSize);
			  
			  byteArray.writeUint32(subMeshAreaPosition_Start);
			  byteArray.writeUint32(subMeshAreaSize);
			  
			  
			  //倒推标记内容数据信息区
			  byteArray.pos = ContentAreaPostion_Start;
			  byteArray.writeUint32(StringDatasAreaPosition_Start);
			  byteArray.writeUint32(StringDatasAreaPosition_Start + StringDatasAreaSize
			  + VBContentDatasAreaSize + IBContentDatasAreaSize + subMeshAreaSize);
			  
			
			  return byteArray;
			  
		}
		
		/**
		 * @private
		 * 此类用来查找一个盒子的面
		 */
		 calOneCubeSurface(cubeinfo:CubeInfo,posArray:number[],nolArray:number[],colArray:number[]):void
		{

			var subcubeGeometry:SubCubeGeometry = cubeinfo.subCube;
			var vertexArray:Float32Array;
			var offset:number;
			var r:number = (cubeinfo.color & 0xff)/255;
			//前面
			if (cubeinfo.frontVBIndex !=-1)
			{
				//添加法线
				nolArray.push(0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0);
				//判断是否有AO
				this.calOneFaceColor(subcubeGeometry, cubeinfo.frontVBIndex, cubeinfo, colArray, posArray,0);
			}
			//右面
			if (cubeinfo.rightVBIndex !=-1)
			{
				nolArray.push(1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
				this.calOneFaceColor(subcubeGeometry, cubeinfo.rightVBIndex, cubeinfo, colArray, posArray,1);
			}
			//上面
			if (cubeinfo.topVBIndex !=-1)
			{
				nolArray.push(0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0);
				this.calOneFaceColor(subcubeGeometry, cubeinfo.topVBIndex, cubeinfo, colArray, posArray,2);
			}
			//左面
			if (cubeinfo.leftVBIndex !=-1)
			{
				nolArray.push( -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0);
				this.calOneFaceColor(subcubeGeometry, cubeinfo.leftVBIndex, cubeinfo, colArray, posArray,3);
			}
			//下面
			if (cubeinfo.downVBIndex !=-1)
			{
				nolArray.push(0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0);
				this.calOneFaceColor(subcubeGeometry, cubeinfo.downVBIndex, cubeinfo, colArray, posArray,4);
			}
			//后面
			if (cubeinfo.backVBIndex !=-1)
			{
				nolArray.push(0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0);
				this.calOneFaceColor(subcubeGeometry, cubeinfo.backVBIndex, cubeinfo, colArray, posArray,5);
			}
			
		}
		 PanDuanFloatXiangDeng(x1:number, x2:number):boolean
		{
			if (Math.abs(x1 - x2) < 0.00001)
			{
				return true
			}
			else
			{
				return false;
			}
			
		}
		//判斷一個面是否有AO,沒有AO返回true
		 existAo(cubeinfo:CubeInfo, VBIndex:number):boolean
		{
			if (VBIndex ==-1)
			{
				return false;
			}
			var subcubeGeometry:SubCubeGeometry = cubeinfo.subCube;
				var r:number = (cubeinfo.color & 0xff)/255;
			var g:number = ((cubeinfo.color & 0xff00) >> 8) / 255;
			var b:number = ((cubeinfo.color & 0xff0000) >> 16) / 255;
			
			var vertexArray:Float32Array;
			var offset:number;
			vertexArray = subcubeGeometry._vertices[VBIndex >> 24];
			offset = VBIndex & 0x00ffffff;
			if (this.PanDuanFloatXiangDeng(vertexArray[offset + 6],r) && this.PanDuanFloatXiangDeng(vertexArray[offset + 16],r) && this.PanDuanFloatXiangDeng(vertexArray[offset + 26],r )&& this.PanDuanFloatXiangDeng(vertexArray[offset + 36],r))
			{
				if(this.PanDuanFloatXiangDeng(vertexArray[offset + 7],g) && this.PanDuanFloatXiangDeng(vertexArray[offset + 17], g) && this.PanDuanFloatXiangDeng(vertexArray[offset + 27], g) && this.PanDuanFloatXiangDeng(vertexArray[offset + 37],g))
				{
					if (this.PanDuanFloatXiangDeng(vertexArray[offset + 8],b) && this.PanDuanFloatXiangDeng(vertexArray[offset + 18], b)&& this.PanDuanFloatXiangDeng(vertexArray[offset + 28],b)&& this.PanDuanFloatXiangDeng(vertexArray[offset + 38],b))
					{
						return true;
					}
				}
			}
			return false;
		}
		/**
		 *@private
		 * 此类用来合并一个面
		 */
		 calOneFaceSurface(cubeinfo:CubeInfo, faceIndex:number,vertexArray:number[]):boolean
		{
			var x:number = cubeinfo.x - 1600;
			var y:number = cubeinfo.y - 1600;
			var z:number = cubeinfo.z - 1600;
			var color:number = cubeinfo.color;
			var othercubeinfo:CubeInfo;
			
			switch(faceIndex)
			{
				case 0:
					//front
					//先左后右，再上下
					var left:number = x;
					var right:number = x;
					var up:number = y;
					var down:number = y;
					//左
					while (true)
					{
						othercubeinfo = this.findCubeToCubeInfo(left-1, y, z);
						if (othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.frontVBIndex))
						{
							left -= 1;
							othercubeinfo.frontVBIndex = -1;
						}
						else
						{
							break;
						}
					}
					//右
					while (true)
					{
						othercubeinfo = this.findCubeToCubeInfo(right + 1, y, z);
						if (othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.frontVBIndex))
						{
							right += 1;
							othercubeinfo.frontVBIndex = -1;
						}
						else
						{
							break;
						}
					}
					//上
					while (true)
					{
						var yipai:boolean = true;
						for (var i:number = left; i <=right; i++) {
							othercubeinfo = this.findCubeToCubeInfo(i, up + 1, z);
							if (!(othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.frontVBIndex)))
							{
								yipai = false;
								break;
							}
							
						}
						//如果這一排能合
						if (yipai)
						{
							for (var i:number = left; i <=right; i++) {
								othercubeinfo = this.findCubeToCubeInfo(i, up + 1, z);
								othercubeinfo.frontVBIndex = -1;
							}
							up += 1;
						}
						else
						{
							break;
						}
					}
					//下
					while (true)
					{
						var yipai:boolean = true;
						for (var i:number = left; i <=right; i++) {
							othercubeinfo = this.findCubeToCubeInfo(i, down - 1, z);
							if (!(othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.frontVBIndex)))
							{
								yipai = false;
								break;
							}
						}
						//如果這一排能合
						if (yipai)
						{
							for (var i:number = left; i <=right; i++) {
								othercubeinfo = this.findCubeToCubeInfo(i, down - 1, z);
								othercubeinfo.frontVBIndex = -1;
							}
							down -= 1;
						}
						else
						{
							break;
						}
					}
					vertexArray.push(right + 1, up + 1, z + 1, left, up + 1, z + 1, left, down, z + 1, right + 1, down, z + 1);
					break;
				case 1:
					
					//right
					var front:number = z;
					var back:number = z;
					var up:number = y;
					var down:number = y;
					//后
					while (true)
					{
						othercubeinfo = this.findCubeToCubeInfo(x, y, back-1);
						if (othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.rightVBIndex))
						{
							back -= 1;
							othercubeinfo.rightVBIndex = -1;
						}
						else
						{
							break;
						}
					}
					//前
					while (true)
					{
						othercubeinfo = this.findCubeToCubeInfo(x, y, front+1);
						if (othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.rightVBIndex))
						{
							front += 1;
							othercubeinfo.rightVBIndex = -1;
						}
						else
						{
							break;
						}
					}
					//上
					while (true)
					{
						var yipai:boolean = true;
						for (var i:number = back; i <=front; i++) {
							othercubeinfo = this.findCubeToCubeInfo(x, up + 1, i);
							if (!(othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.rightVBIndex)))
							{
								yipai = false;
								break;
							}
							
						}
						//如果這一排能合
						if (yipai)
						{
							for (var i:number = back; i <=front; i++) {
								othercubeinfo = this.findCubeToCubeInfo(x, up + 1, i);
								othercubeinfo.rightVBIndex = -1;
							}
							up += 1;
						}
						else
						{
							break;
						}
					}
					//下
					while (true)
					{
						var yipai:boolean = true;
						for (var i:number = back; i <=front; i++) {
							othercubeinfo = this.findCubeToCubeInfo(x, down - 1, i);
							if (!(othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.rightVBIndex)))
							{
								yipai = false;
								break;
							}
						}
						//如果這一排能合
						if (yipai)
						{
							for (var i:number = back; i <=front; i++) {
								othercubeinfo = this.findCubeToCubeInfo(x, down - 1, i);
								othercubeinfo.rightVBIndex = -1;
							}
							down -= 1;
						}
						else
						{
							break;
						}
					}
					vertexArray.push(x + 1, up + 1, front+1,   x+1, down,front+1,   x+1,down,back, x+1,up+1,back);
					break;
				case 2:
					//up
					var front:number = z;
					var back:number = z;
					var left:number = x;
					var right:number = x;	
					//左
					while (true)
					{
						othercubeinfo = this.findCubeToCubeInfo(left-1, y, z);
						if (othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.topVBIndex))
						{
							left -= 1;
							othercubeinfo.topVBIndex = -1;
						}
						else
						{
							break;
						}
					}
					//右
					while (true)
					{
						othercubeinfo = this.findCubeToCubeInfo(right + 1, y, z);
						if (othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.topVBIndex))
						{
							right += 1;
							othercubeinfo.topVBIndex = -1;
						}
						else
						{
							break;
						}
					}
					//前
					while (true)
					{
						var yipai:boolean = true;
						for (var i:number = left; i <=right; i++) {
							othercubeinfo = this.findCubeToCubeInfo(i, y,front+1 );
							if (!(othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.topVBIndex)))
							{
								yipai = false;
								break;
							}
							
						}
						//如果這一排能合
						if (yipai)
						{
							for (var i:number = left; i <=right; i++) {
								othercubeinfo = this.findCubeToCubeInfo(i, y,front+1);
								othercubeinfo.topVBIndex = -1;
							}
							front += 1;
						}
						else
						{
							break;
						}
					}
					//后
					while (true)
					{
						var yipai:boolean = true;
						for (var i:number = left; i <=right; i++) {
							othercubeinfo = this.findCubeToCubeInfo(i, y ,back-1);
							if (!(othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.topVBIndex)))
							{
								yipai = false;
								break;
							}
						}
						//如果這一排能合
						if (yipai)
						{
							for (var i:number = left; i <=right; i++) {
								othercubeinfo = this.findCubeToCubeInfo(i, y, back-1);
								othercubeinfo.topVBIndex = -1;
							}
							back -= 1;
						}
						else
						{
							break;
						}
					}
					vertexArray.push(right+1,y+1,front+1, right+1, y+1,back,   left,y+1,back,  left,y+1,front+1);
					break;
				case 3:
					//left
					var front:number = z;
					var back:number = z;
					var up:number = y;
					var down:number = y;
					//后
					while (true)
					{
						othercubeinfo = this.findCubeToCubeInfo(x, y, back-1);
						if (othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.leftVBIndex))
						{
							back -= 1;
							othercubeinfo.leftVBIndex = -1;
						}
						else
						{
							break;
						}
					}
					//前
					while (true)
					{
						othercubeinfo = this.findCubeToCubeInfo(x, y, front+1);
						if (othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.leftVBIndex))
						{
							front += 1;
							othercubeinfo.leftVBIndex = -1;
						}
						else
						{
							break;
						}
					}
					//上
					while (true)
					{
						var yipai:boolean = true;
						for (var i:number = back; i <=front; i++) {
							othercubeinfo = this.findCubeToCubeInfo(x, up + 1, i);
							if (!(othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.leftVBIndex)))
							{
								yipai = false;
								break;
							}
							
						}
						//如果這一排能合
						if (yipai)
						{
							for (var i:number = back; i <=front; i++) {
								othercubeinfo = this.findCubeToCubeInfo(x, up + 1, i);
								othercubeinfo.leftVBIndex = -1;
							}
							up += 1;
						}
						else
						{
							break;
						}
					}
					//下
					while (true)
					{
						var yipai:boolean = true;
						for (var i:number = back; i <=front; i++) {
							othercubeinfo = this.findCubeToCubeInfo(x, down - 1, i);
							if (!(othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.leftVBIndex)))
							{
								yipai = false;
								break;
							}
						}
						//如果這一排能合
						if (yipai)
						{
							for (var i:number = back; i <=front; i++) {
								othercubeinfo = this.findCubeToCubeInfo(x, down - 1, i);
								othercubeinfo.leftVBIndex = -1;
							}
							down -= 1;
						}
						else
						{
							break;
						}
					}
					vertexArray.push(x, up + 1, front+1,   x, up+1,back,   x,down,back,  x,down,front+1);
					break;
				case 4:
					//down
					var front:number = z;
					var back:number = z;
					var left:number = x;
					var right:number = x;	
					//左
					while (true)
					{
						othercubeinfo = this.findCubeToCubeInfo(left-1, y, z);
						if (othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.downVBIndex))
						{
							left -= 1;
							othercubeinfo.downVBIndex = -1;
						}
						else
						{
							break;
						}
					}
					//右
					while (true)
					{
						othercubeinfo = this.findCubeToCubeInfo(right + 1, y, z);
						if (othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.downVBIndex))
						{
							right += 1;
							othercubeinfo.downVBIndex = -1;
						}
						else
						{
							break;
						}
					}
					//前
					while (true)
					{
						var yipai:boolean = true;
						for (var i:number = left; i <=right; i++) {
							othercubeinfo = this.findCubeToCubeInfo(i, y,front+1 );
							if (!(othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.downVBIndex)))
							{
								yipai = false;
								break;
							}
							
						}
						//如果這一排能合
						if (yipai)
						{
							for (var i:number = left; i <=right; i++) {
								othercubeinfo = this.findCubeToCubeInfo(i, y,front+1);
								othercubeinfo.downVBIndex = -1;
							}
							front += 1;
						}
						else
						{
							break;
						}
					}
					//后
					while (true)
					{
						var yipai:boolean = true;
						for (var i:number = left; i <=right; i++) {
							othercubeinfo = this.findCubeToCubeInfo(i, y ,back-1);
							if (!(othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.downVBIndex)))
							{
								yipai = false;
								break;
							}
						}
						//如果這一排能合
						if (yipai)
						{
							for (var i:number = left; i <=right; i++) {
								othercubeinfo = this.findCubeToCubeInfo(i, y, back-1);
								othercubeinfo.downVBIndex = -1;
							}
							back -= 1;
						}
						else
						{
							break;
						}
					}
					vertexArray.push(left,y,back, right+1,y,back,   right+1,y,front+1,  left,y,front+1);
					break;
				case 5:
					//back
					var left:number = x;
					var right:number = x;
					var up:number = y;
					var down:number = y;
					//左
					while (true)
					{
						othercubeinfo = this.findCubeToCubeInfo(left-1, y, z);
						if (othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.backVBIndex))
						{
							left -= 1;
							othercubeinfo.backVBIndex = -1;
						}
						else
						{
							break;
						}
					}
					//右
					while (true)
					{
						othercubeinfo = this.findCubeToCubeInfo(right + 1, y, z);
						if (othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.backVBIndex))
						{
							right += 1;
							othercubeinfo.backVBIndex = -1;
						}
						else
						{
							break;
						}
					}
					//上
					while (true)
					{
						var yipai:boolean = true;
						for (var i:number = left; i <=right; i++) {
							othercubeinfo = this.findCubeToCubeInfo(i, up + 1, z);
							if (!(othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.backVBIndex)))
							{
								yipai = false;
								break;
							}
							
						}
						//如果這一排能合
						if (yipai)
						{
							for (var i:number = left; i <=right; i++) {
								othercubeinfo = this.findCubeToCubeInfo(i, up + 1, z);
								othercubeinfo.backVBIndex = -1;
							}
							up += 1;
						}
						else
						{
							break;
						}
					}
					//下
					while (true)
					{
						var yipai:boolean = true;
						for (var i:number = left; i <=right; i++) {
							othercubeinfo = this.findCubeToCubeInfo(i, down - 1, z);
							if (!(othercubeinfo&&othercubeinfo.color==color&&this.existAo(othercubeinfo,othercubeinfo.backVBIndex)))
							{
								yipai = false;
								break;
							}
						}
						//如果這一排能合
						if (yipai)
						{
							for (var i:number = left; i <=right; i++) {
								othercubeinfo = this.findCubeToCubeInfo(i, down - 1, z);
								othercubeinfo.backVBIndex = -1;
							}
							down -= 1;
						}
						else
						{
							break;
						}
					}
					vertexArray.push(right+1,down,z,left,down,z,left,up+1,z,right+1,up+1,z);
					break;
			}
			
			
		}
		/**
		 * @private
		 * 此类用来计算一个面的Color
		 */
		 calOneFaceColor(subcubeGeometry:SubCubeGeometry,VBIndex:number,cubeinfo:CubeInfo,colArray:number[],vertexArray:number[],faceIndex:number):void
		{
			
			var vertexArrayss:Float32Array;
			var offset:number;
			vertexArrayss = subcubeGeometry._vertices[VBIndex >> 24];
			offset = VBIndex & 0x00ffffff;
			
			if (this.existAo(cubeinfo,VBIndex))
			{
					//没有AO
					var r:number = (cubeinfo.color & 0xff)/255;
					var g:number = ((cubeinfo.color & 0xff00) >> 8) / 255;
					var b:number = ((cubeinfo.color & 0xff0000) >> 16) / 255;
					colArray.push(r, g, b, 1.0, r, g, b, 1.0, r, g, b, 1.0, r, g, b, 1.0);
					this.calOneFaceSurface(cubeinfo,faceIndex,vertexArray);
			}
			else
			{
					//有AO
					colArray.push(vertexArrayss[offset + 6], vertexArrayss[offset + 7] , vertexArrayss[offset + 8] , 1.0,
							vertexArrayss[offset + 16], vertexArrayss[offset + 17], vertexArrayss[offset + 18], 1.0,
							vertexArrayss[offset + 26], vertexArrayss[offset + 27], vertexArrayss[offset + 28], 1.0,
							vertexArrayss[offset + 36], vertexArrayss[offset + 37], vertexArrayss[offset + 38], 1.0);
					vertexArray.push(vertexArrayss[offset], vertexArrayss[offset + 1] , vertexArrayss[offset + 2],
							vertexArrayss[offset + 10], vertexArrayss[offset + 11], vertexArrayss[offset + 12],
							vertexArrayss[offset + 20], vertexArrayss[offset + 21], vertexArrayss[offset + 22],
							vertexArrayss[offset + 30], vertexArrayss[offset + 31], vertexArrayss[offset + 32]);
							
			}
		}
		
		
	}

	
	
	 ////存储lm文件
		 //public function saveLmfile():Byte
		 //{
	//
			 ////创建二位数组
			 //var byteArray:Byte = new Byte();
			//
			 ////将数据先传入
			 ////顶点位置
			 //var VertexPosArray:Vector.<Number> = _cubeMeshFilter.surfaceVertexPosList;
			 ////法线
			 //var VertexNolArray:Vector.<Number> = _cubeMeshFilter.surfaceVertexNorList;
			 ////颜色
			 //var VertexColArray:Vector.<Number> = _cubeMeshFilter.surfaceVertexColorList;
			 ////索引
			 //var VertexIndxArray:Vector.<int> = cubeMeshFilter.surfaceVertexIndexList;
			 //
			 //var stringDatas:Vector.<String> = new Vector.<String>();
			 //stringDatas.push("MESH");
			 //stringDatas.push("SUBMESH");
			 ////版本号
			 //var LmVersion:String = "LAYAMODEL:0400";
			 ////顶点描述数据
			 //var vbDeclaration:String = "POSITION,NORMAL,COLOR"
			 ////VB大小
			 //var everyVBSize:int = 12 + 12 + 16;
			 //
			 ////版本号
			 //byteArray.writeUTFString(LmVersion);
			 //byteArray.pos = 0;
			 //console.log(byteArray.readUTFString());
			 //var verionsize:int = byteArray.pos;
			 //
			 ////标记数据信息区
			 //var ContentAreaPostion_Start:int = byteArray.pos;//预留数据区偏移地址
			 //byteArray.writeUint32(0);
			 //byteArray.writeUint32(0);
			 //
			 ////内容段落信息区
			 //var BlockAreaPosition_Start:int = byteArray.pos;//预留段落偏移地址
			 //byteArray.writeUint16(2);
			 //for (var i:int = 0; i < 2; i++ )
			 //{
				//byteArray.writeUint32(0);//Uint32 blockStart
				//byteArray.writeUint32(0);//Uint32 blockLength
			 //}
			 //
			 ////字符区
			 //var StringAreaPosition_Start:int = byteArray.pos;
			 //byteArray.writeUint32(0);//Uint32 offset
			 //byteArray.writeUint16(0);//count
			 //
			 ////网格区
			 //var MeshAreaPosition_Start:int = byteArray.pos;
			 //byteArray.writeUint16(0);//解析函数名字索引
			 //stringDatas.push("CubeMesh");
			 //byteArray.writeUint16(2);//网格名字索引
			 //
			 ////vb
			 //byteArray.writeUint16(1);//vb数量
			 //var VBMeshAreaPosition_Start:int = byteArray.pos;
			 //byteArray.writeUint32(0);//vbStart
			 //byteArray.writeUint32(0);//vbLength
			 //stringDatas.push(vbDeclaration);
			 //byteArray.writeUint16(3);
			 //
			 ////ib
			 //var IBMeshAreaPosition_Start:int = byteArray.pos;
			 //byteArray.writeUint32(0);//ibStart
			 //byteArray.writeUint32(0);//ibLength
			 //
			 ////Bone
			 //var BoneAreaPosition_Start:int = byteArray.pos;
			 //byteArray.writeUint16(0);//boneCount
			 //byteArray.writeUint32(0);//bindPosStart
			 //byteArray.writeUint32(0);//bindPosLength
			 //byteArray.writeUint32(0);//inverseGlobalBindPoseStart
			 //byteArray.writeUint32(0);//inverseGlobalBindPoseLength
			 //
			 //var MeshAreaPosition_End:int = byteArray.pos;
			 //var MeshAreaSize:int = MeshAreaPosition_End - MeshAreaPosition_Start;
			 //
			 ////子网格区
			 //var subMeshAreaPosition_Start:int = byteArray.pos;
			 //byteArray.writeUint16(1);//解析函数名字字符索引
			 //byteArray.writeUint16(0);//vbIndex
			 //byteArray.writeUint32(0);//vbStart
			 //byteArray.writeUint32(0);//vbLength
			 //
			 //byteArray.writeUint32(0);//ibStart
			 //byteArray.writeUint32(0);//ibLength
			 //
			 //byteArray.writeUint16(1);//drawCount
			 //
			 //byteArray.writeUint32(0);//subIbStart
			 //byteArray.writeUint32(0);//subibLength
			 //
			 //byteArray.writeUint32(0);//boneDicStart
			 //byteArray.writeUint32(0);//boneDicLength
			 //
			 //var subMeshAreaPosition_End:int = byteArray.pos;
			 //
			 //var subMeshAreaSize:int = subMeshAreaPosition_End - subMeshAreaPosition_Start;
			 //
			 ////字符数据区
			 //var StringDatasAreaPosition_Start:int = byteArray.pos;
			 //for (var i:int = 0; i < stringDatas.length; i++)
			 //{
				//byteArray.writeUTFString(stringDatas[i]);
			 //}
			 //var StringDatasAreaPosition_End:int = byteArray.pos;
			 //var StringDatasAreaSize:int = StringDatasAreaPosition_End - StringDatasAreaPosition_Start;
			 //
			 ////内容数据区
			 ////VB
			 //var VBContentDatasAreaPosition_Start:int = byteArray.pos;
			 //var VertexCount:int = VertexPosArray.length / 3;//顶点数量
			 //var posIndex:int = 0;
			 //var NorIndex:int = 0;
			 //var colIndex:int = 0;
			 //for (var j:int = 0; j < VertexCount; j++) 
			 //{
				 ////顶点数据
					//byteArray.writeFloat32(VertexPosArray[posIndex]);
					//posIndex++;
					//byteArray.writeFloat32(VertexPosArray[posIndex]);
					//posIndex++;
					//byteArray.writeFloat32(VertexPosArray[posIndex]);
					//posIndex++;
					//byteArray.writeFloat32(VertexNolArray[NorIndex]);
					//NorIndex++;
					//byteArray.writeFloat32(VertexNolArray[NorIndex]);
					//NorIndex++;
					//byteArray.writeFloat32(VertexNolArray[NorIndex]);
					//NorIndex++;
					//byteArray.writeFloat32(VertexColArray[colIndex]);
					//colIndex++;
					//byteArray.writeFloat32(VertexColArray[colIndex]);
					//colIndex++;
					//byteArray.writeFloat32(VertexColArray[colIndex]);
					//colIndex++;
					//byteArray.writeFloat32(VertexColArray[colIndex]);
					//colIndex++;
			 //}
			  //var VBContentDatasAreaPosition_End:int = byteArray.pos;
			  //var VBContentDatasAreaSize:int = VBContentDatasAreaPosition_End - VBContentDatasAreaPosition_Start;
			  //
			  ////ib
			  //var IBContentDatasAreaPosition_Start:int = byteArray.pos;
			  //var vertexIndexArrayLength:int = VertexIndxArray.length;
			  //for (var j:int = 0; j < vertexIndexArrayLength; j++)
			  //{
				//byteArray.writeUint16(VertexIndxArray[j]);
			  //}
			  //var IBContentDatasAreaPosition_End:int = byteArray.pos;
			  //var IBContentDatasAreaSize:int = IBContentDatasAreaPosition_End - IBContentDatasAreaPosition_Start;
			  //
			  ////倒推子网格区
			  //var vbstart:int = 0;
			  //var vblength:int = 0;
			  //var ibstart:int = 0;
			  //var iblength:int = 0;
			  //var _ibstart = 0;
			  //
			  //byteArray.pos = subMeshAreaPosition_Start + 4;
			  //vbstart = 0;
			  //vblength = VBContentDatasAreaSize / everyVBSize;
			  //ibstart = 0;
			  //iblength = IBContentDatasAreaSize / 2;
			  //
			  //byteArray.writeUint32(vbstart);
			  //byteArray.writeUint32(vblength);
			  //byteArray.writeUint32(ibstart);
			  //byteArray.writeUint32(iblength);
			  //
			  //byteArray.pos += 2;
			  //
			  //byteArray.writeUint32(ibstart);
			  //byteArray.writeUint32(iblength);
			  //
			  ////倒推网格区
			  //byteArray.pos = VBMeshAreaPosition_Start;
			  //byteArray.writeUint32(VBContentDatasAreaPosition_Start - StringDatasAreaPosition_Start);
			  //byteArray.writeUint32(VBContentDatasAreaSize);
			  //
			  //byteArray.pos = IBMeshAreaPosition_Start;
			  //byteArray.writeUint32(IBContentDatasAreaPosition_Start - StringDatasAreaPosition_Start);
			  //byteArray.writeUint32(IBContentDatasAreaSize);
			  //
			  ////倒推字符区
			  //byteArray.pos = StringAreaPosition_Start;
			  //byteArray.writeUint32(0);
			  //byteArray.writeUint16(stringDatas.length);
			  //StringDatasAreaPosition_End = byteArray.pos;
			  //
			  ////倒推段落区
			  //byteArray.pos = BlockAreaPosition_Start + 2;
			  //byteArray.writeUint32(MeshAreaPosition_Start);
			  //byteArray.writeUint32(MeshAreaSize);
			  //
			  //byteArray.writeUint32(subMeshAreaPosition_Start);
			  //byteArray.writeUint32(subMeshAreaSize);
			  //
			  //
			  ////倒推标记内容数据信息区
			  //byteArray.pos = ContentAreaPostion_Start;
			  //byteArray.writeUint32(StringDatasAreaPosition_Start);
			  //byteArray.writeUint32(StringDatasAreaPosition_Start + StringDatasAreaSize
			  //+ VBContentDatasAreaSize + IBContentDatasAreaSize + subMeshAreaSize);
			  //
			//
			  //return byteArray;
		 //}

