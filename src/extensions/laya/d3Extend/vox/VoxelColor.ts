export class VoxelColor {
		 r:number = 0;	// 0~255
		 g:number = 0;
		 b:number = 0;
		 w:number = 0; 	// 这里表示重复次数
		 obj:any = null;
		
		constructor(r:number, g:number, b:number,o:any){
			this.r=r;
			this.g=g;
			this.b = b;
			this.obj = o;
		}
		
		 toInt():number{
			return (this.r<<16) | (this.g<<8) | (this.b);
		}		
	}

	
