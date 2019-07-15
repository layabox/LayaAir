import { CubeInfo } from "./CubeInfo";
import { Vector3 } from "laya/d3/math/Vector3"
	import { CubeInfoArray } from "../worldMaker/CubeInfoArray"

	
	/**
	 * <code>XYZMap</code> 类用于实现快速查找Map。
	 */
	export class CubeMap {
		  static SIZE:number = 3201;
		 static CUBESIZE:number = 32;
		 static CUBENUMS:number = 100;

		
		 data:any = {};
		 length:number;

		//保存数组
		private _fenKuaiArray:any[] = [];
		 xMax:number = 0;
		 xMin:number = 0;
		 yMax:number = 0;
		 yMin:number = 0;
		 zMax:number = 0;
		 zMin:number = 0;
		constructor(){
			this.clear();
		}
		
	
		 add(x:number, y:number, z:number, value:any):void {
			//data[y][x * SIZE + z] = value; return;
			//(data[y] || (data[y]=[]))[x * SIZE + z] = value;return;
			//32x32
			
			var key:number = (x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16);
			//var key:int = (x >> 5) + (y << 3) + (z << 11);
			var o:any= this.data[key] || (this.data[key] = {});
			o[x % 32 + ((y % 32) << 8) + ((z % 32) << 16)] = value;
			o.save = null;
			this.length++;
		}
		
		 check32(x:number, y:number, z:number):any
		{
			var key:number = (x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16);
			//var key:int = (x >> 5) + (y << 3) + (z << 11);
			var o:any= this.data[key] || (this.data[key] = {});
			o.save = null;
		}
		
		
		 add2(x:number, y:number, z:number, value:any):void {
			//var key:int = (x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16);
			this.data[(x >> 5) + (y << 3) + (z << 11)][x % 32 + ((y % 32) << 8) + ((z % 32) << 16)] = value;
		}
		
		
		 find(x:number, y:number, z:number):any 
		{
			//return (y >= SIZE)?null:data[y][x * SIZE + z];
			//return (y >= SIZE || !data[y])?null:data[y][x * SIZE + z];
			//32x32
			var key:number = (x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16);
			var o:any= this.data[key];
			return o?o[x % 32 + ((y % 32) << 8) + ((z % 32) << 16)]:null;
		}
		
		
		 remove(x:number, y:number, z:number):void {
			//(y >= SIZE) || (data[y][x * SIZE + z] = null);
			
			//32x32
	
			//if (y)
			//var CubeKey:int = (x / CUBESIZE | 0) + ((y / CUBESIZE | 0) << 8) + ((z / CUBESIZE | 0)<<16);
			var key:number = (x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16);
			var o:any= this.data[key];
			if (o)
			{
				var key:number = x % 32 + ((y % 32) << 8) + ((z % 32) << 16);
				if (o[key])
				{
					o[key] = null;
					o.save = null;
				}
			}
			this.length--;
		}
		
		 clear():void {
			
			//for (var i:int = 0; i < 3200; i++) data[i] = []; return;
			
			//32x32
			for (var i  in this.data) {
				this.data[i] = {};
			}
			this.length = 0;

		}
		
		 saveData():any[]
		{
			this._fenKuaiArray = [];			
			var cubeinfo:CubeInfo;
			var sz:number, n:number, n2:number;
			var n:number = 0;
						for (var i  in this.data) {
							n++;
						}
						console.log('n=', n);
			for (var i  in this.data) {
				var o32:any= this.data[i];
				var o32save:any[]=o32.save;
				if (!o32save)
				{
					o32save=o32.save = [];
					for (var j  in o32)
					{
						cubeinfo = ((<CubeInfo>o32[j] ));
						if(cubeinfo&&cubeinfo.subCube!=null)
							o32.save.push(cubeinfo.x,cubeinfo.y,cubeinfo.z,cubeinfo.color);
					}
				}
				o32save.length>0 && this._fenKuaiArray.push( o32save.concat() );
			}
			return this._fenKuaiArray;
		}
		
		 returnData():any[]
		{
			//32x32
			var Returnarray:any[] = [];
			var array:any[];
			var cubeinfo:CubeInfo;
			for (var i  in this.data) 
			{
				array = this.data[i];
				if (array)
				{
					var sv:any[]=[];
					for (var j  in array) {
						cubeinfo = ((<CubeInfo>array[j] ))
						if(cubeinfo&&cubeinfo.subCube!=null)
						sv.push(cubeinfo.x,cubeinfo.y,cubeinfo.z,cubeinfo.color);
					}
					Returnarray.push(sv);
				}				
			}
			return Returnarray;
		}
		
		 returnAllCube():CubeInfo[]
		{
	
			var cubeinfos:CubeInfo[] = [];
			var cubeinfoo:CubeInfo;
			var array:any[];
			for (var i  in this.data) 
			{
				array = this.data[i];
				if (array)
				{
					for (var j  in array) {
						cubeinfoo = ((<CubeInfo>array[j] ))
						if(cubeinfoo&&cubeinfoo.subCube!=null)
						{
							if (!(cubeinfoo.backVBIndex ==-1 && cubeinfoo.frontVBIndex ==-1 && cubeinfoo.topVBIndex ==-1 && cubeinfoo.downVBIndex ==-1 && cubeinfoo.leftVBIndex ==-1 && cubeinfoo.rightVBIndex ==-1))
							{
								
								cubeinfos.push(cubeinfoo);
							}
						}
					}
				}				
			}
			return cubeinfos;
		}
		
		
		 checkColor(colorNum:number):boolean
		{
			var colorobject:any = {};
			var nums:number = 0;
			var cubeinfoo:CubeInfo;
			var array:any[];
			for (var i  in this.data) 
			{
				array = this.data[i];
				if (array)
				{
					for (var j  in array) {
						cubeinfoo = ((<CubeInfo>array[j] ))
						if(cubeinfoo&&cubeinfoo.subCube!=null)
						{
							if (!(cubeinfoo.backVBIndex ==-1 && cubeinfoo.frontVBIndex ==-1 && cubeinfoo.topVBIndex ==-1 && cubeinfoo.downVBIndex ==-1 && cubeinfoo.leftVBIndex ==-1 && cubeinfoo.rightVBIndex ==-1))
							{
								if (!colorobject[cubeinfoo.color])
								{
									//如果没有颜色key
									colorobject[cubeinfoo.color] = 1;
									nums++;
									if (nums > colorNum)
									{
										return true;
									}
								}
							}
						}
					}
				}				
			}
			return false;
		}
		
		 modolCenter():Vector3
		{
			
			var cubeinfoo:CubeInfo;
			var xmax:number = -9999;
			var xmin:number = 9999;
			var ymax:number = -9999;
			var ymin:number = 9999;
			var zmax:number = -9999;
			var zmin:number = 9999;
			
			var array:any[];
			for (var i  in this.data) 
			{
				array = this.data[i];
				if (array)
				{
					for (var j  in array) {
						cubeinfoo = ((<CubeInfo>array[j] ))
						if(cubeinfoo&&cubeinfoo.subCube!=null)
						{
							if (cubeinfoo.x > xmax)
							{
								xmax = cubeinfoo.x;
							}
							else
							{
								xmin = Math.min(xmin, cubeinfoo.x);
							}
							if (cubeinfoo.y > ymax)
							{
								ymax = cubeinfoo.y;
							}
							else
							{
								ymin = Math.min(ymin, cubeinfoo.y);
							}
							
							if (cubeinfoo.z > zmax)
							{
								zmax = cubeinfoo.z;
							}
							else
							{
								zmin = Math.min(zmin, cubeinfoo.z);
							}
						}
					}
					
				}				
			}
			this.xMax = xmax-1600;
			this.xMin = xmin-1600;
			this.yMax = ymax-1600;
			this.yMin = ymin-1600;
			this.zMax = zmax-1600;
			this.zMin = zmin-1600;
			this.cubeinfos = new Vector3((xmax + xmin) / 2-1600, (ymax + ymin) / 2-1600, (zmax + zmin) / 2-1600);
			return this.cubeinfos;
		}
		
		/*
		public function returnData():Array
		{
			//var Returnarray:Array = new Array();
			//var array:Array;
			//var cubeinfo:CubeInfo;
			//for (var i:int = MinHight; i <=MaxHight; i++) {
				//array = data[i];
				//if (array)
				//{
					//for (var key:String in array) 
					//{
						//cubeinfo = ( array[key] as CubeInfo);
						//if(cubeinfo&&cubeinfo.subCube!=null)
						//Returnarray.push(cubeinfo.x,cubeinfo.y,cubeinfo.z,cubeinfo.color);
					//}
				//}
			//}
			//return Returnarray;
			
			//32x32
			var Returnarray:Array = new Array();
			var array:Array;
			var cubeinfo:CubeInfo;
			for (var i:String in data) 
			{
				array = data[i];
				if (array)
				{
					for (var j:String in array) {
						cubeinfo = (array[j] as CubeInfo)
						if(cubeinfo&&cubeinfo.subCube!=null)
						Returnarray.push(cubeinfo.x,cubeinfo.y,cubeinfo.z,cubeinfo.color);
					}
				}
			}
			return Returnarray;
		}		
		
		public function returnCubeInfo():Vector.<CubeInfo>
		{
			//var Returnarray:Vector.<CubeInfo> = new Vector.<CubeInfo>();
			//var array:Array;
			//var cubeinfo:CubeInfo;
			//for (var i:int = MinHight; i <=MaxHight; i++) {
				//array = data[i];
				//if (array)
				//{
					//for (var key:String in array) 
					//{
						//cubeinfo = ( array[key] as CubeInfo);
						//if(cubeinfo&&cubeinfo.subCube!=null)
						//Returnarray.push(cubeinfo);
					//}
				//}
			//}
			//return Returnarray;
			
			
			//32x32
			var Returnarray:Vector.<CubeInfo> = new Vector.<CubeInfo>();
			var array:Array;
			var cubeinfo:CubeInfo;
			for (var i:String in data) 
			{
				array = data[i];
				if (array)
				{
					for (var j:String in array) {
						cubeinfo = (array[j] as CubeInfo)
						if(cubeinfo&&cubeinfo.subCube!=null)
						Returnarray.push(cubeinfo);
					}
				}
			}
			return Returnarray;
		}
		*/
	}


