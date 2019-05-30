import { Vector3 } from "laya/d3/math/Vector3"
	export class VoxTriangleFiller {
		
		// 三角形信息的赋值通过直接修改成员变量完成
		private static SWAPI:number = 6;
		 v0:Uint32Array = new Uint32Array([0, 0, 0, 0, 0, 0,0]);	// x,y,z,u,v,color,tmp	tmp是用来交换用的
		 v1:Uint32Array = new Uint32Array([0, 0, 0, 0, 0, 0,0]);
		 v2:Uint32Array = new Uint32Array([0, 0, 0, 0, 0, 0,0]);
		// 为了操作里面的浮点数:u,v
		 v0f:Float32Array = new Float32Array(this.v0.buffer);
		 v1f:Float32Array = new Float32Array(this.v1.buffer);
		 v2f:Float32Array = new Float32Array(this.v2.buffer);
		
		private static tmpVec30:Vector3 = new Vector3();
		private static tmpVec31:Vector3 = new Vector3();
		private static tmpVec32:Vector3 = new Vector3();
		
		// 包围盒
		private bbxx:number = 0;
		private bbxy:number = 0;
		private bbxz:number = 0;
		
		 hascolor:boolean = false;		
		private fillCB:Function = null; 	// x:int, y:int, z:int, u:Number, v:Number
		private faceDir:number = 0;			// 0 表示投影到yz,数组中的值为 yzx， 1 投影到xz,数组中的值是xzy, 2 投影到xy,数组中的值是xyz
			
		 interpolate(min: number, max: number, gradient: number) {
			return min + (max - min) * gradient;
		}

		// y是当前y，pa,pb 是左起始线，pc,pd 是右结束线
		 processScanLine(y: number, 
				pa:Uint32Array, fpa:Float32Array, pb: Uint32Array, fpb:Float32Array, 
				pc:Uint32Array, fpc:Float32Array, pd: Uint32Array, fpd:Float32Array): void {
					
			// 水平线的处理，需要考虑谁在左边,
			// papb 可能的水平
			//   pb-----pa
			//   pa
			//   \
			//    \
			//    pb
			//  或者
			//    /pa
			//   /
			//  pb pa-----pb
			// pcpd 可能的水平
			//    pc----pd
			//        pc
			//       /
			//      /
			//      pd
			//  或者
			//     pc
			//      \
			//       \pd
			//   pd---pc
			var gradient1 = pa[1] != pb[1] ? (y - pa[1]) / (pb[1] - pa[1]) :(pa[0] > pb[0]?1:0);	// y的位置，0 在pa， 1在pb
			var gradient2 = pc[1] != pd[1] ? (y - pc[1]) / (pd[1] - pc[1]) :(pc[0] > pd[0]?0:1); // pc-pd

			var sx:number = this.interpolate(pa[0], pb[0], gradient1) | 0;	// 
			var ex:number = this.interpolate(pc[0], pd[0], gradient2) | 0;
			var sz:number = this.interpolate(pa[2], pb[2], gradient1);	//[2]是被忽略的轴，不一定是z
			var ez:number = this.interpolate(pc[2], pd[2], gradient2);
			var su:number = this.interpolate(fpa[3], fpb[3], gradient1);
			var eu:number = this.interpolate(fpc[3], fpd[3], gradient2);
			var sv:number = this.interpolate(fpa[4], fpb[4], gradient1);
			var ev:number = this.interpolate(fpc[4], fpd[4], gradient2);
			
			var x:number = 0;
			var stepx:number = ex !=sx?1 / (ex - sx):0;
			var kx:number = 0;
			var cz:number = sz;
			switch (this.faceDir) {
			case 0://yzx x是y，y是z，z是x
				for (x = sx; x <= ex; x++) {
					cz = (this.interpolate(sz, ez, kx) ) | 0;
					this.fillCB(cz, x, y, this.interpolate(su, eu, kx), this.interpolate(sv, ev, kx));
					kx += stepx;
				}
				break;
			case 1://xzy 即 x是x，y是z， z是y
				for (x = sx; x <= ex; x++) {
					cz = (this.interpolate(sz, ez, kx) ) | 0;
					this.fillCB(x, cz, y, this.interpolate(su,eu,kx), this.interpolate(sv,ev,kx));
					kx += stepx;
				}
				break;
			case 2://xyz x是x，y是y，z是z
				for (x = sx; x <= ex; x++) {
					cz = (this.interpolate(sz, ez, kx) ) | 0
					this.fillCB(x, y, cz, this.interpolate(su,eu,kx), this.interpolate(sv,ev,kx));
					kx += stepx;
				}
				break;
				default:
			}
		}

		/**
		 *  问题： 只用一个方向填充总是会有漏洞
		 * @param	cb
		 */
		 fill1(cb:Function):void {
			this.fillCB = cb;
			
			// 计算面的法线，确定忽略那个轴
			var e1e:Float32Array = VoxTriangleFiller.tmpVec30.elements;
			var e2e:Float32Array = VoxTriangleFiller.tmpVec31.elements;
			e1e[0] = this.v1[0] - this.v0[0];
			e1e[1] = this.v1[1] - this.v0[1];
			e1e[2] = this.v1[2] - this.v0[2];
			e2e[0] = this.v2[0] - this.v0[0];
			e2e[1] = this.v2[1] - this.v0[1];
			e2e[2] = this.v2[2] - this.v0[2];
			Vector3.cross(VoxTriangleFiller.tmpVec30, VoxTriangleFiller.tmpVec31, VoxTriangleFiller.tmpVec32);
			var v3e:Float32Array = VoxTriangleFiller.tmpVec32.elements;
			var nx:number = Math.abs(v3e[0]);
			var ny:number = Math.abs(v3e[1]);
			var nz:number = Math.abs(v3e[2]);
			// 化成2d三角形
			var dir:number = 0;
			if (nx >= ny && nx>= nz) {// x轴最长，总体朝向x，忽略x轴
				//zyx
				this.v0[VoxTriangleFiller.SWAPI] = this.v0[0]; this.v0[0] = this.v0[2]; this.v0[2] = this.v0[VoxTriangleFiller.SWAPI];
				this.v1[VoxTriangleFiller.SWAPI] = this.v1[0]; this.v1[0] = this.v1[2]; this.v1[2] = this.v1[VoxTriangleFiller.SWAPI];
				this.v2[VoxTriangleFiller.SWAPI] = this.v2[0]; this.v2[0] = this.v2[2]; this.v2[2] = this.v2[VoxTriangleFiller.SWAPI];
				//yzx
				this.v0[VoxTriangleFiller.SWAPI] = this.v0[0]; this.v0[0] = this.v0[1]; this.v0[1] = this.v0[VoxTriangleFiller.SWAPI];
				this.v1[VoxTriangleFiller.SWAPI] = this.v1[0]; this.v1[0] = this.v1[1]; this.v1[1] = this.v1[VoxTriangleFiller.SWAPI];
				this.v2[VoxTriangleFiller.SWAPI] = this.v2[0]; this.v2[0] = this.v2[1]; this.v2[1] = this.v2[VoxTriangleFiller.SWAPI];
			}else if (ny >= nx && ny>= nz) {// y轴最长
				//xzy
				dir = 1;
				this.v0[VoxTriangleFiller.SWAPI] = this.v0[1]; this.v0[1] = this.v0[2]; this.v0[2] = this.v0[VoxTriangleFiller.SWAPI];
				this.v1[VoxTriangleFiller.SWAPI] = this.v1[1]; this.v1[1] = this.v1[2]; this.v1[2] = this.v1[VoxTriangleFiller.SWAPI];
				this.v2[VoxTriangleFiller.SWAPI] = this.v2[1]; this.v2[1] = this.v2[2]; this.v2[2] = this.v2[VoxTriangleFiller.SWAPI];
			}else {	// z轴最长
				//xyz
				dir = 2;
			}
			this.faceDir = dir;
			
			this.fill_2d();
		}
		
		/**
		 * 3个点已经整理好了，只处理xy就行
		 */
		 fill_2d():void {
			// 三个点按照2d的y轴排序，下面相当于是展开的冒泡排序,p0的y最小
			var temp:any[] ;
			if (this.v0[1] > this.v1[1]) {
				temp = this.v1; this.v1 = this.v0; this.v0 = temp;
				temp = this.v1f; this.v1f = this.v0f; this.v0f = temp;
			}

			if (this.v1[1] > this.v2[1]) {
				temp = this.v1; this.v1 = this.v2; this.v2 = temp;
				temp = this.v1f; this.v1f = this.v2f; this.v2f = temp;
			}

			if (this.v0[1] > this.v1[1]) {
				temp = this.v1; this.v1 = this.v0; this.v0 = temp;
				temp = this.v1f; this.v1f = this.v0f; this.v0f = temp;
			}
			
			var y:number = 0;
			var turnDir:number = (this.v1[0] - this.v0[0]) * (this.v2[1] - this.v0[1]) - (this.v2[0] - this.v0[0]) * (this.v1[1] - this.v0[1]);	 
			if (turnDir == 0) {	// 同一条线上
				
			}else if ( turnDir > 0) {// >0 则v0-v2在v0-v1的右边，即向右拐
				// v0
				// -
				// -- 
				// - -
				// -  -
				// -   - v1
				// -  -
				// - -
				// -
				// v2
				for (y = this.v0[1]; y <= this.v2[1]; y++) {
					
					if (y < this.v1[1]) {
						this.processScanLine(y, this.v0, this.v0f, this.v2, this.v2f, this.v0, this.v0f, this.v1, this.v1f);
					}
					else {
						this.processScanLine(y, this.v0, this.v0f, this.v2, this.v2f, this.v1, this.v1f, this.v2, this.v2f);
					}
				}
			}else {	// 否则，左拐
				//       v0
				//        -
				//       -- 
				//      - -
				//     -  -
				// v1 -   - 
				//     -  -
				//      - -
				//        -
				//       v2
				for (y = this.v0[1]; y <= this.v2[1]; y++) {
					if (y < this.v1[1]) {
						this.processScanLine(y, this.v0, this.v0f, this.v1, this.v1f, this.v0, this.v0f, this.v2, this.v2f);
					}
					else {
						this.processScanLine(y, this.v1, this.v1f, this.v2, this.v2f, this.v0, this.v0f, this.v2, this.v2f);
					}
				}
			}
		}
		
		/**
		 * 采用三个方向各扫描一次的方法
		 * @param	cb
		 */
		 fill(cb:Function):void {
			this.fillCB = cb;
			//fill_xy();
			this.faceDir = 2;
			this.fill_2d();
			
			//fill_xz();
			//xzy
			this.v0[VoxTriangleFiller.SWAPI] = this.v0[1]; this.v0[1] = this.v0[2]; this.v0[2] = this.v0[VoxTriangleFiller.SWAPI];
			this.v1[VoxTriangleFiller.SWAPI] = this.v1[1]; this.v1[1] = this.v1[2]; this.v1[2] = this.v1[VoxTriangleFiller.SWAPI];
			this.v2[VoxTriangleFiller.SWAPI] = this.v2[1]; this.v2[1] = this.v2[2]; this.v2[2] = this.v2[VoxTriangleFiller.SWAPI];
			this.faceDir = 1;
			this.fill_2d();

			// 恢复顶点
			this.v0[VoxTriangleFiller.SWAPI] = this.v0[1]; this.v0[1] = this.v0[2]; this.v0[2] = this.v0[VoxTriangleFiller.SWAPI];
			this.v1[VoxTriangleFiller.SWAPI] = this.v1[1]; this.v1[1] = this.v1[2]; this.v1[2] = this.v1[VoxTriangleFiller.SWAPI];
			this.v2[VoxTriangleFiller.SWAPI] = this.v2[1]; this.v2[1] = this.v2[2]; this.v2[2] = this.v2[VoxTriangleFiller.SWAPI];
			
			//fill_yz();
			//zyx
			this.v0[VoxTriangleFiller.SWAPI] = this.v0[0]; this.v0[0] = this.v0[2]; this.v0[2] = this.v0[VoxTriangleFiller.SWAPI];
			this.v1[VoxTriangleFiller.SWAPI] = this.v1[0]; this.v1[0] = this.v1[2]; this.v1[2] = this.v1[VoxTriangleFiller.SWAPI];
			this.v2[VoxTriangleFiller.SWAPI] = this.v2[0]; this.v2[0] = this.v2[2]; this.v2[2] = this.v2[VoxTriangleFiller.SWAPI];
			//yzx
			this.v0[VoxTriangleFiller.SWAPI] = this.v0[0]; this.v0[0] = this.v0[1]; this.v0[1] = this.v0[VoxTriangleFiller.SWAPI];
			this.v1[VoxTriangleFiller.SWAPI] = this.v1[0]; this.v1[0] = this.v1[1]; this.v1[1] = this.v1[VoxTriangleFiller.SWAPI];
			this.v2[VoxTriangleFiller.SWAPI] = this.v2[0]; this.v2[0] = this.v2[1]; this.v2[1] = this.v2[VoxTriangleFiller.SWAPI];
			this.faceDir = 0;
			this.fill_2d();			
			
		}
	}

	