import { VoxFileChunkChild } from "./VoxFileChunkChild";
import { Laya } from "Laya";
import { VoxData } from "./VoxData";
	import { Color } from "laya/d3/math/Color"
	import { CubeInfo } from "../Cube/CubeInfo"
	import { CubeInfoArray } from "../worldMaker/CubeInfoArray"
	import { Loader } from "laya/net/Loader"
	import { Browser } from "laya/utils/Browser"
	import { Byte } from "laya/utils/Byte"
	import { Handler } from "laya/utils/Handler"
	/**
	 * ...
	 * @author ...
	 */
	export class VoxFileData {
		
		//VoxFileHeader
		 header:string;
		 version:number;
		//VoxFileChunk
		 name:string;
		 chunkContent:number;
		 chunkNums:number;
		//VoxFilePack
		 Packname:string;
		 PackchunkContent:number;
		 PackchunkNums:number;
		 PackmodelNums:number;
		//VoxFileRGBA
		 RGBAname:string;
		 RGBAchunkContent:number;
		 RGBAchunkNums:number;
		 RGBAvalues:Uint32Array;
		//voxFileChunkChild
		 ChunkChild:VoxFileChunkChild[];
		
		 ArrayColor:Color[];
		
		 cubeInfoArray:CubeInfoArray = new CubeInfoArray();
		
		 static _paletteDefault :Uint32Array = new Uint32Array([0x00000000, 0xffffffff, 0xffccffff, 0xff99ffff, 0xff66ffff, 0xff33ffff, 0xff00ffff, 0xffffccff, 0xffccccff, 0xff99ccff, 0xff66ccff, 0xff33ccff, 0xff00ccff, 0xffff99ff, 0xffcc99ff, 0xff9999ff,
				0xff6699ff, 0xff3399ff, 0xff0099ff, 0xffff66ff, 0xffcc66ff, 0xff9966ff, 0xff6666ff, 0xff3366ff, 0xff0066ff, 0xffff33ff, 0xffcc33ff, 0xff9933ff, 0xff6633ff, 0xff3333ff, 0xff0033ff, 0xffff00ff,
				0xffcc00ff, 0xff9900ff, 0xff6600ff, 0xff3300ff, 0xff0000ff, 0xffffffcc, 0xffccffcc, 0xff99ffcc, 0xff66ffcc, 0xff33ffcc, 0xff00ffcc, 0xffffcccc, 0xffcccccc, 0xff99cccc, 0xff66cccc, 0xff33cccc,
				0xff00cccc, 0xffff99cc, 0xffcc99cc, 0xff9999cc, 0xff6699cc, 0xff3399cc, 0xff0099cc, 0xffff66cc, 0xffcc66cc, 0xff9966cc, 0xff6666cc, 0xff3366cc, 0xff0066cc, 0xffff33cc, 0xffcc33cc, 0xff9933cc,
				0xff6633cc, 0xff3333cc, 0xff0033cc, 0xffff00cc, 0xffcc00cc, 0xff9900cc, 0xff6600cc, 0xff3300cc, 0xff0000cc, 0xffffff99, 0xffccff99, 0xff99ff99, 0xff66ff99, 0xff33ff99, 0xff00ff99, 0xffffcc99,
				0xffcccc99, 0xff99cc99, 0xff66cc99, 0xff33cc99, 0xff00cc99, 0xffff9999, 0xffcc9999, 0xff999999, 0xff669999, 0xff339999, 0xff009999, 0xffff6699, 0xffcc6699, 0xff996699, 0xff666699, 0xff336699,
				0xff006699, 0xffff3399, 0xffcc3399, 0xff993399, 0xff663399, 0xff333399, 0xff003399, 0xffff0099, 0xffcc0099, 0xff990099, 0xff660099, 0xff330099, 0xff000099, 0xffffff66, 0xffccff66, 0xff99ff66,
				0xff66ff66, 0xff33ff66, 0xff00ff66, 0xffffcc66, 0xffcccc66, 0xff99cc66, 0xff66cc66, 0xff33cc66, 0xff00cc66, 0xffff9966, 0xffcc9966, 0xff999966, 0xff669966, 0xff339966, 0xff009966, 0xffff6666,
				0xffcc6666, 0xff996666, 0xff666666, 0xff336666, 0xff006666, 0xffff3366, 0xffcc3366, 0xff993366, 0xff663366, 0xff333366, 0xff003366, 0xffff0066, 0xffcc0066, 0xff990066, 0xff660066, 0xff330066,
				0xff000066, 0xffffff33, 0xffccff33, 0xff99ff33, 0xff66ff33, 0xff33ff33, 0xff00ff33, 0xffffcc33, 0xffcccc33, 0xff99cc33, 0xff66cc33, 0xff33cc33, 0xff00cc33, 0xffff9933, 0xffcc9933, 0xff999933,
				0xff669933, 0xff339933, 0xff009933, 0xffff6633, 0xffcc6633, 0xff996633, 0xff666633, 0xff336633, 0xff006633, 0xffff3333, 0xffcc3333, 0xff993333, 0xff663333, 0xff333333, 0xff003333, 0xffff0033,
				0xffcc0033, 0xff990033, 0xff660033, 0xff330033, 0xff000033, 0xffffff00, 0xffccff00, 0xff99ff00, 0xff66ff00, 0xff33ff00, 0xff00ff00, 0xffffcc00, 0xffcccc00, 0xff99cc00, 0xff66cc00, 0xff33cc00,
				0xff00cc00, 0xffff9900, 0xffcc9900, 0xff999900, 0xff669900, 0xff339900, 0xff009900, 0xffff6600, 0xffcc6600, 0xff996600, 0xff666600, 0xff336600, 0xff006600, 0xffff3300, 0xffcc3300, 0xff993300,
				0xff663300, 0xff333300, 0xff003300, 0xffff0000, 0xffcc0000, 0xff990000, 0xff660000, 0xff330000, 0xff0000ee, 0xff0000dd, 0xff0000bb, 0xff0000aa, 0xff000088, 0xff000077, 0xff000055, 0xff000044,
				0xff000022, 0xff000011, 0xff00ee00, 0xff00dd00, 0xff00bb00, 0xff00aa00, 0xff008800, 0xff007700, 0xff005500, 0xff004400, 0xff002200, 0xff001100, 0xffee0000, 0xffdd0000, 0xffbb0000, 0xffaa0000,
				0xff880000, 0xff770000, 0xff550000, 0xff440000, 0xff220000, 0xff110000, 0xffeeeeee, 0xffdddddd, 0xffbbbbbb, 0xffaaaaaa, 0xff888888, 0xff777777, 0xff555555, 0xff444444, 0xff222222, 0xff111111]
		);
		
		 static turecolor:Uint16Array = new Uint16Array([0,32767,26623,20479,13311,7167,1023,32575,26431,20287,13119,6975,831,32383,26239,20095,12927,6783,639,32159,26015,19871,12703,6559,415,31967,25823,19679,12511,6367,223,31775,25631,19487,12319,6175,31,32761,26617,20473,13305,7161,1017,32569,26425,20281,13113,6969,825,32377,26233,20089,12921,6777,633,32153,26009,19865,12697,6553,409,31961,25817,19673,12505,6361,217,31769,25625,19481,12313,6169,25,32755,26611,20467,13299,7155,1011,32563,26419,20275,13107,6963,819,32371,26227,20083,12915,6771,627,32147,26003,19859,12691,6547,403,31955,25811,19667,12499,6355,211,31763,25619,19475,12307,6163,19,32748,26604,20460,13292,7148,1004,32556,26412,20268,13100,6956,812,32364,26220,20076,12908,6764,620,32140,25996,19852,12684,6540,396,31948,25804,19660,12492,6348,204,31756,25612,19468,12300,6156,12,32742,26598,20454,13286,7142,998,32550,26406,20262,13094,6950,806,32358,26214,20070,12902,6758,614,32134,25990,19846,12678,6534,390,31942,25798,19654,12486,6342,198,31750,25606,19462,12294,6150,6,32736,26592,20448,13280,7136,992,32544,26400,20256,13088,6944,800,32352,26208,20064,12896,6752,608,32128,25984,19840,12672,6528,384,31936,25792,19648,12480,6336,192,31744,25600,19456,12288,6144,29,27,23,21,17,14,10,8,4,2,928,864,736,672,544,448,320,256,128,64,29696,27648,23552,21504,17408,14336,10240,8192,4096,2048,30653,28539,24311,22197,17969,14798,10570,8456,4228,2114]);
		
		 static TextureColor:Uint16Array = new Uint16Array(256);
		
		constructor(){
			this.ArrayColor = this.CalColorFromUint32(VoxFileData._paletteDefault);
		}
		
		 static getIndexByColor(r:number,g:number,b:number,a:number):number
		{
			var i = ((parseInt(b / 51) * 51) << 16) + ((parseInt(g / 51) * 51) << 8) + parseInt(r / 51) * 51;
			if (i == 0) return 0;
			return VoxFileData._paletteDefault.indexOf( 0xff000000 + i);
		}
		
		 LoadVoxFile(Path:string, ColorPlane:number = 0, ReturnCubeInfoArray:Handler = null ):void
		{
			if (ColorPlane != 0)
			{
				
			}
			this.cubeInfoArray.PositionArray.length = 0;
			this.cubeInfoArray.colorArray.length = 0;
			Laya.loader.load(Path, Handler.create(null, function(arraybuffer:ArrayBuffer):void{
				//var startTm:Number = Browser.now();
				var bytearray:Byte = new Byte(arraybuffer);
				if (arraybuffer == null)
				{
					throw "Failed to open file for FileStream";
				}
				//判断Header
				this.header = bytearray.readUTFBytes(4);
				if (this.header != "VOX ")
				{
					throw "Bad Token: token is not VOX.";
				}
				this.version = bytearray.readInt32();
				if (this.version != 150)
				{
					throw "The version of file isn't 150 that version of vox.";
				}
				//main
				this.name = bytearray.readUTFBytes(4);
				if (this.name != "MAIN")
				{
					throw "Bad Token: token is not MAIN.";
				}
				this.chunkContent = bytearray.readInt32();
				this.chunkNums = bytearray.readInt32();
				if (this.chunkContent != 0)
				{
					throw "Bad Token: chunkcontent is should be 0";
				}
				//判断是否有PACK
				this.Packname = bytearray.readUTFBytes(4);
				if (this.Packname == "PACK")
				{
					this.PackchunkContent = bytearray.readInt32();
					this.PackchunkNums = bytearray.readInt32();
					this.PackmodelNums = bytearray.readInt32();
				}
				else
				{
					bytearray.pos -= 4;
					this.PackchunkContent = 0;
					this.PackchunkNums = 0;
					this.PackmodelNums = 1;
				}
				this.ChunkChild = [];
				for (var i:number = 0; i < 1; i++) 
				{
					var voxfileChunkChild:VoxFileChunkChild = new VoxFileChunkChild();
					voxfileChunkChild.Sizename = bytearray.readCustomString(4);
					voxfileChunkChild.SizechunkContent = bytearray.readInt32();
					voxfileChunkChild.SizechunkNums = bytearray.readInt32();
					voxfileChunkChild.Sizex = bytearray.readInt32();
					voxfileChunkChild.Sizey = bytearray.readInt32();
					voxfileChunkChild.Sizez = bytearray.readInt32();
					
					if (voxfileChunkChild.Sizename!="SIZE")
					{
						throw "Bad Token: token is not SIZE";
					}
					if (voxfileChunkChild.SizechunkContent != 12)
					{
						throw "Bad Token: chunk content is not 12";
					}
					voxfileChunkChild.XYZIname = bytearray.readCustomString(4);
					if (voxfileChunkChild.XYZIname != "XYZI")
					{
						throw "Bad Token: token is not XYZI";
					}
					voxfileChunkChild.XYZIchunkContent = bytearray.readInt32();
					voxfileChunkChild.XYZIchunkNums = bytearray.readInt32();
					if (voxfileChunkChild.XYZIchunkNums != 0)
					{
						throw "Bad Token: chunk nums is not 0";
					}
					var VoxelNums :number = bytearray.readInt32();
					//读取xyzindex数据
					var voxels:Uint8Array = new Uint8Array(VoxelNums * 4);
					voxels = bytearray.readUint8Array(bytearray.pos, VoxelNums * 4);
					voxfileChunkChild.XYZIvoxels = new VoxData(voxels, voxfileChunkChild.Sizex, voxfileChunkChild.Sizey, voxfileChunkChild.Sizez,ColorPlane);
					this.ChunkChild.push(voxfileChunkChild);
					
					//取CubeInfo
					var arrayLength:number = voxfileChunkChild.XYZIvoxels.voxels.length;
					var cubeinfos:number[] = voxfileChunkChild.XYZIvoxels.voxels;
					var PositionArray:any[] = this.cubeInfoArray.PositionArray;
					var pos1:number = PositionArray.length;
					var pos2:number = this.cubeInfoArray.colorArray.length;
					
					PositionArray.length += arrayLength / 4 * 3;
					this.cubeInfoArray.colorArray.length += arrayLength / 4;
					
					for (var w:number = 0; w < arrayLength; w+=4,pos1+=3)
					{
						PositionArray[pos1]=cubeinfos[w];
						PositionArray[pos1+1]=cubeinfos[w + 1];
						PositionArray[pos1+2]=cubeinfos[w + 2];
						this.cubeInfoArray.colorArray[pos2++]=cubeinfos[w+3];
					}
					
					var lenggt:number = this.cubeInfoArray.PositionArray.length;
					
				}
				//trace("load file:"+Path+" delay:"+(Browser.now()-startTm));
				//startTm = Browser.now();
				////获得了颜色队列值
				//if (bytearray.pos < bytearray.length)
				//{
					//RGBAname= bytearray.readUTFBytes(4);
					//if (RGBAname == "RGBA")
					//{
						//throw "Bad Token: token is not RGBA";
					//}
					//RGBAchunkContent = bytearray.readInt32();
					//RGBAchunkNums = bytearray.readInt32();
					//
					//RGBAvalues = new Uint32Array(RGBAchunkContent/4);
					//
					//for (var j:int = 0; j < RGBAvalues.length ; j++) 
					//{
						//RGBAvalues[j] = bytearray.readUint32();
					//}
					//
				//}
				//else
				//{
					//RGBAvalues = new Uint32Array(256);
					//RGBAvalues = _paletteDefault;
				//}
				////计算颜色数组
			//
				//
				//
				//for (var k:int = 0; k < CubeInfoArray.length; k++) 
				//{
					//CubeInfoArray[k]._color =CubeInfoArray[k]._color;
				//}
				ReturnCubeInfoArray.args =[this.cubeInfoArray];
				ReturnCubeInfoArray.run();
				//trace("load file2:"+Path+" delay:"+(Browser.now()-startTm));
				
			}),null,Loader.BUFFER)
		}
		
		 CalColorFromUint32(Uint32array:Uint32Array):Color[]
		{
			var ColorArray:Color[] = [];
			for (var i:number = 0; i < Uint32array.length; i++) 
			{
				var color:Color = new Color();
				color.r = ((<number>(((<ArrayBuffer>(Uint32array[i]) )) & 0xff) ))/256.0;
				color.g = ((<number>(((<ArrayBuffer>(Uint32array[i] >> 8) )) & 0xff) ))/256.0;
				color.b = ((<number>(((<ArrayBuffer>(Uint32array[i] >> 16) )) & 0xff) ))/256.0;
				color.a = 1;
				ColorArray[i] = color;
			}
			return ColorArray;
		}
		
		
		 LoadVoxFilebyarraybuffer(arraybuffer:ArrayBuffer):CubeInfoArray
		{
				this.cubeInfoArray.PositionArray.length = 0;
				this.cubeInfoArray.colorArray.length = 0;
				var bytearray:Byte = new Byte(arraybuffer);
				if (arraybuffer == null)
				{
					throw "Failed to open file for FileStream";
				}
				//判断Header  
				this.header = bytearray.readUTFBytes(4);
				if (this.header != "VOX ")
				{
					throw "Bad Token: token is not VOX.";
				}
				this.version = bytearray.readInt32();
				if (this.version != 150)
				{
					throw "The version of file isn't 150 that version of vox.";
				}
				//main
				this.name = bytearray.readUTFBytes(4);
				if (this.name != "MAIN")
				{
					throw "Bad Token: token is not MAIN.";
				}
				this.chunkContent = bytearray.readInt32();
				this.chunkNums = bytearray.readInt32();
				if (this.chunkContent != 0)
				{
					throw "Bad Token: chunkcontent is should be 0";
				}
				//判断是否有PACK
				this.Packname = bytearray.readUTFBytes(4);
				if (this.Packname == "PACK")
				{
					this.PackchunkContent = bytearray.readInt32();
					this.PackchunkNums = bytearray.readInt32();
					this.PackmodelNums = bytearray.readInt32();
				}
				else
				{
					bytearray.pos -= 4;
					this.PackchunkContent = 0;
					this.PackchunkNums = 0;
					this.PackmodelNums = 1;
				}
				this.ChunkChild = [];
				for (var i:number = 0; i < this.PackmodelNums; i++) 
				{
					var voxfileChunkChild:VoxFileChunkChild = new VoxFileChunkChild();
					voxfileChunkChild.Sizename = bytearray.readCustomString(4);
					voxfileChunkChild.SizechunkContent = bytearray.readInt32();
					voxfileChunkChild.SizechunkNums = bytearray.readInt32();
					voxfileChunkChild.Sizex = bytearray.readInt32();
					voxfileChunkChild.Sizey = bytearray.readInt32();
					voxfileChunkChild.Sizez = bytearray.readInt32();
					
					if (voxfileChunkChild.Sizename!="SIZE")
					{
						throw "Bad Token: token is not SIZE";
					}
					if (voxfileChunkChild.SizechunkContent != 12)
					{
						throw "Bad Token: chunk content is not 12";
					}
					voxfileChunkChild.XYZIname = bytearray.readCustomString(4);
					if (voxfileChunkChild.XYZIname != "XYZI")
					{
						throw "Bad Token: token is not XYZI";
					}
					voxfileChunkChild.XYZIchunkContent = bytearray.readInt32();
					voxfileChunkChild.XYZIchunkNums = bytearray.readInt32();
					if (voxfileChunkChild.XYZIchunkNums != 0)
					{
						throw "Bad Token: chunk nums is not 0";
					}
					var VoxelNums :number = bytearray.readInt32();
				//读取xyzindex数据
					var voxels:Uint8Array = new Uint8Array(VoxelNums * 4);
					voxels = bytearray.readUint8Array(bytearray.pos, VoxelNums * 4);
					voxfileChunkChild.XYZIvoxels = new VoxData(voxels, voxfileChunkChild.Sizex, voxfileChunkChild.Sizey, voxfileChunkChild.Sizez);
					this.ChunkChild.push(voxfileChunkChild);
					
					//取CubeInfo
				
					
					var arrayLength:number = voxfileChunkChild.XYZIvoxels.voxels.length;
					var cubeinfos:number[] = voxfileChunkChild.XYZIvoxels.voxels;
					var PositionArray:any[] = this.cubeInfoArray.PositionArray;
					var pos1:number = PositionArray.length;
					var pos2:number = this.cubeInfoArray.colorArray.length;
					
					PositionArray.length += arrayLength / 4 * 3;
					this.cubeInfoArray.colorArray.length += arrayLength / 4;
					
					for (var w:number = 0; w < arrayLength; w+=4,pos1+=3)
					{
						PositionArray[pos1]=cubeinfos[w];
						PositionArray[pos1+1]=cubeinfos[w + 1];
						PositionArray[pos1+2]=cubeinfos[w + 2];
						this.cubeInfoArray.colorArray[pos2++]=cubeinfos[w+3];
					}
				}
				////获得了颜色队列值
				//if (bytearray.pos < bytearray.length)
				//{
					//RGBAname= bytearray.readUTFBytes(4);
					//if (RGBAname == "RGBA")
					//{
						//throw "Bad Token: token is not RGBA";
					//}
					//RGBAchunkContent = bytearray.readInt32();
					//RGBAchunkNums = bytearray.readInt32();
					//
					//RGBAvalues = new Uint32Array(RGBAchunkContent/4);
					//
					//for (var j:int = 0; j < RGBAvalues.length ; j++) 
					//{
						//RGBAvalues[j] = bytearray.readUint32();
					//}
					//
				//}
				//else
				//{
					//RGBAvalues = new Uint32Array(256);
					//RGBAvalues = _paletteDefault;
				//}
				////计算颜色数组
				//for (var k:int = 0; k < CubeInfoArray.length; k++) 
				//{
					//CubeInfoArray[k]._color =CubeInfoArray[k]._color;
				//}
				
				return this.cubeInfoArray;
				
		}
		
	
	}


