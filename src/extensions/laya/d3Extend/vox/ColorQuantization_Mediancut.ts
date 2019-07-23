import { VoxelColor } from "./VoxelColor";
import { ColorBoundingBox } from "./ColorBoundingBox";
/**
	 * 用median cut算法实现的颜色量化算法，即真彩转256色调色板
	 * 源码来自：
	 * https://github.com/phg1024/ImageProcJS/blob/master/algorithms/mediancut.js
	 */
	export class  ColorQuantization_Mediancut {
		private tmpCol:VoxelColor = new VoxelColor(0, 0, 0, null);
		/**
		 * mediancut 颜色分类法
		 * @param src rgb格式的数组
		 * @param n  颜色数目
		 * @return {uint8[]}  256色调色板. 每个占3个字节
		 */
		 mediancut( src:Uint8Array, n:number = 256 ):number[] {
			var incolorNum:number = src.length/3;
			// 统计
			var inColors :any = { };
			var hex:string;
			var ci:number = 0;
			var i:number = 0;
			for(i=0; i<incolorNum; i++){
				var r:number=src[ci++];
				var g:number=src[ci++];
				var b:number=src[ci++];
				hex = ((r<<16)|(g<<8)|b).toString(16);
				if( !(hex in inColors) ) {
					inColors[hex] = 1;
				}else {
					inColors[hex] ++;		// 统计相同颜色的个数
				}        
			}

			var tmp:VoxelColor[] = [];
			for (hex in inColors) {
				var intv:number = parseInt(hex,16);
				var c:VoxelColor =  new VoxelColor(intv>>>16, (intv>>>8)&0xff, intv&0xff,null);
				c.w = inColors[hex];

				tmp.push(c);
			}

			// build the mean cut tree
			var root:ColorBoundingBox = new ColorBoundingBox( tmp );

			var Q:ColorBoundingBox[] = [];
			Q.push(root);
			// 每次都是把所有的节点切成两半，所以结果一定是2的n次方
			while(Q.length < n ) {
				// recursively refine the tree
				var cur:ColorBoundingBox = Q[0];
				Q.shift();

				var children:any = cur.split();

				Q.push(children.left);
				Q.push(children.right);
			}

			// 这时候Q中保留下来的都是还没有拆分的
			var colors:number[] = [];
			for(i=0;i< Q.length;i++) {
				Q[i].meanColor(i,this.tmpCol);
				//colors.push( Q[i].meanColor() );
				colors.push(this.tmpCol.r,this.tmpCol.g,this.tmpCol.b);
			}
			return colors;
		}

		// 已经统计好各个颜色的数量了，这样可以快速一些。直接返回 Uint8Array
		 mediancut1( colorData:any, colNum:number, n:number = 256 ):Uint8Array {
			var ret8:Uint8Array = new Uint8Array(n * 3);
			
			var colors:VoxelColor[] = [];	// r,g,b,num
			
			var ci:number = 0;
			for (let c  in colorData) {
				var ic:number = (c as any) | 0;
				var b:number=((ic>>>10)&0x1f);// 用的直接是555的
				var g:number=((ic>>>5)&0x1f);
				var r:number = (ic & 0x1f);
				var o:any = colorData[c];
				var cc:VoxelColor = colors[ci] = new VoxelColor(r, g, b, o);
				cc.w = o[1];
				ci++;
			}

			// build the mean cut tree
			var root:ColorBoundingBox = new ColorBoundingBox( colors );

			var Q:ColorBoundingBox[] = [];
			Q.push(root);
			// 每次都是把所有的节点切成两半，所以结果一定是2的n次方
			while(Q.length < n ) {
				// recursively refine the tree
				var cur:ColorBoundingBox = Q[0];
				Q.shift();

				var children:any = cur.split();

				Q.push(children.left);
				Q.push(children.right);
			}

			// 这时候Q中保留下来的都是还没有拆分的
			for(var i:number=0;i< Q.length;i++) {
				Q[i].meanColor(i,this.tmpCol);
				ret8[i * 3] = this.tmpCol.r;
				ret8[i * 3 + 1] = this.tmpCol.g;
				ret8[i * 3 + 2] = this.tmpCol.b;
			}
			return ret8;
		}		
		
		/**
		 * 传入rgb，返回调色板中最接近的index
		 * @param	r
		 * @param	g
		 * @param	b
		 * @param	pal
		 * @return {int} 调色板索引
		 */
		 getNearestIndex( r:number, g:number, b:number, pal:number[]):number{
			var minV:number=Number.MAX_VALUE;
			var minIdx:number=0;
			var pi:number=0;
			for(var i:number=0; i<256; i++){
				var pr:number = pal[pi++];
				var pg:number = pal[pi++];
				var pb:number = pal[pi++];
				var dr:number = pr - r;
				var dg:number = pg - g;
				var db:number = pb - b;
				var dist:number = Math.sqrt(dr*dr+dg*dg+db*db);
				if(dist<minV){
					minIdx=i;
					minV=dist;
				}
			}
			return minIdx;
		}

		 trueColorToIndexColor(img:Uint8Array, pal:number[]):any{
			var ptNum:number = img.length/4;
			var ret:Uint8Array = new Uint8Array(ptNum);
			var retImg:Uint8Array = new Uint8Array(img.length);
			var pi:number=0;
			for(var i:number=0; i<ptNum; i++){
				var r:number = img[pi++];
				var g:number = img[pi++];
				var b:number = img[pi++];
				pi++;
				var idx:number = this.getNearestIndex(r,g,b, pal);
				ret[i] = idx;
				retImg[i*4]=pal[idx*3];
				retImg[i*4+1]=pal[idx*3+1];
				retImg[i*4+2]=pal[idx*3+2];
				retImg[i*4+3]=255;
			}
			return {idxdt:ret, idximg:retImg };
		}
	}

	