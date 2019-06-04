import { CubePhysicsCompnent } from "././CubePhysicsCompnent";
import { CubeMeshManager } from "./CubeMeshManager";
import { CubeInfo } from "../Cube/CubeInfo"
	import { CubeMap } from "../Cube/CubeMap"
	import { Vector3 } from "laya/d3/math/Vector3"
	
	import { CubeInfoArray } from "../worldMaker/CubeInfoArray"


	/**
	 * ...
	 * @author ...
	 */
	export class CubeEditCubeCollider extends CubePhysicsCompnent{
		//静不静态
		 data:any = {};
		 collisionCube:Vector3 = new Vector3();
		 cubeProperty:number = 0;
		constructor(){super();

		
		}
		
		  /*override*/  onAwake():void {
			super.onAwake();
			this.type = CubePhysicsCompnent.TYPE_CUBESPRIT3D;
		  }
		  
		 dataAdd(x:number, y:number, z:number,color:number):void
		{
			var key:number = (x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16);
			var o:any = this.data[key] || (this.data[key] = {});
			o[x % 32 + ((y % 32) << 8) + ((z % 32) << 16)] = (this.colorIndex & 0xff000000) >> 24;
		}
		 find(x:number, y:number, z:number):number
		{
			var key:number = (x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16);
			var o:any= this.data[key];
			if (o)
			{
				if (o[x % 32 + ((y % 32) << 8) + ((z % 32) << 16)])
				{
					return o[x % 32 + ((y % 32) << 8) + ((z % 32) << 16)];
				}
				else
				{
					return -1;
				}
			}
			return -1;
		}
		 clear():void
		{
			for (var i  in this.data)
			{
				this.data[i] = {};
			}
		}
		 InitCubemap(cubemap:CubeMap,cubeMeshManager:CubeMeshManager):void
		{
			var vector:Vector3 = cubeMeshManager.transform.position;
			var cubeinfos:CubeInfo[]  = cubemap.returnAllCube();
			for (var i:number = 0, n:number = cubeinfos.length; i <n ; i++) {
				this.dataAdd(cubeinfos[i].x+vector.x, cubeinfos[i].y+vector.y, cubeinfos[i].z+vector.z,cubeinfos[i].color);
			}
			
		}
		 InitCubeInfoArray(cubeinfoArray:CubeInfoArray):void
		{
			var lenth:number = cubeinfoArray.PositionArray.length / 3;
			var PositionArray:number[] = this.cubeInfoArray.PositionArray;
			this.cubeInfoArray.currentColorindex = 0;
			this.cubeInfoArray.currentPosindex = 0;
			for (var i:number = 0; i < lenth; i++) {
				var x:number = PositionArray[this.cubeInfoArray.currentPosindex] + this.cubeInfoArray.dx+1600;
				var y:number = PositionArray[this.cubeInfoArray.currentPosindex + 1] + this.cubeInfoArray.dy+1600;
				var z:number = PositionArray[this.cubeInfoArray.currentPosindex + 2] + this.cubeInfoArray.dz+1600;
				var color:number = this.cubeInfoArray.colorArray[this.cubeInfoArray.currentColorindex];
				this.cubeInfoArray.currentPosindex += 3;
				this.cubeInfoArray.currentColorindex++;
				this.dataAdd(x, y, z,color);
			}
		}
		
		 /**
     * 碰撞检测
     */
    /*override*/  isCollision(other:CubePhysicsCompnent):number {
        switch (other.type) {
            case 0:
                return ((<CubeBoxCollider>other )).boxAndCube(this);
                break;
            case 1:
                return ((<CubeSphereCollider>other )).sphereAndCube(this);
                break;
            case 2:
                return 999;
                break;
            default:
                return 999;
        }

    }
	

		
	}


