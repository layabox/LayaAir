import { VoxelColor } from "././VoxelColor";
/**
	 * 给 median cut 算法用的包围盒。
	 */
	export class ColorBoundingBox {
		private minr:number = 255;
		private ming:number = 255;
		private minb:number = 255;
		private maxr:number = 0;
		private maxg:number = 0;
		private maxb:number = 0;
		private bc:VoxelColor[] = [];

		/**
		 * 
		 * @param	colors 颜色统计数组。w是颜色个数。由于需要排序，所以不方便直接用数组
		 */
		constructor(colors:VoxelColor[]){
			for (var i:number = 0, sz:number = colors.length; i < sz; i++) {
				var c:VoxelColor = colors[i];
				this.minr = Math.min(c.r, this.minr);
				this.ming = Math.min(c.g, this.ming);
				this.minb = Math.min(c.b, this.minb);

				this.maxr = Math.max(c.r, this.maxr);
				this.maxg = Math.max(c.g, this.maxg);
				this.maxb = Math.max(c.b, this.maxb);
				//bc.push({r: c.r, g: c.g, b: c.b, w: c.w});		
			}
			this.bc = colors;// 注意是直接引用。
		}

		/**
		 * 从数据中间二分
		 */
		 split():any{
			var dr:number = this.maxr - this.minr;
			var dg:number = this.maxg - this.ming;
			var db:number = this.maxb - this.minb;

			var dir:string = 'r';
			if( dg > dr ) {
				if( db > dg ) dir = 'b';
				else dir = 'g';
			}
			else {
				if( db > dr ) dir = 'b';
			}

			switch( dir ) {
				case 'r':{
					// sort the colors along r axis
					this.bc.sort( function(a:VoxelColor, b:VoxelColor):number {return a.r - b.r;} );
					break;
				}
				case 'g':{
					this.bc.sort( function(a:VoxelColor, b:VoxelColor):number {return a.g - b.g;} );
					break;
				}
				case 'b':{
					this.bc.sort( function(a:VoxelColor, b:VoxelColor):number {return a.b - b.b;} );
					break;
				}
			}

			// TODO 怎么没有处理颜色数量不够的情况
			var mid:number = this.bc.length/2;
			var lBox:ColorBoundingBox = new ColorBoundingBox(this.bc.slice(0, mid) as VoxelColor[]);
			var rBox:ColorBoundingBox = new ColorBoundingBox(this.bc.slice(mid) as VoxelColor[]);

			return {
				left: lBox,
				right: rBox
			}
		}

		/**
		 * 求box中颜色的平均数
		 * @param idx  当前所属的调色板索引,同时修改保存的对象的调色板索引可以省掉后面的颜色转调色板
		 */
		 meanColor( idx:number, out:VoxelColor ):VoxelColor {
			var r:number = 0, g:number = 0, b:number = 0, wSum:number = 0;
			var colors:any[] = (<any[]>this.bc );
			for (var i:number = 0, len:number=colors.length; i < len; i++) {
				var o:VoxelColor = colors[i];
				var w:number = o.w;        // w是重复次数，或者这里放了多少个相同颜色
				r += o.r * w;
				g += o.g * w;
				b += o.b * w;
				wSum += w;
				if (o.obj) {
					o.obj[0] = idx;
				}
			}
			if (wSum === 0) {
				r = g = b = 0;
			}else{
				r /= wSum;
				g /= wSum;
				b /= wSum;
			}
			out.r = Math.round(r);
			out.g = Math.round(g);
			out.b = Math.round(b);
			return out;
		}
	}

	