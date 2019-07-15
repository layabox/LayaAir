import { Quaternion } from "laya/d3/math/Quaternion"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Pool } from "laya/utils/Pool"

	/**
	 * ...
	 * @author ...
	 */
	export class CubeInfoArray {
		
		//0是默认
		 static Add:number = 1;
		 static Delete:number = 2;
		 static Updata:number = 3;
		
		 currentPosindex:number = 0;
		 PositionArray:number[] = [];
		 currentColorindex:number = 0;
		 colorArray:number[] = [];
		
		 Layar:number = 0;
		
		 dx:number;
		 dy:number;
		 dz:number;
		
		 sizex:number = 0;
		 sizey:number = 0;
		 sizez:number = 0;
		
		 complete:Function;
		
		 operation:number = 0;
		
		 clear():void
		{
			this.PositionArray.length = 0;
			this.colorArray.length = 0;
			this.currentColorindex = this.currentPosindex = 0;
			this.dx = this.dy = this.dz = 0;
		}
		
		constructor(){
			
		}
		
		 static create():CubeInfoArray
		{
			var rs:CubeInfoArray= Pool.getItem("CubeInfoArray");
			return rs||new CubeInfoArray();
		}

		 dispose():void
		{
			this.clear();
			//listObject={};
			Pool.recover("CubeInfoArray",this);
		}
		
		 static recover(cubeinfoArray:CubeInfoArray):void{
			
		}

		 append(x:number,y:number,z:number,color:number):void{
			this.PositionArray.push(x,y,z);
			this.colorArray.push(color);
			this.listObject[x+","+y+","+z]=color;
		}

		 find(x:number,y:number,z:number):number
		{
			return this.listObject[x+","+y+","+z]||-1;
		}

		 removefind():void{
			this.listObject={};
		}





		private listObject:any = {};
		private _rotation:Quaternion;
		private _v3:Vector3;
		 maxminXYZ:Int32Array;
		
		private midx:number;
		private midy:number;
		private midz:number;
		
		 setToCube(x:number, y:number, z:number, color:number):void
		{
			this.PositionArray.push(x, y, z);
			this.colorArray.push(color);
			if (this.maxminXYZ[0] < x) this.maxminXYZ[0] = x;
			if (this.maxminXYZ[1] > x) this.maxminXYZ[1] = x;
			if (this.maxminXYZ[2] < y) this.maxminXYZ[2] = y;
			if (this.maxminXYZ[3] > y) this.maxminXYZ[3] = y;
			if (this.maxminXYZ[4] < z) this.maxminXYZ[4] = z;
			if (this.maxminXYZ[5] > z) this.maxminXYZ[5] = z;
		}
		
		 calMidxyz():void
		{
			this.midx = 0|((this.maxminXYZ[0] - this.maxminXYZ[1]) / 2+ this.maxminXYZ[1]);
			this.midy =0| ((this.maxminXYZ[2] - this.maxminXYZ[3]) / 2 + this.maxminXYZ[3]);
			this.midz =0| ((this.maxminXYZ[4] - this.maxminXYZ[5]) / 2 + this.maxminXYZ[5]);
		}
		
		
		 rotation(x:number =0, y:number =0, z:number =0):void
		{
			if(!x && !y && !z)
				return;
			this._rotation = this._rotation || new Quaternion();
			this._v3 = this._v3 || new Vector3();
			if (x != 0)
				x = x / 180 * Math.PI;
			if (y != 0)
				y = y / 180 * Math.PI;
			if (z != 0)
				z = z / 180 * Math.PI;
				
			var positionArray:number[] = this.PositionArray;
			var i:number, l:number = positionArray.length;
			
			Quaternion.createFromYawPitchRoll(y,x,z,this._rotation);
			for (i = 0; i < l; i += 3)
			{
				
				this._v3.setValue(positionArray[i]-this.midx, positionArray[i + 1]-this.midy, positionArray[i + 2]-this.midz);
				Vector3.transformQuat(this._v3, this._rotation, this._v3);
				positionArray[i] = Math.round(this._v3.x+this.midx);
				positionArray[i + 1] = Math.round(this._v3.y+this.midy);
				positionArray[i + 2] = Math.round(this._v3.z+this.midz);
			}
		}
		
		 scale(x:number = 1, y:number = 1, z:number = 1):void
		{
			console.time("scale");
			var newPositionArray:number[] =[];
			var newColorArray:number[] =[];
			var positionArray:number[] = this.PositionArray;
			newPositionArray.length = positionArray.length * x * y * z;
			newColorArray.length = this.colorArray.length * x * y * z;
			var i:number, l:number = this.colorArray.length;
			var j:number, p:number, g:number;
			var flag:number = 0;
			for (i = 0; i < l; i++)
			{
				//_v3.setValue(positionArray[i]-midx, positionArray[i + 1]-midy, positionArray[i + 2]-midz);
				//Vector3.transformQuat(_v3, _rotation, _v3);
				//positionArray[i] = Math.round(_v3.x+midx);
				//positionArray[i + 1] = Math.round(_v3.y+midy);
				//positionArray[i + 2] = Math.round(_v3.z+midz);
				var rx:number = positionArray[i*3];
				rx = rx + (rx - this.midx) * (x - 1);
				var ry:number = positionArray[i*3 + 1];
				ry = ry + (ry - this.midy) * (y - 1);
				var rz:number = positionArray[i*3 + 2];
				rz = rz + (rz - this.midz) * (z - 1);
				
				var ncolor:number = this.colorArray[i];
				for ( j = 0; j < x; j++)
				{
					for ( p = 0; p < y; p++)
					{
						for ( g = 0; g < z; g++)
						{
							//newPositionArray.push(rx + j, ry + p, rz + g);
							
							newPositionArray[flag*3] = rx + j;
							newPositionArray[flag*3+1] = ry + p;
							newPositionArray[flag*3+2] = rz + g;
							//
							newColorArray[flag++] = ncolor;
							//newColorArray.push(ncolor);
						}
					}
				}	
			}
			this.colorArray = newColorArray;
			this.PositionArray = newPositionArray;
			console.timeEnd("scale");
			
		}
		
	}


