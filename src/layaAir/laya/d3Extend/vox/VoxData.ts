import { VoxFileData } from "./VoxFileData";
	import { CubeInfo } from "../Cube/CubeInfo"
	import { Byte } from "laya/utils/Byte"
	
	/**
	 * ...
	 * @author ...
	 */
	export class VoxData {
		
		private sizex:number;
		private sizey:number;
		private sizez:number;
		
		//将值传入根据x,y,z的值取值
		
		 voxels:number[] = [];
		 count:number;
		
		constructor(_voxels:Uint8Array, xsize:number, ysize:number, zsize:number, ColorPlane:number){
			this.sizex = xsize;
			this.sizey = zsize;
			this.sizez = ysize;
	
			for (var j:number = 0; j < _voxels.length; j += 4) {
				this.voxels.push(((<number>_voxels[j] )) - Math.round(this.sizex / 2));
				this.voxels.push(((<number>_voxels[j + 2] )));
				this.voxels.push(this.sizez - ((<number>_voxels[j + 1] )) - Math.round(this.sizez / 2));
				if (ColorPlane == 0)
					this.voxels.push(VoxFileData.turecolor[(<number>_voxels[j + 3] )]);
				else
					this.voxels.push(VoxFileData.TextureColor[(<number>_voxels[j + 3] )]);
			}
			this.count = this.voxels.length / 4;
		}
	}


