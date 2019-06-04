import { PlaneInfo } from "././PlaneInfo";
import { Color } from "laya/d3/math/Color"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { VoxFileData } from "../vox/VoxFileData"
	/**
	 * <code>CompressPlane</code> 类用于压缩存储PlaneInfo
	 */
	export class CompressPlane 
	{
		 startX:number;
		 startY:number;
		 startZ:number; 
		 vecPlaneInfo:PlaneInfo[];
		
		constructor(startX:number,startY:number,startZ:number){
			this.startX = startX;
			this.startY = startY;
			this.startZ = startZ;
			this.vecPlaneInfo = [];
		}
		 setValue(startX:number,startY:number,startZ:number,vecPane:PlaneInfo[]):void {
			this.startX = startX;
			this.startY = startY;
			this.startZ = startZ;
			this.vecPlaneInfo = vecPane;
		}
		 getKey():string{
			return this.startX + "," + this.startY + "," + this.startZ;
		}
		
	}

   




























