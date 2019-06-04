import { Vector3 } from "laya/d3/math/Vector3"
	export class VoxelLightRay {
		// 6个面的定义
		 static FACE_FRONT:number = 0;
		 static FACE_RIGHT:number = 1;
		 static FACE_TOP:number = 2;
		 static FACE_LEFT:number = 3;
		 static FACE_BOTTOM:number = 4;
		 static FACE_BACK:number = 5;
		
		 faceLight:any[] = new Array(6);	// 当前光对6个面的贡献	
		 maxLitFaceID:number = 0; 			// 主要对光面。 最亮的那个面
		 dir:Vector3 = new Vector3();		// 规格化后的朝向
		 path:any[]=[];			//光线路径，从000到终点，每个xyz记录的是与起点的偏移。不包含起点
		
		constructor() {
			
		}
		
		/**
		 * voxel画线遍历算法。Stack Overflow抄来的，应该是采用的 Amanatides & woo 的算法
		 * https://stackoverflow.com/questions/16505905/walk-a-line-between-two-points-in-a-3d-voxel-space-visiting-all-cells
		 * http://www.cse.yorku.ca/~amana/research/grid.pdf
		 * http://www.flipcode.com/archives/Raytracing_Topics_Techniques-Part_4_Spatial_Subdivisions.shtml
		 * 
		 * @param x0  {int} 起点的坐标。
		 * @param y0 
		 * @param z0 
		 * @param x1  {int} 终点坐标
		 * @param y1 
		 * @param z1 
		 * @param visitor  通知观察者，并且返回是否继续，false就退出遍历
		 */
		 static travelLine(x0:number, y0:number, z0:number, x1:number, y1:number, z1:number, visitor:Function/*(x:Number,y:Number,z:Number)=>boolean*/):void{
			x0=x0|0;  y0=y0|0; z0=z0|0;
			x1=x1|0;  y1=y1|0; z1=z1|0;

			//确定前进方向
			var sx = x1 > x0 ? 1 : x1 < x0 ? -1 : 0;
			var sy = y1 > y0 ? 1 : y1 < y0 ? -1 : 0;
			var sz = z1 > z0 ? 1 : z1 < z0 ? -1 : 0;

			var dx = Math.abs(x1-x0);
			var dy = Math.abs(y1-y0);
			var dz = Math.abs(z1-z0);
			//x方向走过一格所用的时间。 如果起点和终点不在中心，则deltaX 的计算为 实际 1/实际格子数 实际格子数是浮点数，并且下面的maxX也要做调整
			var deltaX = dx>0?1.0/dx:10000;
			var deltaY = dy>0?1.0/dy:10000;
			var deltaZ = dz>0?1.0/dz:10000;

			//初始前沿。到达最近的xyz界面所需要的时间。
			var maxX = 0.5*deltaX;
			var maxY = 0.5*deltaY;
			var maxZ = 0.5 * deltaZ;
			// 如果不是从中心开始，就要用实际的值，例如x在当前格子的0.1的位置，则maxX = 0.9*deltaX

			//结束t。因为最后一个点也要画上，所以要扩展一个格子.
			//现在end判断提前，相当于可以多走一次，所以去掉enddt了
			//var endt = 1+ Math.min( Math.min(deltaX,deltaY), deltaZ);

			var cx = x0;
			var cy = y0;
			var cz = z0;
			var end=false;
			while(!end){
				end = !visitor(cx, cy, cz);
				if (end)
					break;
				//取穿过边界用的时间最少的方向，前进一格
				//同时更新当前方向的边界
				if(maxX<=maxY && maxX<=maxZ){//x最小
					cx+=sx;		// x前进一格
					end=maxX>1;  // 超过1就是完成了，先判断end。否则加了delta之后可能还没有完成就end了
					maxX+=deltaX;	// x边界推进一格
				}else if(maxY<=maxX && maxY<=maxZ){//y最小
					cy+=sy;
					end=maxY>1;
					maxY+=deltaY;
				}else{
					cz+=sz;
					end=maxZ>1;
					maxZ+=deltaZ;
				}
			}
		}
		
		/**
		 * 创建一个光线偏移路径。记录偏移。 起点不含。从0,0,0开始
		 * @param	ex	终点。
		 * @param	ey
		 * @param	ez
		 */
		 static creatLightLine(ex:number, ey:number, ez:number):VoxelLightRay {
			var ret:VoxelLightRay = new VoxelLightRay();
			ret.setEnd(ex, ey, ez);
			return ret;
		}
		
		 setEnd(ex:number, ey:number, ez:number):void {
			var ray:any[] = this.path;
			ray.length = 0;
			var first:boolean = true;
			VoxelLightRay.travelLine(0, 0, 0, ex, ey, ez, function(x, y, z) { 
				if (first) {
					first = false;
					return true;
				}
				ray.push(x, y, z);
				return true;
			} );
			// 六个面的贡献. 光线从中心发散出去，贡献就是朝向与面法线的点积。方向相反的贡献为0
			var dirlen:number = Math.sqrt(ex * ex + ey * ey + ez * ez);
			var dirx:number = this.dir.x = ex / dirlen;
			var diry:number = this.dir.y = ey / dirlen;
			var dirz:number = this.dir.z = ez / dirlen;
			var fl:any[] = this.faceLight;
			fl[0] = Math.max(dirz,0);
			fl[1] = Math.max(dirx,0);
			fl[2] = Math.max(diry,0);
			fl[3] = Math.max(-dirx,0);
			fl[4] = Math.max(-diry,0);
			fl[5] = Math.max(-dirz,0);
			this.maxLitFaceID = fl.reduce(function (maxLit:number,curv:number, curid:number):number {
				if (fl[maxLit] < curv) return curid;	// 这个函数的第一个参数是最大值的索引
				return maxLit;
			}, 0);	// 0 是表示初始 accumulate，这里传的其实是面id。 如果不传这个参数，则回调的第一次是 (data[0],data[1],1)
		}
	}

	