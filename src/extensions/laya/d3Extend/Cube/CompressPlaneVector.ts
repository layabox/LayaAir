import { Color } from "laya/d3/math/Color"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { VoxFileData } from "../vox/VoxFileData"
	import { CompressPlane } from "./CompressPlane"
	import { PlaneInfo } from "./PlaneInfo"
	export class CompressPlaneVector {
		/**
		 * face 表示立体空间的六个朝向 front back up down left right(012345)
		 */
		 face:number;
		 vecCompressPlane:CompressPlane[];
		 vecLength:number = 0;
		
		constructor(){
			this.face = 0;
			this.vecCompressPlane = [];
		}
		/**
		 * 
		 * @param	thirdP 是第三分量(xyz其一)，取决于face，
		 * @param	planeInfo(中包含两个分量xyz其二)
		 */
		 addPlaneInfo(thirdP:number,planeInfo:PlaneInfo):void {
		
			var planeInfoP1:number = planeInfo.p1;
			var planeInfoP2:number = planeInfo.p2;
			var thirdP = thirdP;
			
			var objP1:any = this.getCompressAxis(planeInfoP1);
			var objP2:any = this.getCompressAxis(planeInfoP2);
			var objP3:any = this.getCompressAxis(thirdP);
			var p1Result = objP1.result;
			var p2Result = objP2.result;
			var p3Result = objP3.result;
			var p1Remainder = objP1.remainder;
			var p2Remainder = objP2.remainder;
			var p3Remainder = objP3.remainder;
			planeInfo.setP12(p1Remainder, p2Remainder)
			
			var p1:number = 0; 
			var p2:number = 0;
			var p3:number = 0;
			if (this.face == 0 || this.face == 1) {
				p1 = p1Result;
				p2 = p2Result;
				p3 = p3Result;
			}
			else if (this.face == 2 || this.face == 3) {
				p1 = p1Result;
				p2 = p3Result;
				p3 = p2Result;
			}
			else {
				p1 = p3Result;
				p2 = p1Result;
				p3 = p2Result;
			}	
			//用CompressPlane的xyz组合key标记唯一的CompressPlane
			var key:string = p1 + "," + p2 + "," + p3;
			
			if (this.vecCompressPlane[key] == null ) {
				var compressPlane:CompressPlane = new CompressPlane(p1, p2, p3);
				this.vecCompressPlane[key] = compressPlane;
				this.vecLength += 1;
				compressPlane.vecPlaneInfo.push(planeInfo);
			}
			else {
				this.vecCompressPlane[key].vecPlaneInfo.push(planeInfo);
			}
		}
		
		private getCompressAxis(axis:number):any {
			var obj:any = new Object();
			if (axis < 0) {
				axis = -axis;
				var result:number = axis >> 4;
				var remainder:number = -(axis - result * 16);
				result = -result;
				obj.result = result;
				obj.remainder = remainder;
			}
			else {
				var result:number = axis >> 4;
				var remainder:number = axis - result * 16;
				obj.result = result;
				obj.remainder = remainder;
			}
			return obj;	
		}
		
		 getVertexVector():number[] {
			var resultVec:number[] = [];
			for (var compressPlane in this.vecCompressPlane) {
				var comPlaneVec:CompressPlane = this.vecCompressPlane[compressPlane];
				var startX:number = comPlaneVec.startX * 16;
				var startY:number = comPlaneVec.startY * 16;
				var startZ:number = comPlaneVec.startZ * 16;
				var vecPlaneInfo:PlaneInfo[] = comPlaneVec.vecPlaneInfo;
				for (var planeIndex in vecPlaneInfo) {
					var plane:PlaneInfo = vecPlaneInfo[planeIndex];
					var color:number = plane.colorIndex;
					if (this.face == 0 || this.face == 1) {
						var point1X:number = startX + plane.p1;
						var point1Y:number = startY + plane.p2;
						resultVec.push(point1X);
						resultVec.push(point1Y);
						resultVec.push(startZ);
						resultVec.push(color);
						var point2X:number = point1X + plane.width;
						var point2Y:number = point1Y;
						resultVec.push(point2X);
						resultVec.push(point2Y);
						resultVec.push(startZ);
						resultVec.push(color);
						var point3X:number = point2X;
						var point3Y:number = point2Y + plane.height;
						resultVec.push(point3X);
						resultVec.push(point3Y);
						resultVec.push(startZ);
						resultVec.push(color);
						var point4X:number = point1X;
						var point4Y:number = point3Y;
						resultVec.push(point4X);
						resultVec.push(point4Y);
						resultVec.push(startZ);
						resultVec.push(color);
					}
					else if (this.face == 2 || this.face == 3) {
						var point1X:number = startX + plane.p1;
						var point1Z:number = startZ + plane.p2;
						resultVec.push(point1X);
						resultVec.push(startY);
						resultVec.push(point1Z);
						resultVec.push(color);
						var point2X:number = point1X;
						var point2Z:number = point1Z + plane.width;
						resultVec.push(point2X);
						resultVec.push(startY);
						resultVec.push(point2Z);
						resultVec.push(color);
						var point3X:number = point2X + plane.height;
						var point3Z:number = point2Z;
						resultVec.push(point3X);
						resultVec.push(startY);
						resultVec.push(point3Z);
						resultVec.push(color);
						var point4X:number = point3X;
						var point4Z:number = point1Z;
						resultVec.push(point4X);
						resultVec.push(startY);
						resultVec.push(point4Z);
						resultVec.push(color);
					}
					else if (this.face == 4 || this.face == 5) {
						var point1Y:number = startY + plane.p1; 
						var point1Z:number = startZ + plane.p2; 
						resultVec.push(point1Y);
						resultVec.push(point1Z);
						resultVec.push(startX);
						resultVec.push(color);
						var point2Y:number = point1Y; 
						var point2Z:number = point1Z + plane.width; 
						resultVec.push(point2Y);
						resultVec.push(point2Z);
						resultVec.push(startX);
						resultVec.push(color);
						var point3Y:number = point2Y + plane.height; 
						var point3Z:number = point2Z; 
						resultVec.push(point3Y);
						resultVec.push(point3Z);
						resultVec.push(startX);
						resultVec.push(color);
						var point4Y:number = point3Y; 
						var point4Z:number = point1Z; 
						resultVec.push(point4Y);
						resultVec.push(point4Z);
						resultVec.push(startX);
						resultVec.push(color);
					}
				}
			}
			
			return resultVec;
		}
		
	}

