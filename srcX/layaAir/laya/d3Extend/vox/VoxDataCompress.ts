/**
	 * voxel data压缩对象。
	 * 只能处理12x12x12的数据，如果不满足这个前提，请重新实现。
	 */
	export class VoxDataCompress {
		 first:boolean=true;
		 curmem:number=4*1024;
		 dataBuffer:ArrayBuffer; 
		 dataView:DataView = null;
		private uint8Data:Uint8Array = null;
		 dataPos:number = 0;
		private compressedData:ArrayBuffer=null;
		
		 curx:number=0;     //当前到什么格子位置了，增加顺序是 x,z,y
		 cury:number=0;
		 curz:number=0;
		 curData:any[] = [];

		 static MAXPOS:number = 15;
		
		private dataChanged:boolean = true;
		private voxdata:any[];		//完整的数据。setData存到这里，压缩的时候用来按照固定顺序扫描
		private voxDataWidth:number = 12; //体素边长
		
		//head
		 static version:number=1;
		 dataByte:number=2;      // 颜色数据目前是2，但是以后可能是4。

		//操作指令固定占4bit，剩下4bit可以表示数据。由于限制格子为12*12，所以4bit可以直接表示绝对位置
		 static OP_DATA:number  = 0;     // 余下的4个bit是连续个数，这期间不再检查op。这个会导致x增加
		 static OP_ADD_X:number = 1;    	// 余下的4个bit是偏移量。
		 static OP_RESET_X:number = 2; 	// 
		 static OP_ADD_Z:number  = 3; 	// 
		 static OP_RESET_Z:number = 4; 	//
		 static OP_ADD_Y:number  = 5;    //
		 static OP_SET_POS:number = 6;   // 后面跟着x,y,z
		
		
		/**
		 * 
		 * @param	read 是否是解码
		 */
		constructor(size:number=12){
			this.voxDataWidth = size;
			this.voxdata = new Array(size*size*size);
			this.dataBuffer = new ArrayBuffer(this.curmem);   //先分配这么多
			this.dataView = new DataView(this.dataBuffer);
			this.dataView.setUint16(0, VoxDataCompress.version);
			this.dataView.setUint16(2, this.dataByte);
			this.uint8Data = new Uint8Array(this.dataBuffer);
			this.dataPos+=4;
		}
		

		// 要保证还有s这么大的空间
		private needSize(s:number):void{
			if(this.dataPos+s>this.curmem){
				this.expMem(s);
			}
		}

		private expMem(s:number):void{
			var expsz:number = Math.max(s,4*1024);
			var buf:ArrayBuffer = new ArrayBuffer(this.curmem+expsz);
			this.curmem += expsz;
			//copy
			var olddt:Uint8Array = this.uint8Data;
			this.uint8Data = new Uint8Array(buf);
			this.uint8Data.set( olddt );
			this.dataView = new DataView( buf );
			this.dataBuffer = buf;
		}
		
		//解码
		 static decodeData(data:ArrayBuffer, offset:number = 0,length:number =0,onAddData:Function=null):void{
			
			var dt:Uint8Array = new Uint8Array( data,offset,length);
			var dataPos:number = 0;
			var dv:DataView = new DataView(data,offset,length);
			var cx:number = 0;
			var cy:number = 0;
			var cz:number = 0;
			//version
			if (dv.getUint16(0) != VoxDataCompress.version) {
				console.log('not supported voxdata version ');
				return;
			}
			
			//data format
			var dataSz:number = dv.getUint16(2);
			if (dataSz != 2) {
				console.log('not supported voxdata format');
				return;
			}
			dataPos = 4;
			while (dataPos < dt.length) {
				var v:number = dt[dataPos];	
				dataPos++;
				var op:number = v >>> 4;
				var opdata:number = v & 0xf;
				switch( op) {
					case VoxDataCompress.OP_DATA:{
						for (var di:number = 0; di < opdata; di++) {
							if(dataSz==2){
								onAddData && onAddData(cx, cy, cz, dv.getUint16(dataPos));
								dataPos += 2;
							}else {
								onAddData && onAddData(cx, cy, cz, dv.getUint32(dataPos));	
								dataPos += 4;
							}
							cx++;
						}
						if(opdata>0)cx--;	//上面会多加一次。因为必然是先定位
						break;
					}
					case VoxDataCompress.OP_ADD_X:
						cx += opdata;
						break;
					case VoxDataCompress.OP_RESET_X:
						cx = opdata;
						break;
					case VoxDataCompress.OP_ADD_Z:
						cz += opdata;
						break;
					case VoxDataCompress.OP_RESET_Z:
						cz = opdata;
						break;
					case VoxDataCompress.OP_ADD_Y:
						cy += opdata;
						break;
					case VoxDataCompress.OP_SET_POS:{
						cx = opdata;
						var leftdata:number = dv.getUint8(dataPos++);
						cy = leftdata >>> 4;
						cz = leftdata & 0xf;
						break;
					}
					default:
						throw 'unknown op';
				}
			}
		}

		//可以先把数据转成三维数组，然后用扫描的方法保证连续性

		private op_addx(d:number):void{
			//if (d > MAXPOS || curx + d > MAXPOS) throw 'err 161';
			//console.log('op_addx', d);
			this.needSize(1);
			this.dataView.setUint8(this.dataPos, (VoxDataCompress.OP_ADD_X<<4)|d);
			this.dataPos++;
			this.curx += d;
		}

		//x一定小于保留的bit
		private op_resetx(x:number):void{
			//if (x > MAXPOS) throw 'err 115';
			//console.log('op_resetx', x);
			this.needSize(1);
			this.dataView.setUint8(this.dataPos, ( VoxDataCompress.OP_RESET_X<<4) | x);
			this.dataPos++;
			this.curx = x;
		}

		private op_addz(d:number):void { 
			//if (d > MAXPOS || curz + d > MAXPOS) throw 'err104';
			//console.log('op_addz', d);
			this.needSize(1);
			this.dataView.setUint8(this.dataPos, (VoxDataCompress.OP_ADD_Z << 4) | d);
			this.dataPos++;
			this.curz += d;
		}

		private op_writedata(data:any[]):void{
			var len:any = data.length;
			//if (len > MAXPOS) throw 'err154';
			//console.log('op_data', data.length);
			this.needSize(1 + len * this.dataByte);
			this.dataView.setUint8(this.dataPos, (VoxDataCompress.OP_DATA << 4) | len);
			this.dataPos += 1;
			for (var di:number = 0; di < len; di++) {
				if (this.dataByte == 2) {
					this.dataView.setUint16(this.dataPos, data[di]);
				}else {
					this.dataView.setUint32(this.dataPos, data[di]);
				}
				this.dataPos += this.dataByte;
			}
		}

		private end():void{
			//保存还没处理的数据。
			this.flushData();
		}

		/**
		 * 添加数据，不可能超出范围。
		 * @param data 
		 */
		private pushData(data:number):void{
			this.curData.push(data);
			if (this.curData.length > VoxDataCompress.MAXPOS) throw 'err 136';
		}

		private flushData():void{
			this.op_writedata(this.curData);
			this.curData.length=0;
		}

		private op_setPos(x:number, y:number, z:number):void {
			//if ( x > MAXPOS || y > MAXPOS || z > MAXPOS ) throw 'err 158';
			//console.log('op_setpos', x, y, z);
			var maxv:number = Math.max(x, y, z);
			this.needSize(2);
			this.dataView.setUint8(this.dataPos++, (VoxDataCompress.OP_SET_POS << 4) | x);
			this.dataView.setUint8(this.dataPos++, (y << 4) | z);
			this.curx=x;
			this.cury=y;
			this.curz=z;
		}

		/**
		 * 添加 short类型的数据。 要求按照约定的顺序添加数据，即先遍历x,然后z,y
		 * 不允许在相同的位置添加多次数据。
		 * @param x 
		 * @param y 
		 * @param z 
		 * @param data 
		 */
		 addDataU16(x:number, y:number, z:number, data:number):void {
			if (data === 0) data = 1;
			this.voxdata[x + z * this.voxDataWidth + y * this.voxDataWidth * this.voxDataWidth] = data;
			this.dataChanged = true;
		}
		
		private _fetchData(x:number, y:number, z:number, data:number):void {
			if(this.first){
				this.first=false;
				this.op_setPos(x,y,z)
			}
			var dx:number = x-this.curx;   // 可以>=< 0
			var dz:number = z-this.curz;   // 可以>=< 0
			var dy:number = y-this.cury;   // 可以>= 0
			// 只考虑dz,dy的话，一共有6中组合
			if(dy===0 && dz===0){//只有x变化
				if( dx===0 ||dx===1){
					//=0是刚调了setPos
					this.pushData(data);
					this.curx += dx;
				}else if(dx<0){
					//不可能。yz不变，x一定增加
					throw 'err dx<0';
				}
				else {
					//x产生了间隔
					this.flushData();
					this.op_addx(dx);
					this.pushData(data);
				}
			}else {
				//dy，dz不为0，则必然不在一行了。
				this.flushData();
				// 分成有没有跨层两类
				if( dy>0){
					//跨层了。 dz可以>=<0
					this.op_setPos(x, y, z);
				}else{
					//dy=0没有跨层. dz可以><0
					this.op_resetx(x);
					this.op_addz(dz);
				}
				this.pushData(data);
			}
		}
		
		 compress():void {
			this.dataPos = 4;
			this.curx = this.cury = this.curz = 0;
			this.first = true;
			this.curData.length = 0;
			
			var i:number = 0;
			for ( var y:number = 0; y < this.voxDataWidth; y++) {
				for (var z:number = 0; z < this.voxDataWidth; z++) {
					for ( var x:number = 0; x < this.voxDataWidth; x++) {
						var dt:any = this.voxdata[i++];
						dt && this._fetchData(x, y, z, dt);
					}
				}
			}
			this.end();
			this.compressedData =  this.dataBuffer.slice(0,this.dataPos);
		}

		/**
		 * 获取结果，以便扩展
		 */
		 getDataBuffer():ArrayBuffer {
			if (this.dataChanged) {
				this.compress();
			}
			this.dataChanged = false;
			return this.compressedData;
		}
		
		 testSaveBig():void {
			
		}
		
		 testLoad():void {
			
		}
	}

