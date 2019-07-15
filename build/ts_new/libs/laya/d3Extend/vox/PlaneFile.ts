import { Laya } from "Laya";
import { CompressPlane } from "../Cube/CompressPlane"
	import { CompressPlaneVector } from "../Cube/CompressPlaneVector"
	import { CubeSprite3D } from "../Cube/CubeSprite3D"
	import { PlaneInfo } from "../Cube/PlaneInfo"
	import { FileSaver } from "../FileSaver"
	import { Loader } from "laya/net/Loader"
	import { Byte } from "laya/utils/Byte"
	import { Handler } from "laya/utils/Handler"
	
	/**
	 * <code>PlaneFile</code> 类用于读取PlaneFile文件
	 * @author zqx
	 */
	
	//***********lvox格式*********************
	//version："LayaBoxVox001"
	//byte[13] = string("LayaBoxVox001");
	//byte[1] = Uint8();//所有的CompressPlaneVector的数量,固定为6个
	////内容区
	//for(6)
	//{
	// byte[1] = Uint8();  face
	// byte[4] = int32     CompressPlane的数量
	// for(CompressPlane的数量)
	//{
	// byte[2] = Uint16 startX 
	// byte[2] = Uint16 startY 
	// byte[2] = Uint16 startZ
	// byte[2] = Uint16 PlaneInfo的数量
	// for(PlaneInfo的数量)
	//{
	// byte[1] = Uint8() 存储坐标组合（xy,xz,yz）
	// byte[1] = Uint8() 存储宽度和高度组合（wh）
	// byte[1] = Uint8() 存储颜色索引
	//}
	//}
	//}
	//****************************************
	export class PlaneFile{
		private static _Version:string = "LayaBoxVox001";
		constructor(){
		
		}
		
		//导出为lvox格式
		 static ExportlvoxFile(cubeSprite3d:CubeSprite3D):void{
			var object:any = new Object();
			var ss:Uint8Array = new Uint8Array(PlaneFile.savelvoxfile(cubeSprite3d).buffer);
			FileSaver.saveBlob(FileSaver.createBlob([ss], {}), "PlaneInfo.lvox");
		}
		
		 static savelvoxfile(cubeSprite3d:CubeSprite3D):Byte{
			var comPVectorVector:CompressPlaneVector[] = cubeSprite3d._cubeGeometry.comPressCube();
			//创建二进制数组
			//版本号
			var bytearray:Byte = new Byte();
			bytearray.writeUTFString(PlaneFile._Version);
			//CompressPlaneVector的数量
			var ComPlaneVecNum:number = comPVectorVector.length;
			bytearray.writeUint8(ComPlaneVecNum);
			for (var n:number = 0; n < ComPlaneVecNum; n++){
				var comPVector:CompressPlaneVector = comPVectorVector[n];
				//CompressPlaneVector face
				var face:number = comPVector.face;
				bytearray.writeUint8(comPVector.face);
				//CompressPlane的数量
				var vecCompressPlane:CompressPlane[] = comPVector.vecCompressPlane;
				var compressPlaneNum:number = comPVector.vecLength;
				bytearray.writeUint16(compressPlaneNum);
				
				for (var conpIndex in vecCompressPlane) {
					var compressPlane:CompressPlane = vecCompressPlane[conpIndex];
					bytearray.writeUint16(compressPlane.startX);
					bytearray.writeUint16(compressPlane.startY);
					bytearray.writeUint16(compressPlane.startZ);
					var planeInfoVec:PlaneInfo[] = compressPlane.vecPlaneInfo;
					var planeInfoNum:number = planeInfoVec.length;
					bytearray.writeUint16(planeInfoNum); 
					
					for (var p:number = 0; p < planeInfoNum; p++ ){
						//这里需要注意在存储数据时候，要主要xyz的组合并不是三者全部都需要
						var plane:PlaneInfo = planeInfoVec[p]
						var p1:number = plane.p1;
						var p2:number = plane.p2;
						var xy:number;
						if (face == 0 || face == 1) {
							xy = p1;
							xy = xy << 4;
							xy = (xy |p2);
						}
						else if (face == 2 || face == 3) {
							xy = p1;
							xy = xy << 4;
							xy = (xy | p2);
						}
						else {
							xy = p1;
							xy = xy << 4;
							xy = (xy | p2);	
						}
						bytearray.writeUint8(xy);
						var wh:number = plane.width;
						wh = wh << 4;
						wh = (wh | plane.height);
						bytearray.writeUint8(wh);
						bytearray.writeUint16(plane.colorIndex);
					}
				}
			}
			return bytearray;
		}
		
		//读取lvox
		 static LoadlVoxFile(Path:string, ReturnCubeInfoArray:Handler):void {
		    //测试
			debugger;
			var comPVectorVector:CompressPlaneVector[] = [];	
			Laya.loader.load(Path, Handler.create(this, function(arraybuffer:ArrayBuffer):void {
				debugger;
				var offsetx:number = 0;
				var offsety:number = 0;
				var offsetz:number = 0;
				var length:number = 0;
				var bytearray:Byte = new Byte(arraybuffer);
				if (arraybuffer == null){
					throw "Failed to open file for FileStream";
				}
				var versionString:string = bytearray.readUTFString();
				//CompressPlaneVector的数量
			    var ComPlaneVecVecNum:number = bytearray.readUint8(); 
				for (var n:number = 0; n < ComPlaneVecVecNum; n++) {
					var compressPlaneVec:CompressPlaneVector = new CompressPlaneVector;
					var face:number = bytearray.readUint8();
					var compressPlaneNum:number = bytearray.readUint16();
					compressPlaneVec.face = face;

					var vecCompressPlane:CompressPlane[] = [];
					compressPlaneVec.vecCompressPlane = vecCompressPlane;
					for (var cpn:number = 0; cpn < compressPlaneNum; cpn++) {
						var compressPlane:CompressPlane = new CompressPlane;
						var startX:number = bytearray.readUint16();
						var startY:number = bytearray.readUint16();
						var startZ:number = bytearray.readUint16();
						compressPlane.setValue(startX, startY, startZ);
						
						var planeInfoNum:number = bytearray.readUint16();
						var planeInfoVec:PlaneInfo[] = [];
						
						for (var j:number = 0; j < planeInfoNum; j++) {
							var planeInfo:PlaneInfo	= new PlaneInfo;
							//这里需要注意在存储数据时候，要主要xyz的组合并不是三者全部都需要
							if (face == 0 || face == 1) {
								var xy:number = bytearray.readUint8();
								var x:number = xy >> 4 ;
								var y:number = xy & 15;
								planeInfo.p1 = x;
								planeInfo.p2 = y;	
							}
							else if (face == 2 || face == 3) {
								var xz:number = bytearray.readUint8();
								var x:number = xz >> 4;
								var z:number = xz & 15;
								planeInfo.p1 = x;
								planeInfo.p2 = z;	
							}
							else {
								var yz:number = bytearray.readUint8();
								var y:number = yz >> 4;
								var z:number = yz & 15;
								planeInfo.p1 = y;
								planeInfo.p2 = z;	
							}
							var wh:number = bytearray.readUint8();
							var w:number = wh >> 4;
							var h:number = wh & 15;
							planeInfo.width = w;
							planeInfo.height = h;
							var colorIndex:number = bytearray.readUint16();
							planeInfo.colorIndex = colorIndex;
							planeInfoVec.push(planeInfo);
						}
						compressPlane.vecPlaneInfo = planeInfoVec;
						vecCompressPlane.push(compressPlane);
					}

					comPVectorVector.push(compressPlaneVec);	
				}
			}), null, Loader.BUFFER);
		}
	
	}


