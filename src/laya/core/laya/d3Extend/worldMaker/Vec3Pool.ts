import { Vector3 } from "laya/d3/math/Vector3"
	export class Vec3Pool {
		private static vecstack:any[] = [];		// 可用的
		
		 static getVec3():Vector3 {
			var ret:Vector3 ;
			if (Vec3Pool.vecstack.length) {
				ret = Vec3Pool.vecstack.pop();
			}else {
				ret = new Vector3();
			}
			return ret;
		}
		
		 static discardVec3(v:Vector3):void {
			v.x = v.y = v.z = 0;
			Vec3Pool.vecstack.push(v);
		}
	}

	