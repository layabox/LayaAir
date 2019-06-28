import { VoxelLightRay } from "./VoxelLightRay";
/**
	 * 包含若干条光线的球
	 */
	export class VoxelLightSphere {
		
		 rays:VoxelLightRay[]=[];	// 这是一个n条光线的数组。
		 rayNum:number = 0;
		 raysContrib:any[] = new Array(6); 	//采样线对各个面的贡献
		
		constructor(rayNum:number, radius:number) {
			this.raysContrib.fill(0);
			this.rayNum = rayNum;
			var rayends:any[] = this.pointsOnSphere(rayNum, radius);
			var ri:number=0, x:number, y:number, z:number;
			for ( var i = 0; i < rayNum; i++) {
				x = rayends[ri++];
				y = rayends[ri++];
				z = rayends[ri++];
				var ray:VoxelLightRay = VoxelLightRay.creatLightLine(x | 0, y | 0, z | 0);
				this.rays.push( ray );
				for (var fi:number = 0; fi < 6; fi++) {
					this.raysContrib[fi] += ray.faceLight[fi];
				}
			}
		}
		
		/**
		 * http://www.softimageblog.com/archives/115
		 * 返回球上均匀分布的点
		 * @param	num		采样点的个数
		 * @param	radius
		 * @return  返回一个包含xyz的数组
		 */
		 pointsOnSphere(num:number, radius:number=1.0 ) :any[]{
			var pts:any[], inc:number, off:number, i:number, y:number, r:number, phi:number;
			pts = new Array( num*3 );
			inc = Math.PI * ( 3 - Math.sqrt( 5 ) );
			off = 2 / num;
			i	= num;
			for ( i = 0; i < num; i++){
				y = i*off - 1 + ( off / 2 );
				r = Math.sqrt( 1 - y*y );
				phi = i * inc;
				pts[i * 3] = Math.cos( phi ) * r * radius;
				pts[i * 3 + 1] = y * radius;
				pts[i * 3 + 2] = Math.sin( phi ) * r * radius ;
			}
			return pts;
		}		
	}

	