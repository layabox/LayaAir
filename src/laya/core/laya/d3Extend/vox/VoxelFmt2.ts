import { EncodeBase } from "././EncodeBase";
import { Laya } from "Laya";
import { ColorQuantization_Mediancut } from "././ColorQuantization_Mediancut";
import { CubeSprite3D } from "../Cube/CubeSprite3D"
	import { Browser } from "laya/utils/Browser"
	import { Byte } from "laya/utils/Byte"
	
	/**
	 * 格式：
	 * 	每个xz按照16X16为一段组织。每一段保存的数据可以超出本段
	 */
	export class VoxelFmt2 extends EncodeBase {
		 static version:number = 4;
		private datainst:Uint8Array = null; 	//复制的压缩数据。因为要修改，所以复制一下
		private xsize:number = 0;
		private ysize:number = 0;
		private zsize:number = 0;
		private xzsize:number = 0;
		private usePal:boolean = false;
		private isLocal:boolean = false;
		private callBk:any;
		private iy:number;
		// encode3 异步处理相关变量
		private blockArr:any[]; 	// 待处理数据
		private palColor:any;
		private blocki:number  = 0; 	// 异步处理到哪一步了
		private blockNum:number = 0; 	// 异步处理总量
		
		 curver:number = 0;
		 static ZEROPOS:number = 1600;
		 flagstring:string = 'LayaBoxVox0002';	// 加上长度凑4的整数倍
		
		
		constructor(encode:boolean=true,rtnFun:Function=null) {
			super(encode);
			this.callBk = rtnFun;
		}
		
		/**
		 * 返回一个最长的方向和个数。 这时候可能是Uint8Array也可能是Uint16Array, 所以可以直接处理，不用自己合并。
		 * 注意不要越过边界
		 * @param	x
		 * @param	y
		 * @param	z
		 * @return
		 */
		 getAndRmoveMaxLen(x:number, y:number, z:number):number {
			var ex:number = x + 63;	//每个区域64大小，从下一个开始，所以63。 因为2bit方向6bit长度
			var ey:number = y + 63;
			var ez:number = z + 63; 
			ex = ex > this.xsize-1?this.xsize-1:ex;
			ey = ey > this.ysize-1?this.ysize-1:ey;
			ez = ez > this.zsize-1?this.zsize-1:ez;
			var xlen:number = 0;	// 不算自己重复的次数。这样解码的时候容易
			var ylen:number = 0;
			var zlen:number = 0;
			var i:number = 0;
			var bpos:number = x + z * this.xsize+y * this.xzsize;
			var cval:number = this.datainst[bpos];
			var cpos:number = bpos;
			for (i = x; i < ex; i++) {
				if ( this.datainst[++cpos] != cval) break;
				xlen++;
			}
			
			if(!this.isLocal){
				cpos = bpos;
				for (i = y; i < ey; i++) {
					if (this.datainst[(cpos+=this.xzsize)] != cval) break;
					ylen++;
				}
				
				cpos = bpos;
				for ( i = z; i < ez; i++) {
					if (this.datainst[(cpos+=this.xsize)] != cval) break;
					zlen++;
				}
			}
			
			// 清理数据，返回结果。 当前位置不用清理，因为不会反向查找
			cpos = bpos;
			if (xlen >= ylen && xlen >= zlen) {
				for (i = x; i < x + xlen; i++) {
					this.datainst[++cpos] = 0;
				}
				return xlen;
			}
			if (ylen >= xlen && ylen >= zlen) {
				for (i = y; i < y + ylen; i++) {
					cpos += this.xzsize;
					this.datainst[cpos] = 0;
				}
				return (1<<6)|ylen;
			}
			if (zlen >= xlen && zlen >= ylen) {
				for (i = z; i < z + zlen; i++) {
					cpos += this.xsize;
					this.datainst[cpos] = 0;
				}
				return (2<<6)|zlen;
			}
			return 0;
		}
		
		/**
		 * 处理一个16x16的平面块
		 * 这个数据块可能是一个局部块。xoff，yoff，zoff表示这个相对全局的位置。 xyz是局部块内的位置
		 * @param	x
		 * @param	y
		 * @param	z
		 * @param	xoff	
		 * @param	yoff
		 * @param	zoff
		 */
		// 
		 encodeAArea(x:number, y:number, z:number, xoff:number=0, yoff:number=0, zoff:number=0):void {
			// x:uint16, y:uint16, z:uint16, datasz:uint16, data:buffer
			// data:{offx:4,offz:4, dir:2, repeat:6, color:byte}[]
			this.needSize(1024);	//随意大一点 >16*16*3+8
			this.dataPos = ((this.dataPos + 1) >> 1) << 1;	// 按照2对齐。
			var curU16Pos:number = this.dataPos >> 1;
			this.uint16Data[curU16Pos++] = x + xoff;
			this.uint16Data[curU16Pos++] = z + zoff;
			this.uint16Data[curU16Pos++] = y + yoff;
			this.dataPos += 6;
			var dataSizePos:number = this.dataPos; this.dataPos += 2;		// 先占着位置
			var zmax:number = Math.min(this.zsize, z + 16);
			var xmax:number = Math.min(this.xsize, x + 16);
			var offx:number = 0;
			var offz:number = 0;
			var y1:number = y * this.xzsize;
			for (var cz:number = z; cz < zmax; cz++) {
				offx = 0;
				var cp:number = x + cz * this.xsize+y1;
				for (var cx:number = x; cx < xmax; cx++) {
					var val:number = this.datainst[cp++];
					//问题怎么表示不存在。先用0表示把
					if(val!=0){
						var dt:number = this.getAndRmoveMaxLen(cx, y, cz);
						this.uint8Data[this.dataPos++] = (offx << 4) | offz;
						this.uint8Data[this.dataPos++] = dt;
						if(this.usePal)
							this.uint8Data[this.dataPos++] = val;
						else {
							this.uint8Data[this.dataPos++] = val&0xff;
							this.uint8Data[this.dataPos++] = (val>>>8);
						}
					}
					offx++;
				}
				offz++;
			}
			this.dataView.setUint16(dataSizePos, (this.dataPos-dataSizePos-2),true);	//-2 是因为保存大小所占的不算，只要纯数据
		}
		
		/**
		 * 压缩数据。
		 * @param	pal  调色板数据。如果没有的话，表示数据是16位的。调色板只有rgb没有alpha
		 * @param	data {Uint8Array|uint16Array}	格子数组。大小是 xsize*ysize*zsize 字节。 每个字节保存的是调色板索引。
		 * @param	xsize  data的x方向的大小
		 * @param	ysize
		 * @param	zsize
		 * @return
		 */
		 encode(blockarr:any[], pal:ArrayBuffer , data:Uint8Array,  xsize:number, ysize:number, zsize:number, minx:number=0, miny:number=0, minz:number=0, isLocal:boolean=false):ArrayBuffer {
			this.isLocal = isLocal;
			this.xsize = xsize;
			this.ysize = ysize;
			this.zsize = zsize;
			this.xzsize = xsize * zsize;
			// 标识
			var str:string[] = this.flagstring.split('') as string[];
			var strlen:number = str.length;
			this.dataView.setUint16(0, strlen,true);
			this.dataPos = 2;
			for (var i:number = 0; i < strlen; i++){
				this.dataView.setUint8(this.dataPos ++, str[i].charCodeAt(0));
			}
			// 版本号
			this.dataView.setUint32(this.dataPos,VoxelFmt2.version);
			this.dataPos += 4;
			// 调色板
			this.dataView.setUint32(this.dataPos, pal?pal.byteLength:0);	// 调色板大小是byte
			this.dataPos += 4;
			if(pal){
				if (pal.byteLength != 256 * 3) throw 'palette size error';
				this.appendBuffer( pal);
				this.usePal = true;
			}
			
			if (data.length != xsize * ysize * zsize )
				throw "data size error";
				
			// 数据
			this.dataView.setInt16(this.dataPos, minx); this.dataPos += 2;
			this.dataView.setInt16(this.dataPos, miny); this.dataPos += 2;
			this.dataView.setInt16(this.dataPos, minz); this.dataPos += 2; 
			
			this.dataView.setUint16(this.dataPos, xsize); this.dataPos += 2;
			this.dataView.setUint16(this.dataPos, ysize); this.dataPos += 2;
			this.dataView.setUint16(this.dataPos, zsize); this.dataPos += 2; 
			
			if (this.usePal) {
				this.datainst = new Uint8Array(xsize * ysize * zsize);
				this.datainst.set(data);
			}
			else {
				this.datainst = (<Uint8Array>(new Uint16Array(xsize * ysize * zsize)) );
				this.datainst.set( new Uint16Array(data.buffer,0,data.length));
			}
			
			
			var x:number = 0;
			var y:number = 0;
			var z:number = 0;
			
			this.iy = 0;
			if(this.callBk!=null){
				Laya.timer.frameLoop(1, this, this._encode);
			}else {
				for (y =0; y < ysize; y++) {
					for (z =0; z < zsize; z += 16) {
						for ( x =0; x < xsize; x += 16) {
							// 当前处理一个xz 16x16的块
							this.encodeAArea(x, y, z);
						}
					}
				}
				return this.dataBuffer.slice(0, this.dataPos);
			}
			return null;
		}
		
		private _encode():void
		{
			var tm:number = Browser.now();
			for (;  this.iy < this.ysize; this.iy++) {
				for (var z:number=0; z < this.zsize; z += 16) {
					for (var x:number=0; x < this.xsize; x += 16) {
						// 当前处理一个xz 16x16的块
						this.encodeAArea(x, this.iy, z);
					}
				}
				if ( (Browser.now() - tm) >= 20)
				{
					this.iy++;
					break;
				}
			}
			if (this.callBk && this.iy ===this.ysize)
			{
				this.callBk.call(null, new Byte(this.dataBuffer.slice(0, this.dataPos)));
				Laya.timer.clear(this, this._encode);
			}
		}
		
		/**
		 * 按照32x32x32分块来压缩，这样可以避免内存太大的问题
		 * 
		 * @param	arr 分块数组，每个元素又是一个数组，{x,y,z,color}[][]
		 * @return
		 */
		 encode3(arr:any[], local:boolean, usePal:boolean = true):ArrayBuffer {
			this.blockArr = arr;
			var minx:number = Number.MAX_VALUE;
			var miny:number = Number.MAX_VALUE;
			var minz:number = Number.MAX_VALUE;
			var maxx:number = 0;
			var maxy:number = 0; 
			var maxz:number = 0;
			
			this.usePal = usePal;
			this.isLocal = local;
			this.xsize = this.ysize = this.zsize = 32;	// 这个不再表示实际大小，只是一个32x32x32块的大小。因为有的函数需要这个变量，例如 encodeAArea 所以模拟一下
			this.xzsize = 32 * 32;
			var x:number, y:number, z:number;
			
			// 标识
			var str:string[] = this.flagstring.split('') as string[];
			var strlen:number = str.length;
			this.dataView.setUint16(0, strlen,true);
			this.dataPos = 2;
			var i:number = 0;
			for (i = 0; i < strlen; i++){
				this.dataView.setUint8(this.dataPos ++, str[i].charCodeAt(0));
			}
			// 版本号
			this.dataView.setUint32(this.dataPos,VoxelFmt2.version);
			this.dataPos += 4;
			
			i = 0;
			var ci:number = 0;
			console.time('handl color and size');
			// 收集颜色信息
			if(usePal){
				var pal256:Uint8Array = new Uint8Array(256 * 3);
				var colors:any[] = [];	// 原始颜色。TODO 调色板生成改成直接使用 palColor
				this.palColor = { };
				this.palColor[0] = 1;
				var palCount:number = 1;
				for (var bi:number = 0; bi < arr.length; bi++) {
					var cb:any[] = arr[bi];//一个块
					var cnum:number = cb.length / 4;	//x,y,z,color
					ci = 0;
					for (i = 0; i < cnum; i++) {
						x = cb[ci++];
						y = cb[ci++];
						z = cb[ci++];
						if (minx > x) minx = x;
						if (miny > y) miny = y;
						if (minz > z) minz = z;
						if (maxx < x) maxx = x;
						if (maxy < y) maxy = y;
						if (maxz < z) maxz = z;
						
						var col:number = cb[ci++];
						//colors.push(b,g,r);
						var statc:any[] = this.palColor[col];
						if (!statc) {
							if(palCount<256){
								var r:number=((col>>>10)&0x1f);// 存的时候颜色暗点也没事
								var g:number=((col>>>5)&0x1f);
								var b:number=(col&0x1f);
								var pst:number = palCount * 3;
								pal256[pst] = b; 
								pal256[pst + 1] = g;
								pal256[pst + 2] = r;
							}
							this.palColor[col] =[palCount++,1]; //idx, count, 以后调色板算法会改idx
						}else {
							statc[1]++;	// 增加统计个数
						}
					}
				}			
				// 生成调色板
				var pal:Uint8Array = pal256;
				if (palCount >= 256){
					var reducer:ColorQuantization_Mediancut = new ColorQuantization_Mediancut();
					pal = reducer.mediancut1(this.palColor, palCount, 256);
					/*
					for (var col:String in palColor)
						palColor[col] = reducer.getNearestIndex((col & 0x1f), ((col >>> 5) & 0x1f), ((col >>> 10) & 0x1f), pal);
					*/
				}
			}else {
				for (bi= 0; bi < arr.length; bi++) {
					cb = arr[bi];//一个块
					cnum = cb.length / 4;	//x,y,z,color
					ci = 0;
					for (i = 0; i < cnum; i++) {
						x = cb[ci++];
						y = cb[ci++];
						z = cb[ci++];
						if (minx > x) minx = x;
						if (miny > y) miny = y;
						if (minz > z) minz = z;
						if (maxx < x) maxx = x;
						if (maxy < y) maxy = y;
						if (maxz < z) maxz = z;
						ci++;
					}
				}			
			}
			// 调色板
			this.dataView.setUint32(this.dataPos, usePal?pal.byteLength:0,true);	// 调色板大小是byte
			this.dataPos += 4;
			if(usePal){
				if (pal.byteLength != 256 * 3) throw 'palette size error';
				this.appendBuffer( pal);
			}
			
			console.timeEnd('handl color and size');			
			console.time('handl data');
			// 记录偏移和大小
			//dataView.setInt16(dataPos, minx-ZEROPOS,true); dataPos += 2;
			//dataView.setInt16(dataPos, miny-ZEROPOS,true); dataPos += 2;
			//dataView.setInt16(dataPos, minz-ZEROPOS,true); dataPos += 2; 
			this.dataPos += 6;//min值不记录了。
			
			this.dataView.setUint16(this.dataPos, maxx-minx+1,true); this.dataPos += 2;
			this.dataView.setUint16(this.dataPos, maxy-miny+1,true); this.dataPos += 2;
			this.dataView.setUint16(this.dataPos, maxz-minz+1,true); this.dataPos += 2; 
			
			// 构造一个块，以块为单位压缩. TODO 异步
			if (usePal) this.datainst = new Uint8Array(32 * 32 * 32);
			else this.datainst = (<Uint8Array>(new Uint16Array(32 * 32 * 32) ) );
			
			this.blockNum = arr.length;
			this.blocki = 0;
			
			if (this.callBk) {
				Laya.timer.frameLoop(1, this, this._encode3Step);
			}
			else {
				while(this.blocki < this.blockNum) {
					this._encode3Step();
				}
				console.timeEnd('handl data');
				return this.dataBuffer.slice(0, this.dataPos);
			}
			return null;
		}
		
		/**
		 * 异步处理函数。一次处理一个块。
		 */
		 _encode3Step():void {
			var w2:number = 32 * 32;
			//一个块
			var cb:any[] = this.blockArr[this.blocki++];
			var cnum:number = cb.length / 4;	//x,y,z,color
			// 根据第一个位置确定块的位置。这时候还有1600在
			var stx:number = cb[0] & 0xffe0;
			var sty:number = cb[1] & 0xffe0;
			var stz:number = cb[2] & 0xffe0;
			var ci:number = 0;
			var x:number, y:number, z:number;
			for (var i:number = 0; i < cnum; i++) {
				x = cb[ci++] - stx;
				y = cb[ci++] - sty;
				z = cb[ci++] - stz;
				var col:number =   cb[ci++];
				if(this.usePal){
					var colidx:number = this.palColor[col][0];
					this.datainst[x + z * 32 + y * w2] = colidx;
				}else {
					this.datainst[x + z * 32 + y * w2] = col;
				}
			}
			// bdata 组成完毕，可以压缩
			for (y=0; y < this.ysize; y++) {
				for (z =0; z < this.zsize; z += 16) {
					for (x =0; x < this.xsize; x += 16) {
						this.encodeAArea(x, y, z, stx-VoxelFmt2.ZEROPOS, sty-VoxelFmt2.ZEROPOS, stz-VoxelFmt2.ZEROPOS);	
					}
				}
			}
			// 清理块
			((<any>this.datainst )).fill(0);
			if (this.blocki >= this.blockNum) {
				//完成了
				if (this.callBk) {
					console.timeEnd('handl data');
					this.callBk.call(null, new Byte(this.dataBuffer.slice(0, this.dataPos)));
					Laya.timer.clear(this, this._encode3Step);
				}
			}
		}
		
		 decode(data:ArrayBuffer, cb:any):void {
			var dv:DataView = new DataView(data);
			var datapos:number = 0;
			var flag:string='';
			var flaglen:number = dv.getUint16(0,true);
			datapos = 2;
			for (var si:number; si < flaglen; si++) {
				flag += String.fromCharCode(dv.getUint8(datapos++));
			}
			if (flag != this.flagstring){
				console.error('bad voxel file ');
				return;
			}
			var ver:number = this.curver = dv.getUint32(datapos);	// 忘了用小头了，一失足啊，还好只一次。
			datapos += 4;
			if (ver <2 ) {
				console.log('bad version :'+ver);
				return;
			}
			var le:boolean = ver >= 4;
			var palLen:number = dv.getUint32(datapos,le);
			datapos += 4;
			var pal:Uint8Array = null;
			if (palLen > 0) {	//TODO 用实际大小
				this.usePal = true;
				pal = new Uint8Array(data, datapos, 256 * 3);
				cb.cb_setPalette(pal);
				datapos +=  256 * 3;
			}
			
			var minx:number=0, miny:number=0, minz:number=0;
			if (ver >= 3) {
				minx = dv.getInt16(datapos,le); datapos += 2;
				miny = dv.getInt16(datapos,le); datapos += 2;
				minz = dv.getInt16(datapos,le); datapos += 2;
			}
			
			this.xsize = dv.getUint16(datapos,le); datapos += 2;
			this.ysize = dv.getUint16(datapos,le); datapos += 2;
			this.zsize = dv.getUint16(datapos,le); datapos += 2;
			this.xzsize = this.xsize * this.zsize;
			cb.cb_setSize(this.xsize, this.ysize, this.zsize);
			while (datapos < data.byteLength) {
				//base pos
				ver >= 4 && (datapos = (datapos + 1)>>>1<<1);// 版本4以后，数据要按照2对齐
				var xbase:number = dv.getInt16(datapos,le)+minx;	datapos += 2;
				var zbase:number = dv.getInt16(datapos,le)+minz;	datapos += 2;
				var cy:number = dv.getInt16(datapos,le)+miny; datapos += 2;
				//console.log('base', xbase, zbase, cy);
				var areaDataSz:number = dv.getUint16(datapos,le); datapos += 2;	//本区域一共有多少数据
				var areaDV:Uint8Array = new Uint8Array(data, datapos);
				var areaDataPos:number = 0;
				while (areaDataPos < areaDataSz) {
					var off:number = areaDV[areaDataPos++];
					var dtinfo:number = areaDV[areaDataPos++];
					var val:number = areaDV[areaDataPos++];
					var val1:number = 0;
					if (!this.usePal) {
						val1 = areaDV[areaDataPos++];	//由于没有按照16bit对齐，只能自己处理uint16了
						val += val1 << 8;
					}
					
					var cx:number = xbase+(off >>> 4)+minx;
					var cz:number = zbase+(off & 0xf)+minz;
					var dir:number = dtinfo >>> 6;
					var repeatNum:number = dtinfo & 0x3f;
					//console.log('pos=', datapos + areaDataPos);
					var cpos:number = datapos + areaDataPos;
					if ( cb.cb_addRepeat) {// 优先调用连续添加的接口
						cb.cb_addRepeat(cx, cy, cz, dir, repeatNum, val, cpos);
					}else if (cb.cb_addData) {	// 如果没有连续添加的接口，就调用单个添加的
						cb.cb_addData(cx, cy, cz, val);
						if (repeatNum > 0 ) {
							var ri:number = 0;
							switch(dir) {
							case 0://x
								for (ri = 1; ri <= repeatNum; ri++) {
									cb.cb_addData(cx + ri, cy, cz, val);
								}
								break;
							case 1://y
								for (ri = 1; ri <= repeatNum; ri++) {
									cb.cb_addData(cx, cy+ri, cz, val);
								}
								break;
							case 2://z
								for (ri = 1; ri <= repeatNum; ri++) {
									cb.cb_addData(cx , cy, cz+ri, val);
								}
								break;
							default:
								console.error('addRepeatData bad dir!');
							}
						}
					}
				}
				datapos += areaDataSz;
			}
		}
		
		//cb
		 cb_setSize(x:number, y:number, z:number):void {
		}
		 cb_setPalette(pal:Uint8Array):void {
		}
		 cb_add(x:number, y:number, z:number, value:number):void {
		}
		 cb_addRepeat(x:number, y:number, z:number, dir:number, num:number, color:number):void {
		}
		//cb
		
		 getTestData(x:number,y:number,z:number):Uint8Array {
			var ret:Uint8Array = new Uint8Array(x * y * z);
			var ci:number = 0;
			for (var cz:number = 0; cz < z; cz++) {
				for (var cy:number = 0; cy < y; cy++) {
					for (var cx:number = 0; cx < x; cx++) {
						if (cz == 50) ret[ci] = 10;
						else ret[ci] = 0;
						ci++;
					}
				}
			}
			/*
			ret.forEach(function(v:int, i) { 
				ret[i] = 12;
			} );
			*/
			return ret;
		}
	
		 addRepeatData(x:number, y:number, z:number, dir:number, num:number, val:number):void {
			var pos:number = x + z * this.xsize+y * this.xzsize;
			this.datainst[pos] = val;
			if (num == 0) return;
			var i:number = 0;
			switch (dir) {
				case 0://x
					for (i = 0; i < num; i++) {
						this.datainst[++pos] = val;
					}
					break;
				case 1://y
					for (i = 0; i < num; i++) {
						this.datainst[(pos+=this.xzsize)] = val;
					}
					break;
				case 2://z
					for (i = 0; i < num; i++) {
						this.datainst[(pos+=this.zsize)] = val;
					}
					break;
				default:
					console.error('addRepeatData bad dir!');
			}
		}
		
		  test():void {
			var data:Uint8Array = this.getTestData(100, 100, 100);
			//var data:Uint16Array = new Uint16Array( getTestData(100, 100, 100));
			/*
			var data = new Uint16Array([
				51, 205, 218, 95, 79, 216, 107, 131, 
				192, 116, 78, 86, 66, 139, 108, 198, 
				78, 111, 223, 183, 72, 89, 40, 54, 
				128, 202, 23, 23, 101, 237, 210, 83, 
				101, 189, 246, 176, 81, 53, 46, 115, 
				75, 69, 91, 100, 133, 78, 244, 67, 
				78, 186, 109, 78, 155, 105, 58, 241, 
				229, 45, 143, 35, 79, 177, 213, 162]);
			*/	
			/*
			data = new Uint8Array([
				1, 1, 1, 1,
				2, 2, 2, 2,
				3, 3, 3, 3,
				4,4,4,4
			]);
			*/
			debugger;
			var comp:ArrayBuffer = this.encode(null, new Uint8Array(256*3), data, 100, 100, 100);
			debugger;
			var decompObj:VoxelFmt2 = new VoxelFmt2(false);
			decompObj.decode(comp, { 
				cb_setPalette:function(dt:ArrayBuffer):void{},
				cb_setSize:function (x:number, y:number, z:number):void {
					decompObj.datainst = new Uint8Array(x * y * z);
				},
				// num 0 表示没有重复，
				cb_addRepeat:function(x:number, y:number, z:number, dir:number, num:number, color:number,pos:number):void {
					//console.log('addrepeat', x, y, z, dir, num, color, pos);
					decompObj.addRepeatData( x, y, z, dir, num, color);
				}
			} );
			
			//比较数据
			for (var i:number = 0; i < this.datainst.length; i++) {
				if (data[i] != decompObj.datainst[i]) {
					console.log('err kkkkkkkkkkkk');
					break;
				}
				
			};
		}
	}

	