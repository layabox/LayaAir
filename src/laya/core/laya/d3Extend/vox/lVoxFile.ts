import { CubeMeshSprite3D } from "./CubeMeshSprite3D";
import { CubeMap } from "./../Cube/CubeMap";
import { VoxelFmt2 } from "././VoxelFmt2";
import { Laya } from "Laya";
import { VoxDataCompress } from "././VoxDataCompress";
import { CubeSprite3D } from "../Cube/CubeSprite3D"
	import { Color } from "laya/d3/math/Color"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { FileSaver } from "../FileSaver"
	import { CubeInfoArray } from "../worldMaker/CubeInfoArray"
	import { Loader } from "laya/net/Loader"
	import { Byte } from "laya/utils/Byte"
	import { Handler } from "laya/utils/Handler"
	
	/**
	 * <code>lVoxFile</code> 类用于读取lVox文件
	 */
	/**
	 * ...
	 * @author ...
	 */
	//***********lvox格式*********************
	//version："LayaBoxVox001"
	//byte[13] = string("LayaBoxVox001");
	//byte[4] = int32();//所有的CubeInfo的数量
	////内容区
	//for(num)
	//{
	//byte[4] = int32 = x
	//byte[4] = int32 = y;
	//byte[4] = int32 = z;
	//byte[2] = int16 = index;
	//}
	//****************************************
	export class lVoxFile
	{
		private static Version:string = "LayaBoxVox001";
		 static cubeInfoArray:CubeInfoArray ;
		 static ZEROPOS:number = 1600;
		
		private sizeX:number = 0;
		private sizeY:number = 0;
		private sizeZ:number = 0;
		
		constructor(){
		
		}
		
		//导出为lvox格式
		 static ExportlvoxFile(cubeMeshManager:CubeSprite3D):void
		{
			var object:any = new Object();
			var ss:Uint8Array = new Uint8Array(lVoxFile.savelvoxfile(cubeMeshManager).buffer);
			FileSaver.saveBlob(FileSaver.createBlob([ss], {}), "CubeModel.lvox");
		}
		
		//存储lvox的byte
		 static savelvoxfile(cubeMeshManager:CubeSprite3D):Byte
		{
			var cubeMeshsprite :CubeMeshSprite3D;
			var CubeMeshSprite3DNumsPos:number = 0;
			var CubeMeshSprite3DNums:number = 0;
			var CubeSpritex:number = 0;
			var CubeSpritey:number = 0;
			var CubeSpritez:number = 0;
			var CubeMeshSpriteLength = 0;
			//创建二进制数组
			//版本号
			var bytearray:Byte = new Byte();
			bytearray.writeUTFString(lVoxFile.Version);
			//sprite3D数量
			CubeMeshSprite3DNumsPos = bytearray.pos;
			bytearray.writeInt32(0);
			
			var object:any = cubeMeshManager.CubeMeshSpriteArray;
			var cubemeshspritenums:number = 0;
			
			for (var str  in object)
			{
				cubeMeshsprite = (<CubeMeshSprite3D>object[str] );
				CubeSpritex = Math.round(str / 10000 - 101);
				CubeSpritey = Math.round((str - (CubeSpritex + 100) * 10000) / 100 - 101);
				CubeSpritez = Math.round((str - (CubeSpritex + 100) * 10000 - (CubeSpritey + 100) * 100) - 100);
				bytearray.writeInt16(CubeSpritex);
				bytearray.writeInt16(CubeSpritey);
				bytearray.writeInt16(CubeSpritez);
				//长度
				var spriteArraybuffer:ArrayBuffer = cubeMeshsprite.cubeMeshFilter.compressCubeInfo();
				bytearray.writeUint32(spriteArraybuffer.byteLength);
				//塞入数据内容
				bytearray.writeArrayBuffer(spriteArraybuffer, 0, spriteArraybuffer.byteLength);	
				cubemeshspritenums++;
				
			}
			bytearray.pos = CubeMeshSprite3DNumsPos;
			bytearray.writeInt32(cubemeshspritenums);
			return bytearray;
		
		}
		
		 static savelvox2file(cubeSp:CubeSprite3D, isLocal:boolean, rtnFun:Function):Byte {
			var cubemap:CubeMap = cubeSp._cubeGeometry.cubeMap;
			// 由于要异步，所以不能直接访问cubemap，要先保存结果
			var arr:any[] = cubeSp._cubeGeometry.cubeMap.saveData();// .returnData();
			var encode:VoxelFmt2  = new VoxelFmt2(true, rtnFun);
			if ( rtnFun) {
				// 异步
				encode.encode3(arr, isLocal, true);
			}else {
				return new Byte(encode.encode3(arr,isLocal,true));					
			}
		}
		
		/*
		public static function savelvox2file(cubeSp:CubeSprite3D,isLocal:Boolean,rtnFun:Function):Byte {
			var minx:int = Number.MAX_VALUE;
			var miny:int = Number.MAX_VALUE;
			var minz:int = Number.MAX_VALUE;
			var maxx:int = 0;
			var maxy:int = 0; 
			var maxz:int = 0;
			var x:int, y:int, z:int;
			
			var arr:Array = cubeSp._cubeGeometry.cubeMap.returnData();
			var num:int = arr.length / 4;	//x,y,z,color
			// 先找出最大最小值。由于现在给的xyz是从1600开始的
			var i:int = 0;
			var ci:int = 0;
			
			// 收集颜色信息
			var origColor:Uint8Array = new Uint8Array(num * 4);
			var palColor:Object = { };
			var palCount:int = 1;
			var pal256:Uint8Array = new Uint8Array(256 * 3);
			for (i = 0; i < num; i++) {
				x = arr[ci++];
				y = arr[ci++];
				z = arr[ci++];
				if (minx > x) minx = x;
				if (miny > y) miny = y;
				if (minz > z) minz = z;
				if (maxx < x) maxx = x;
				if (maxy < y) maxy = y;
				if (maxz < z) maxz = z;

				var col:int = arr[ci++];
				var cst:int = i * 4;
				var r:int=origColor[cst + 2] = ((col>>>10)&0x1f)<<3;
				var g:int=origColor[cst + 1] = ((col>>>5)&0x1f)<<3;
				var b:int=origColor[cst    ] = (col&0x1f)<<3;
				origColor[cst + 3] = 255;
				if (palColor[col] == null)
				{
					if (palCount < 256)
					{
						pal256[palCount*3] = b;
						pal256[palCount * 3 + 1] = g;
						pal256[palCount * 3 + 2] = r;
					}
					palColor[col] = palCount++;
				}
			}
			var xsize:int = maxx - minx+1;
			var ysize:int = maxy - miny+1;
			var zsize:int = maxz - minz+1;
			
			if (palCount >= 256)
			{
				var reducer:ColorQuantization_Mediancut = new ColorQuantization_Mediancut();
				var pal:Uint8Array = reducer.mediancut(origColor, 256);
				for (var col:String in palColor)
					palColor[col]= reducer.getNearestIndex((col& 0x1f)<<3, ((col>>>5)&0x1f)<<3, ((col>>>10)&0x1f)<<3, pal);
			}
			
			// 构造完整数组，并且获得调色板索引
			var xzsize:int = xsize * zsize;
			var arraydt:Uint8Array = new Uint8Array(ysize * xzsize);
			
			ci = 0;
			for (i = 0; i < num; i++,ci+=4) {
				//var x:int = arr[ci] - minx;// xyz要转成相对的  
				x = arr[ci] = arr[ci] - minx;
				y = arr[ci + 1] = arr[ci + 1] - miny;
				z = arr[ci + 2] = arr[ci + 2] - minz;
				arraydt[x + z * xsize+y * xzsize] =  palColor[ arr[ci+3] ];// reducer.getNearestIndex(r, g, b, pal);//这里需要是调色板索引
			}
			
			// 压缩
			var encode:VoxelFmt2  = new VoxelFmt2(true, rtnFun);
			if (rtnFun)
			{
				encode.encode(arr, palCount > 256?new Uint8Array(pal):pal256, arraydt, xsize, ysize, zsize, minx-1600, miny-1600, minz-1600,  isLocal);
				return null;
			}
			else
			{
				var compret:ArrayBuffer = encode.encode(arr, palCount > 256?new Uint8Array(pal):pal256, arraydt, xsize, ysize, zsize, minx-1600, miny-1600, minz-1600, isLocal);
				return new Byte(compret);				
			}
		}		
		*/
		
		
		 static parse001(arraybuffer:ArrayBuffer):CubeInfoArray {
			lVoxFile.cubeInfoArray = new CubeInfoArray();
			var offsetx:number = 0;
			var offsety:number = 0;
			var offsetz:number = 0;
			var length:number = 0;
			var bytearray:Byte = new Byte(arraybuffer);
			var versionString:string = bytearray.readUTFString();
			var CubeInfoNums:number = bytearray.readInt32();
			var sprite3DarrayStartPos:number = 0;
			
			for (var i:number = 0; i < CubeInfoNums; i++){
				offsetx = bytearray.readInt16();
				offsety = bytearray.readInt16();
				offsetz = bytearray.readInt16();
				length = bytearray.readUint32();
				lVoxFile.loadCompressedData(bytearray.buffer, offsetx, offsety, offsetz, bytearray.pos, length);
				bytearray.pos += length;
			}
			return lVoxFile.cubeInfoArray;
		}
		
		 static parse002(arraybuffer:ArrayBuffer):CubeInfoArray {
			var cubeInfoArray:CubeInfoArray = new CubeInfoArray();
			var posArr:number[] = cubeInfoArray.PositionArray;
			var colArr:number[] = cubeInfoArray.colorArray;
			var colorpal:Uint8Array = null;
			var fmt2:VoxelFmt2 = new VoxelFmt2(false);
			fmt2.decode(arraybuffer, {
				cb_setPalette: function(pal:Uint8Array):void{
					colorpal = pal;
				}, 
				cb_setSize: function(x:number, y:number, z:number):void{
					cubeInfoArray.sizex = x;
					cubeInfoArray.sizey = y;
					cubeInfoArray.sizez = z;
				}, 
				cb_addData: function(x:number, y:number, z:number, v:number):void {
					posArr.push(x, y, z);
					var palst:number = v * 3;
					var r:number = colorpal[palst];
					var g:number = colorpal[palst + 1];
					var b:number = colorpal[palst + 2];
					if (fmt2.curver >= 4) {
						colArr.push((b << 10) | (g << 5) | r);
					}else{
						colArr.push(((b >>> 3) << 10) | ((g >>> 3) << 5) | (r >>> 3));
					}
				}
			});
			return cubeInfoArray;
		}
		
		//读取lvox
		 static LoadlVoxFile(Path:string, ReturnCubeInfoArray:Handler):void{
			Laya.loader.load(Path, Handler.create(lVoxFile, function(arraybuffer:ArrayBuffer):void{
				var bytearray:Byte = new Byte(arraybuffer);
				if (arraybuffer == null){
					throw "Failed to open file for FileStream";
				}
				var cubeArr:CubeInfoArray = null;
				var versionString:string = bytearray.readUTFString();
				try{
					if (versionString === 'LayaBoxVox0002') {
						cubeArr = lVoxFile.parse002(arraybuffer);
					}else if ( versionString === 'LayaBoxVox001') {
						cubeArr = lVoxFile.parse001(arraybuffer);
					}else {
						console.error('bad file format :', Path);
						return;
					}
				}catch (e) {
					console.log('pasefile error!');
				}
				
				ReturnCubeInfoArray.args = [cubeArr];
				ReturnCubeInfoArray.run();
			}), null, Loader.BUFFER);
		}
		
		private static loadCompressedData(data:ArrayBuffer, offsetx:number,offsety:number,offsetz:number,arrayBufferoffset:number,length:number) 
		{		
			VoxDataCompress.decodeData(data, arrayBufferoffset, length, function(x:number, y:number, z:number, dt16:number) 
			{
					//var color:Color = new Color();
					//color.r = ((dt16&0x1f)<<3) / 255;
					//color.g = ((dt16&0x3e0)>>2) / 255;
					//color.b = ((dt16>>10)<<3) / 255;
					//color.a = 1;
					var pos:number = lVoxFile.cubeInfoArray.PositionArray.length;
					lVoxFile.cubeInfoArray.PositionArray.length = pos + 3;
					lVoxFile.cubeInfoArray.PositionArray[pos]=x + offsetx * 12;
					lVoxFile.cubeInfoArray.PositionArray[pos+1]=y + offsety * 12;
					lVoxFile.cubeInfoArray.PositionArray[pos+2]=z + offsetz * 12;
					lVoxFile.cubeInfoArray.colorArray.push(dt16);
				}
			);
			
		}
		
		
		
		 static LoadlVoxFilebyArray(arraybuffer:ArrayBuffer):CubeInfoArray
		{
				lVoxFile.cubeInfoArray.PositionArray.length = 0;
				lVoxFile.cubeInfoArray.colorArray.length = 0;
				var offsetx:number = 0;
				var offsety:number = 0;
				var offsetz:number = 0;
				var length:number = 0;
				var bytearray:Byte = new Byte(arraybuffer);
				if (arraybuffer == null)
				{
					throw "Failed to open file for FileStream";
				}
				var versionString:string = bytearray.readUTFString();
				var CubeInfoNums:number = bytearray.readInt32();
				var sprite3DarrayStartPos:number = 0;
				for (var i:number = 0; i < CubeInfoNums; i++)
				{
					offsetx = bytearray.readInt16();
					offsety = bytearray.readInt16();
					offsetz = bytearray.readInt16();
					length = bytearray.readUint32();
					lVoxFile.loadCompressedData(bytearray.buffer, offsetx, offsety, offsetz, bytearray.pos, length);
					bytearray.pos += length;
				}
				return lVoxFile.cubeInfoArray;
		}
	}


