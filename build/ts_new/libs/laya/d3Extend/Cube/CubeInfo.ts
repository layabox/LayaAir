import { SubCubeGeometry } from "SubCubeGeometry";
/**
	 * <code>CubeInfo</code> 类用于实现方块信息(也可能是点)。
	 */
	export class CubeInfo {
		
		/**@private */
		 static _aoFactor:number = 0.85;
		 static aoFactor:number[] = [];
		/**@private */
		//用来存储所有的情况
		 static Objcect0down:any[] = new Array(256);//5,6,7
		 static Objcect0front:any[] = new Array(256);//3,6,7
		 static Objcect0right:any[] = new Array(256);//3,7,5
		
		 static Objcect1down:any[] = new Array(256);//4,6,7
		 static Objcect1left:any[] = new Array(256);//2,4,6
		 static Objcect1front:any[] = new Array(256);//2,6,7
		
		 static Objcect2down:any[] = new Array(256);//4,5,7
		 static Objcect2back:any[] = new Array(256);//1,4,5
		 static Objcect2right:any[] = new Array(256);//1,5,7
		
		
		 static Objcect3down:any[] = new Array(256);//4,5,6
		 static Objcect3left:any[] = new Array(256);//0,4,6
		 static Objcect3back:any[] = new Array(256);//0,4,5
		
		 static Objcect4up:any[] = new Array(256);//1,2,3
		 static Objcect4front:any[] = new Array(256);//7,3,2
		 static Objcect4right:any[] = new Array(256);//1,3,7
		
		 static Objcect5up:any[] = new Array(256);//0,2,3
		 static Objcect5left:any[] = new Array(256);//0,2,6
		 static Objcect5front:any[] = new Array(256);//2,3,6
		
		 static Objcect6up:any[] = new Array(256);//0,1,3
		 static Objcect6back:any[] = new Array(256);//0,1,5
		 static Objcect6right:any[] = new Array(256);//1,3,5
		
		 static Objcect7up:any[] = new Array(256);//0,1,2
		 static Objcect7back:any[] = new Array(256);//0,1,4
		 static Objcect7left:any[] = new Array(256);//0,2,4
		
		 static PanduanWei:Int32Array = new Int32Array([1, 2, 4, 8, 16, 32, 64, 128]);
		/**@private */
		 static MODIFYE_NONE:number = 0;
		/**@private */
		 static MODIFYE_ADD:number = 1;
		/**@private */
		 static MODIFYE_REMOVE:number = 2;
		/**@private */
		 static MODIFYE_UPDATE:number = 3;
		/**@private */
		 static MODIFYE_UPDATEAO:number = 4;
		/**@private */
		 static MODIFYE_UPDATEPROPERTY:number = 5;
		/**@private */
		//24个点到底根据面的索引再到点的索引
		 frontFaceAO:Int32Array = new Int32Array([0, 0, 0, 0, 0, 0]);
		
		/**@private */
		 static _pool:any[] = [];
		
		//选择画框的线的index
		 selectArrayIndex:number[] = [];
		
		
		/**
		 * @private
		 */
		 static create(x:number, y:number, z:number):CubeInfo {
			if (CubeInfo._pool.length) {
				var cube:CubeInfo = CubeInfo._pool.pop();
				cube.x = x;
				cube.y = y;
				cube.z = z;
				cube.modifyFlag = CubeInfo.MODIFYE_NONE;
				cube.frontVBIndex = -1;
				cube.backVBIndex = -1;
				cube.leftVBIndex = -1;
				cube.rightVBIndex = -1;
				cube.topVBIndex = -1;
				cube.downVBIndex = -1;
				cube.point = 0;
				cube.subCube = null;
				return cube;
			} else {
				return new CubeInfo(x, y, z);
			}
		}
		
		/**
		 * @private
		 */
		 static recover(cube:CubeInfo):void {

			if (cube)
			{
				if (cube instanceof CubeInfo)
				{
					CubeInfo._pool.push(cube);
				}
			}
			
		}
		
		/**@private [同步状态]*/
		 subCube:SubCubeGeometry;
		/**@private 非同步状态,属于哪个SubCubeGeometry*/
		 updateCube:SubCubeGeometry;
		/**@private */
		 x:number;
		/**@private */
		 y:number;
		/**@private */
		 z:number;
		/**@private [同步状态]*/
		 color:number;
		/**@private 点遮挡信息[同步状态]*/
		 point:number;
		/**@private */
		 modifyFlag:number = CubeInfo.MODIFYE_NONE;//1
		/**@private */
		 frontVBIndex:number = -1;
		/**@private */
		 backVBIndex:number = -1;
		/**@private */
		 leftVBIndex:number = -1;
		/**@private */
		 rightVBIndex:number = -1;
		/**@private */
		 topVBIndex:number = -1;
		/**@private */
		 downVBIndex:number = -1;
		/**@private */
		 modifyIndex:number = -1;
		/**@private */
		 cubeProperty:number = 999;
		
		constructor(_x:number, _y:number, _z:number){
			this.x = _x;
			this.y = _y;
			this.z = _z;
		}
		
		/**
		 * @private
		 */
		 update():void {
			this.updateCube.updatePlane(this);//更新面、颜色、AO相关数据
		}
		
		 clearAoData():void
		{
			this.frontFaceAO[0] = 0;
			this.frontFaceAO[1] = 0;
			this.frontFaceAO[2] = 0;
			this.frontFaceAO[3] = 0;
			this.frontFaceAO[4] = 0;
			this.frontFaceAO[5] = 0;
			
		}
		
		//初始化的时候传值
		 static Cal24Object():void {
			
			for (var j:number = 0; j < 4; j++) {
				CubeInfo.aoFactor[j] = Math.pow(CubeInfo._aoFactor, j);
				
			}
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect0down, 5, 6, 7);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect0front, 3, 6, 7);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect0right, 3, 5, 7);
			
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect1down, 4, 6, 7);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect1left, 2, 4, 6);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect1front, 2, 6, 7);
			
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect2down, 4, 5, 7);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect2back, 1, 4, 5);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect2right, 1, 5, 7);
			
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect3down, 4, 5, 6);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect3left, 0, 4, 6);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect3back, 0, 4, 5);
			
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect4up, 1, 2, 3);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect4front, 7, 3, 2);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect4right, 1, 3, 7);
			
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect5up, 0, 2, 3);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect5left, 0, 2, 6);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect5front, 2, 3, 6);
			
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect6up, 0, 1, 3);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect6back, 0, 1, 5);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect6right, 1, 3, 5);
			
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect7up, 0, 1, 2);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect7back, 0, 1, 4);
			CubeInfo.CalOneObjectKeyValue(CubeInfo.Objcect7left, 0, 2, 4);
		
		}
		
		private static CalOneObjectKeyValue(array:any[], Wei1:number, Wei2:number, Wei3:number):void {
			
			for (var i:number = 0; i < 256; i++) {
				var num:number = 0;
				if ((i & CubeInfo.PanduanWei[Wei1]) != 0) num++;
				if ((i & CubeInfo.PanduanWei[Wei2]) != 0) num++;
				if ((i & CubeInfo.PanduanWei[Wei3]) != 0) num++;
				array[i] = num;
			}
		}
		
		//判断点的某个Cube是否存在
		//存在返回1，不存在返回-1
		 calDirectCubeExit(Wei:number):number {
			return ((this.point & CubeInfo.PanduanWei[Wei]) != 0) ? 1 : -1;
		}
		
		 getVBPointbyFaceIndex(faceIndex:number):number {
			switch (faceIndex) {
			case 0: 
				return this.frontVBIndex;
				break;
			case 1: 
				return this.rightVBIndex;
				break;
			case 2: 
				return this.topVBIndex;
				break;
			case 3: 
				return this.leftVBIndex;
				break;
			case 4: 
				return this.downVBIndex;
				break;
			case 5: 
				return this.backVBIndex;
				break;
			default:
				return -1;
			}
		}
		
		 returnColorProperty():number
		{
			var ss:number = this.color & 0xff000000 >> 24;
			return ss;
		}
		
		
		
		 ClearSelectArray():void
		{
			this.selectArrayIndex.length = 0;
		}
	
	}


