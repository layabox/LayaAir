export class HermitSpline {
		
		constructor(){
		}
		

		/**
		 * 二维hermit插值。返回一个差值后的数组。
		 * 
		 * @param val 
		 * @param seg  分多少段。最少为2
		 * @param close 
		 */
		 static inerp(val:any[], seg:number, close:boolean):any[]{
			if(seg==0)
				return val;
			var ptnum:number = val.length/2;
			if(ptnum<2){
				throw 'hermit interp error';
			}
			var ret:any[] = [];
			var dt:number = 1.0/seg;
			//如果只有两个点，则只能用线性插值
			if(ptnum==2){
				ret.push(val[0],val[1]);//x0
				var t:number = 0;
				for( i=0; i<seg-1; i++){
					t+= dt;
					dx = val[2]-val[0];
					dy = val[3]-val[1];

					ret.push(val[0]+dx*t, val[1]+dy*t);
				}
				ret.push(val[2],val[3]);//x1
			}
			//下面是曲线插值
			//先计算每个点的切线
			var vti:number=0;
			var vertT:any[] = new Array(val.length);
			//第一个点
			var dx:number=0,dy:number=0;
			if(close){
				dx = val[2]-val[val.length-2];
				dy = val[3]-val[val.length-1];
				
			}else{
				dx = val[2]-val[0];
				dy = val[3]-val[1];
			}

				vertT[vti++] = dx;
				vertT[vti++] = dy;

			//中间的点
			for( var vi:number=1; vi<ptnum-1; vi++){
				var prei:number = (vi-1)*2;
				var nexi:number = (vi+1)*2;
				dx = val[nexi]-val[prei];
				dy = val[nexi+1] - val[prei+1];

					vertT[vti++] = dx;
					vertT[vti++] = dy;
			}

			//最后的点
			if(close){
				dx = val[0] - val[val.length-4];
				dy = val[1] - val[val.length-3];
			}else{
				//直线扩展。朝向是上一个点指向这个点
				dx = val[val.length-2] - val[val.length-4];
				dy = val[val.length-1] - val[val.length-3];
			}
				vertT[vti++] = dx;
				vertT[vti++] = dy;

			//插值
			var hermiti:hermit_interp = new hermit_interp(0,0,0,0,0,0,0,0);
			var num:number = ptnum-1; 
			if(close)num++;
			for(var i:number=0; i<num; i++){
				var p:number = i*2;
				//先加入本段的起点
				ret.push(val[p], val[p+1]);

				//再加入插值点。
				hermiti.x0 = val[p]; hermiti.y0=val[p+1]; hermiti.x1=val[(p+2)%val.length]; hermiti.y1=val[(p+3)%val.length];
				hermiti.tx0=vertT[p]; hermiti.ty0=vertT[p+1]; hermiti.tx1=vertT[(p+2)%val.length]; hermiti.ty1=vertT[(p+3)%val.length];

				t=dt;
				for( var ii:number=0; ii<seg-1; ii++){
					hermiti.getV(t);
					t+=dt;
					ret.push(hermiti.ox);
					ret.push(hermiti.oy);
				}
				//终点不加，因为在每段的开始的时候加入的。
			}
			//最后一个点
			if(!close){
				ret.push(val[val.length-2], val[val.length-1]);
			}
			return ret;
		}
		
	}



class hermit_interp{
     x0:number=0;
     y0:number=0;
     x1:number=1;
     y1:number=0;
     tx0:number=1;
     ty0:number=0;
     tx1:number=1;
     ty1:number=0;
     ox:number=0;
     oy:number=0;
    /**
     * 如果是三维的，可以分别用 xz,yz来计算
     * @param x0 
     * @param y0 
     * @param x1 
     * @param y1 
     * @param tx0  起点部分的tangent，不但有方向，还要有大小。
     * @param ty0 
     * @param tx1  终点部分的tangent，不但有方向，还要有大小。表示离开终点的方向和速度
     * @param ty1 
     */
    constructor(x0:number,y0:number,x1:number,y1:number,tx0:number,ty0:number,tx1:number,ty1:number){
        this.x0=x0; this.y0=y0;
        this.x1=x1; this.y1=y1;
        
        this.tx0=tx0; this.ty0=ty0;
        this.tx1=tx1; this.ty1=ty1;
    }

    /**
     * 
     * @param t 0则在p0点，1则在p1点
     * 现在是xy都计算，如果引入时间维的话，是否可以减少计算量
     */
     getV(t:number):void{
        var t2:number = t*t;
        var t3:number = t*t2;
        var h1:number = 2.0*t3 - 3.0*t2 +1.0;
        var h2:number = -2.0*t3 + 3.0*t2;
        var h3:number = t3-2.0*t2+t;
        var h4:number = t3-t2;
        //h1*P1+h2*P2 + h3*T1 + h4*T2
        this.ox = this.x0*h1 + this.x1*h2 + this.tx0*h3 + this.tx1*h4;
        this.oy = this.y0*h1 + this.y1*h2 + this.ty0*h3 + this.ty1*h4;
    }
}
