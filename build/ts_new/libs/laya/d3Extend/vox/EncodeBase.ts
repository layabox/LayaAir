export class EncodeBase {
		 curmem:number=4*1024;
		 dataBuffer:ArrayBuffer; 
		 dataView:DataView = null;
		protected uint8Data:Uint8Array = null;
		protected uint16Data:Uint16Array = null;
		 dataPos:number = 0;

		constructor(encode:boolean=true) {
			encode && this.initMem();
		}
		
		 initMem():void {
			this.dataBuffer = new ArrayBuffer(this.curmem);   //先分配这么多
			this.dataView = new DataView(this.dataBuffer);
			this.uint8Data = new Uint8Array(this.dataBuffer);
			this.uint16Data = new Uint16Array(this.dataBuffer);
			this.dataPos=0;
		}
		
		// 要保证还有s这么大的空间
		protected needSize(s:number):void{
			if(this.dataPos+s>this.curmem){
				this.expMem(s);
			}
		}		
		
		protected expMem(s:number):void {
			//console.log('start expmem');
			//var expsz:Number = Math.max(s,4*1024);
			var expsz:number = this.curmem * 2;	// 否则对于频繁请求太慢了
			var buf:ArrayBuffer = new ArrayBuffer(expsz);
			this.curmem = expsz;
			//copy
			var olddt:Uint8Array = this.uint8Data;
			this.uint8Data = new Uint8Array(buf);
			this.uint8Data.set( olddt );
			this.dataView = new DataView( buf );
			this.uint16Data = new Uint16Array(buf);
			this.dataBuffer = buf;
			//console.log('end expmem cur:',this.curmem);
		}
				
		protected appendBuffer(buff:ArrayBuffer):void {
			this.needSize(buff.byteLength);
			this.uint8Data.set(new Uint8Array(buff), this.dataPos);
			this.dataPos += buff.byteLength;
		}
	}

	