import { Color } from "laya/d3/math/Color"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { VoxFileData } from "../vox/VoxFileData"
	/**
	 * <code>PlaneInfo</code> 类用于存储合并CubeInfo之后的面
	 */
	export class PlaneInfo 
	{
		//考虑到xyz每次只会有用到其中两个
		 p1:number;
		 p2:number;
		 width:number;
		 height:number;
		 colorIndex:number;
		 isCover:boolean;

		constructor(p1:number,p2:number,width:number,height:number,colorIndex:number){
			this.p1 = p1;
			this.p2 = p2;
			this.width = width;
			this.height = height;
			this.colorIndex = colorIndex;
			this.isCover = false;
		}
		 setValue(p1:number, p2:number, width:number,height:number,colorIndex:number):void {
			this.p1 = p1;
			this.p2 = p2;
			this.width = width;
			this.height = height;
			this.colorIndex = colorIndex;
		}
		 setP12(p1:number, p2:number):void {
			this.p1 = p1;
			this.p2 = p2;
		}
		 addWidth(value:number):void{
			this.width += value;
		}
		 addHeight(value:number):void {
			this.height += value;
		}
	
		 getKey():string{
			return this.p1 + "," + this.p2 ;
		}
		 getIndex():number {
			var index:number = this.p1 + this.p2 * 3200;
			return index;
		}
	}

