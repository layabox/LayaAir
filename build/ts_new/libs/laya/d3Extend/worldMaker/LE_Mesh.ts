import { IRenderableMesh } from "./IRenderableMesh";
import { Vector3 } from "laya/d3/math/Vector3"

	
	export class LE_Mesh {
		
		//不再导入第三方Vector3了，各家接口不一致，难以兼容。

		// LE laya_editor
		// LEM 表示是mesh内部的。无法独立存在，里面的尽量用的引用。
		 static vec3pool:any[] = [];
		
		 getVec3():Float32Array{
			if(LE_Mesh.vec3pool.length){
				var ret:any = LE_Mesh.vec3pool.pop();
				ret[0]=ret[1]=ret[2]=0;
				return ret;
			}
			return new Float32Array(3);
		}
		 releaseVec3(v:Float32Array):void{
			if(v){
				LE_Mesh.vec3pool.push(v);
				return;
			}
		}

		 Vec3Cross(out:Float32Array, a:Float32Array, b:Float32Array):Float32Array{
			var ax:number = a[0], ay:number = a[1], az:number = a[2];
			var bx:number = b[0], by:number = b[1], bz:number = b[2];
		  
			out[0] = ay * bz - az * by;
			out[1] = az * bx - ax * bz;
			out[2] = ax * by - ay * bx;
			return out;
		}

		 Vec3Normalize(out:Float32Array, a:Float32Array):Float32Array{
			var x:number = a[0];
			var y:number = a[1];
			var z:number = a[2];
			var len:number = x*x + y*y + z*z;
			if (len > 0) {
			  //TODO: evaluate use of glm_invsqrt here?
			  len = 1 / Math.sqrt(len);
			  out[0] = a[0] * len;
			  out[1] = a[1] * len;
			  out[2] = a[2] * len;
			}
			return out;
		}
				
		 faceList: any[]=[];
		 vertexList: any[]=[];
		 edgeList: any[]=[]; 
		 mtlList: any[] = [new LEM_Material(1, 1, 1, 1, 0, 1)];
		 bbx:any[] = [0, 0, 0, 1, 1, 1];   //包围盒
		private leftIsInner:boolean = false;	// 用横截面和侧面线的时候，侧面线的左边是内部吗

		 changedVertex:number[] =[];

		/**
		 * 添加一个新的顶点属性，返回槽id。pos,normal,uv都不算。
		 * @param name 
		 * @param type 
		 */
		 addStaticElement(name:string,type:string):number{
			return 0;
		}
		
		/**
		 * 根据横截面和缩放边线建立mesh
		 * @param cross_section 二维横截面，注意只有x，y
		 * @param tapePath 缩放和移动，x是缩放，y是高度，x可以为负
		 * 
		 * 根据侧面的第一个点和最后一个点的相对位置来确定内外
		 * 最后 一个点高于第一个点就是线的左面为内，否则就是右面为内
		 * 横截面的方向不影响法线。
		 * 
		 * 注意：
		 * 	现在法线计算不太对，因此为了效果正确，要求 cross_section 必须是顺时针。taperPath必须从下往上。
		 */
		 createFromCrossSection_taperPath(cross_section:any[], close:boolean, taperPath:any[], posModifier:Function = null):void {
			if ( cross_section.length < 4)
				return;
			if (taperPath.length < 4)
				return;
			var myverts:any[] = this.vertexList;
			var myedges:any[] = this.edgeList;
			var myfaces:any[] = this.faceList;
			//先清理，这样就可以多次调用这个函数
			myverts.length = 0;
			myedges.length = 0;
			myfaces.length = 0;
			
			var ptnum:number = cross_section.length/2;
			var tapePtNum:number = taperPath.length/2;

			this.leftIsInner = taperPath[1] < taperPath[taperPath.length - 1];

			var ti:number=0;
			var facePitch:number = close?ptnum:ptnum-1;    // 一行有多少面
			var hEdgePitch:number = facePitch;             // 一行有多少横边
			var vEdgePitch:number = ptnum;                 // 一行有多少竖边
			var hvEdgePitch:number = hEdgePitch+vEdgePitch;    // 横边+竖边

			var dx:number = 0;
			var dy:number = 0;
			var dz:number = 0;
			//为了逻辑简单和便于理解先添加顶点
			for(var yi:number=0; yi<tapePtNum; yi++){
				var curs:number = taperPath[ti++];
				var cury:number = taperPath[ti++];
				for(var ci:number=0; ci<cross_section.length; ){//横截面的每个点
					var curx:number = cross_section[ci++]*curs;
					var curz:number = cross_section[ci++]*curs;

					var curV:LEM_Vert = new LEM_Vert();
					myverts.push(curV);
					curV.x = curx; curV.y = cury; curV.z = curz;
					posModifier && posModifier(curV,ci,yi);
				}
			}
			
			// 每个点都有了，下面计算binnormal
			// 这个地方的计算有点浪费
			var vi:number = 0;
			for(yi=0; yi<tapePtNum-1; yi++){
				for (ci = 0; ci < ptnum; ci++ ) {//横截面的每个点
					var cv:LEM_Vert = myverts[vi];	//当前点
					var nv:LEM_Vert = myverts[vi + ptnum]; // 上下方向的下一个点
					vi++;
					dx = nv.x - cv.x; dy = nv.y - cv.y; dz = nv.z - cv.z;
					cv.binnor.x = dx;
					cv.binnor.y = dy;
					cv.binnor.z = dz;
					//TODO 先不normalize，反正也用不上先
				}
			}
			//最后一排点的binormal=上一排的
			vi = yi * ptnum;
			for (ci = 0; ci < ptnum; ci++) {
				var cv:LEM_Vert = myverts[vi];
				var lv:LEM_Vert = myverts[vi - ptnum];
				vi++;
				lv.binnor.cloneTo(cv.binnor);
			}

			//添加边和面
			for(yi=0; yi<tapePtNum; yi++){
				var bottomy:boolean = yi===tapePtNum-1;
				for(var xi:number=0; xi<ptnum; xi++){//横截面的每个点
					var xend:boolean = xi===ptnum-1;
					//TODO if(curs===+0)
					/**
					 *  每个点导致的结果： 
					 *      添加一个顶点
					 *      添加两条边：右，下。 最右边的点在不close的情况下不加右， 最下边的不加下
					 *      添加一个面：最右边的在不close的情况下不加，最下面的不加
					 */
					//横边
					if(close || !xend ){  // 闭合，或者还没到边缘的时候，加横边
						var e0:LEM_Edge = new LEM_Edge();
						myedges.push(e0);
						e0.v1 = ptnum*yi+xi;              myverts[e0.v1].addEdge(myedges.length-1);
						e0.v2 = ptnum*yi+(xi+1)%ptnum;    myverts[e0.v2].addEdge(myedges.length-1);

						if(!bottomy) e0.addFace( facePitch*yi+xi );               // 不是最下面,加下面的face
						if(yi!=0)    e0.addFace( facePitch*yi+xi-facePitch );     // 不是最上面,加上面的face

						this.calcEdgeInfo(e0);
					}
					if(!bottomy){
						//最后一行不再添加竖边
						var e1:LEM_Edge = new LEM_Edge();
						myedges.push(e1);
						e1.v1 = ptnum*yi+xi;        myverts[e1.v1].addEdge(myedges.length-1);
						e1.v2 = ptnum*(yi+1)+xi;    myverts[e1.v2].addEdge(myedges.length-1);
						e1.f  = [facePitch*yi+xi];
						if(xi===0){
							if(close) e1.addFace(facePitch*yi+facePitch-1)
						}else{
							e1.addFace(e1.f[0]-1);
						}
						this.calcEdgeInfo(e1);
					}
					//面
					if(!bottomy){//最后一行不加面
						if(close || !xend){
							var cf:LEM_Face = new LEM_Face();
							var fid:number = myfaces.length;
							myfaces.push(cf);
							var cxi:number = yi*ptnum+xi;
							var cei:number= hvEdgePitch*yi+xi*(bottomy?1:2);             // *2 是因为 一横一竖, 注意最后一行只有一横
							/**
							 * v  0  v
							 * 1     2
							 * v  3  v
							 */
							cf.e=[cei, cei+1, cei+3, cei+hvEdgePitch]; // 横,竖，下一个竖，下一个横
							if(xend) cf.e[2] = hvEdgePitch*yi+1;       // 最后一个是第一个竖边
							//倒数第二行有些特殊，他下面的边只有横没有竖，所以不能再*2了
							if(yi===tapePtNum-2){
								cf.e[3] -= xi;
							}
							/**
							 *   0    1
							 *   3    2
							 */
							cf.v=[cxi,yi*ptnum+(xi+1)%ptnum,(yi*ptnum+(xi+1)%ptnum+ptnum), cxi+ptnum];
							myverts[cf.v[0]].addFace(fid);
							myverts[cf.v[1]].addFace(fid);
							myverts[cf.v[2]].addFace(fid);
							myverts[cf.v[3]].addFace(fid);

							this.calcFaceNormal(cf);
						}
					}
				}
			}

			// 计算点的法线
			var fn0:any = this.getVec3();
			myverts.forEach( function(v:LEM_Vert):void{
				fn0[0]=fn0[1]=fn0[2]=+0;
				v.faces.forEach(function(fv:number):void{
					var cf:LEM_Face = myfaces[fv];
					fn0[0]+=cf.nx; fn0[1]+=cf.ny; fn0[2]+=cf.nz;
				});
				this.Vec3Normalize(fn0, fn0);
				v.nx = fn0[0], v.ny = fn0[1], v.nz = fn0[2];
			});
			this.releaseVec3(fn0);
		}
		
		 calcEdgeInfo(e:LEM_Edge):void{
			if(e.flags&(1<<LEM_Edge.FLAG_LENGTH))   //如果已经计算了
				return ;
			var v1:LEM_Vert = this.vertexList[e.v1];
			var v2:LEM_Vert = this.vertexList[e.v2];
			e.dx = v2.x-v1.x;
			e.dy = v2.y-v1.y;
			e.dz = v2.z-v1.z;
			e.len = Math.sqrt(e.dx*e.dx+e.dy*e.dy+e.dz*e.dz);
			e.flags|=(1<<LEM_Edge.FLAG_LENGTH);
		}	
	
		 calcFaceNormal(f:LEM_Face):void{
			var tmpArr:any[]=[];
			for(var ei:number=0; ei<f.e.length; ei++){
				var e1:LEM_Edge = this.edgeList[f.e[ei]];
				if(e1.len<=0)continue;
				tmpArr.push(e1);
				if(tmpArr.length==2) break;
			}
			var fn:Float32Array = (<Float32Array>this.getVec3() );
			var v1:Float32Array = (<Float32Array>this.getVec3() );
			var v2:Float32Array = (<Float32Array>this.getVec3() );
			v1[0]=tmpArr[0].dx; v1[1]=tmpArr[0].dy; v1[2]=tmpArr[0].dz;
			v2[0]=tmpArr[1].dx; v2[1]=tmpArr[1].dy; v2[2]=tmpArr[1].dz;
			this.Vec3Cross(fn,v1,v2);
			this.Vec3Normalize(fn, fn);
			//以v0的binnormal朝向作为参考
			/**
			 * 方法：binormal和法线确定一个平面，
			 */
			f.nx=fn[0];
			f.ny=fn[1];
			f.nz=fn[2];
			this.releaseVec3(v1); this.releaseVec3(v2); this.releaseVec3(fn);
		}	
		
		/**
		 * 计算指定顶点的法线
		 * @param vetexid 
		 */
		 updateVertNormal(vetexid: number[]):void{
			vetexid.forEach(function(v:number):void{
				this.calcVertNormal(this.vertexList[v]);
			});
		}

		 calcVertNormal(v:LEM_Vert):void{
			//先根据所有的面的平均值算
			var fn:number = v.faces.length;
			var sum:Float32Array = (<Float32Array>this.getVec3() );
			sum[0]=0,sum[1]=0,sum[2]=0;
			for( var i:number=0; i<fn; i++){
				var cf:any[] = this.faceList[v.faces[i]];
				sum[0]+= cf.nx;
				sum[1]+= cf.ny;
				sum[2]+= cf.nz;
			}
			var nn:Float32Array = (<Float32Array>this.getVec3() );
			this.Vec3Normalize(nn,sum);
			v.nx=nn[0], v.ny=nn[1], v.nz=nn[2];
			this.releaseVec3(sum);
			this.releaseVec3(nn);
		}		
		
		/**
		 * 更新某个范围内的顶点的法线
		 * @param start 
		 * @param end 结束位置，不含。
		 */
		 clacVerteNormalFromTo(start:number, end:number):void{
			for( var i:number=start; i<end; i++){
				var cv:LEM_Vert = this.vertexList[i];
				this.calcVertNormal(cv);
			}
		}
		
		
		/**
		 * 某个顶点被修改了。
		 * @param vid 
		 */
		 onVertexChanged(vid:number):void{
			this.changedVertex.push(vid);
		}
		/**
		 * 只是顶点的位置改变了。拓扑信息不变。需要重新计算相关部分的法线
		 */
		 onChangeEnd():void{
			var changedfaces:LEM_Face[]=[];
			var myverts:any[] = this.vertexList;
			//先计算面的法线
			this.changedVertex.forEach( function(vid:number):void{
				var faces:any[] = myverts[vid].faces;
				faces.forEach( function(fid:number):void{
					var cface:LEM_Face = this.faceList[fid];
					if(cface.udata===0){
						this.calcFaceNormal(cface);
						cface.udata=1;
						changedfaces.push(cface);
					}
				})
			});
			//再计算点的法线
			this.changedVertex.forEach( function(vid:number):void{
				var cv:LEM_Vert = myverts[vid];
				this.calcVertNormal(cv);
			});
			//清除面的临时数据
			changedfaces.forEach( function(f:LEM_Face):void{f.udata=0;});
		}

		/**
		 * 
		 * @param off vec3
		 */
		 translateVertex(off:Float32Array):void{
			var vts:any[] = this.vertexList;
			function rnd():number{
				return (Math.random()-0.5)/20;
			}
			vts.forEach(function(vert:LEM_Vert,i:number):void{
				vert.x+=rnd();
				vert.y+=rnd();
				vert.z+=rnd();
				this.onVertexChanged(i);
			});
			//计算法线
			this.onChangeEnd();
		}		
		
	   /**
		 * 导出内部的mesh数据为三角形数据
		 * 只导出face，单独的点，线都不导出
		 * 这里只考虑快速导出，不考虑优化
		 * 统一按照逆时针导出三角形
		 * @param polygonType 多边形风格， 0 是原始数据 1 是完全打散成三角形，2 是原始face 3 是根据接缝分平滑组
		 */
		 fastExportRenderableMesh(polygonType:number):IRenderableMesh{
			if(polygonType===1){
				return this.fastExportRenderableMesh_tri();
			}
			var ret:any = new LEM_RenderableMesh();

			//先清理所有顶点的导出标识
			this.vertexList.forEach( function(v:LEM_Vert):void{
				v.expid=-1;
			});

			var pos:any[] = [];
			var idx:any[] = [];
			var norm:any[] = [];
			var color:any[] = [];
			//TODO 先假设所有的多边形都是凸的
			for( var fi:number=0; fi<this.faceList.length; fi++){
				var cf:LEM_Face = this.faceList[fi];
				var cmtl:LEM_Material = this.mtlList[cf.mtl];
				var vn:number = cf.v.length;
				var fn:number = vn-2;  //三角面的个数
				//添加顶点
				for(var vi:number=0; vi<vn; vi++){
					var cv:LEM_Vert = this.vertexList[cf.v[vi]];
					if(cv.expid<0){//这个表示没有导出过，需要push到pos中，否则表示pos数组中已经有了，不用处理
						pos.push(cv.x,cv.y,cv.z);
						norm.push(cv.nx,cv.ny,cv.nz);   //临时 实际要根据三角形来重新计算
						cv.expid = (pos.length-3)/3;
						color.push(cmtl.r,cmtl.g,cmtl.b,cmtl.a);
					}
				}
				//添加index。假设是凸的，所以按照三角形扇即可
				for(var trii:number=0; trii<fn; trii++){
					var v0:LEM_Vert = this.vertexList[cf.v[0]].expid;
					var v1:LEM_Vert = this.vertexList[cf.v[trii+1]].expid;
					var v2:LEM_Vert = this.vertexList[cf.v[trii+2]].expid;
					idx.push(v0, v2, v1);
				}
			}

			//计算顶点的法线 TODO
			this.vertexList.forEach( function(v:LEM_Vert):void{
				if( v.expid>=0){//只计算导出的
				}
			});

			ret.index = new Uint16Array(idx);

			ret.pos    = new Float32Array(pos);
			ret.normal = new Float32Array(norm);
			ret.uv     = new Float32Array(pos.length*2/3);
			ret.color  = new Float32Array(color);
			return ret;
		}

		/**
		 * 导出多边形风格。每个面使用统一的法线
		 * @param tri 使用纯三角形。如果是false则表示整个面共享法线
		 */
		 fastExportRenderableMesh_tri(tri:boolean=false):IRenderableMesh{
			var ret:any = new LEM_RenderableMesh();

			var pos:any[] = [];
			var idx:any[] = [];
			var norm:any[] = [];
			var color:any[] = [];
			//TODO 先假设所有的多边形都是凸的
			var cidx:number=0;
			var fNormal:Float32Array = this.getVec3();
			for( var fi:number=0; fi<this.faceList.length; fi++){
				var cf:LEM_Face = this.faceList[fi];
				var cmtl:LEM_Material = this.mtlList[cf.mtl];
				fNormal[0]=cf.nx; fNormal[1]=cf.ny; fNormal[2]=cf.nz;
				var vn:number = cf.v.length;
				//添加顶点,假设是凸的，所以按照三角形扇即可
				if(!tri){
					var stVert:number = pos.length/3;  //起始点的索引
					//不要求强制三角形，就使用多边形，这样可以减少顶点个数
					for( var vi:number=0; vi<vn; vi++){
						var v:LEM_Vert = this.vertexList[cf.v[vi]];
						pos.push(v.x,v.y,v.z);
						color.push(cmtl.r,cmtl.g,cmtl.b,cmtl.a);
						norm.push(fNormal[0],fNormal[1],fNormal[2]);
					}

					//index
					//有vn-2个面
					for(vi=0; vi<vn-2; vi++){
						idx.push(stVert,stVert+vi+2,stVert+vi+1);
					}
				}else{
					var v0:LEM_Vert = this.vertexList[cf.v[0]];
					for(vi=0; vi<vn-2; vi++){
						var v1:LEM_Vert = this.vertexList[cf.v[vi+1]];
						var v2:LEM_Vert = this.vertexList[cf.v[vi+2]];
						pos.push(v0.x,v0.y, v0.z, v1.x, v1.y, v1.z, v2.x,v2.y,v2.z);    //添加三个点
						idx.push(cidx++,cidx++,cidx++);
						//三个点的颜色
						color.push(cmtl.r,cmtl.g,cmtl.b,cmtl.a);
						color.push(cmtl.r,cmtl.g,cmtl.b,cmtl.a);
						color.push(cmtl.r,cmtl.g,cmtl.b,cmtl.a);
						/*
						//重新计算法线
						let e1    = getVec3();
						let e2    = getVec3();
						let vnorm = getVec3();
						e1[0] = v1.x-v0.x; e1[1]=v1.y-v0.y; e1[2]=v1.z-v0.z;
						e2[0] = v2.x-v0.x; e2[1]=v2.y-v0.y; e2[2]=v2.z-v0.z;
						Vec3Cross(vnorm,e1,e2);
						Vec3Normalize(vnorm,vnorm);
						if(vec3.dot(vnorm,fNormal)<0){
							vnorm[0]=-vnorm[0];
							vnorm[1]=-vnorm[1];
							vnorm[2]=-vnorm[2];
						}
						//TODO 保证与原来的同向
						norm.push(vnorm[0],vnorm[1],vnorm[2]);norm.push(vnorm[0],vnorm[1],vnorm[2]);norm.push(vnorm[0],vnorm[1],vnorm[2]);
						releaseVec3(e1);
						releaseVec3(e2);
						releaseVec3(vnorm);
						*/
					//三个点的法线
						norm.push(fNormal[0],fNormal[1],fNormal[2],
							fNormal[0],fNormal[1],fNormal[2],
							fNormal[0],fNormal[1],fNormal[2]);
					}
				}
			}
			this.releaseVec3(fNormal);
			ret.index = new Uint16Array(idx);
			ret.pos    = new Float32Array(pos);
			ret.normal = new Float32Array(norm);
			ret.uv     = new Float32Array(pos.length*2/3);
			ret.color  = new Float32Array(color);
			return ret;
		}		
	}




class LEM_RenderableMesh {
     pos: Float32Array;
     normal: Float32Array;
     uv: Float32Array;
     color: Float32Array;
     roughness: Float32Array;
     metaless: Float32Array;
     index: Uint16Array;
}



class LEM_Material{
     r:number=1;
     g:number=1;
     b:number=1;
     a:number=1;
     metaless:number=0;
     roughness:number=1;
    constructor(r:number,g:number,b:number,a:number,metaless:number,roughness:number){
        this.r=r,this.g=g,this.b=b,this.metaless=metaless,this.roughness=roughness;
    }
}


class LEM_Face {
    //id= 0 | 0; 由于会删除，加上id会造成混乱
     v: any[]; // 顶点的索引。 必须是按照固定顺序。顺时针
     e: any[]; // 边的索引
    // 面的法线。面的法线用所有的三角面的加权平均值算
     nx:number= 0.0;
     ny:number= 0.0;
     nz:number= 0.0; 
     mtl:number = 0;
	 udata:number =0;        //临时用途。遍历使用。平时为0，不许持久使用，每个函数用完以后要归零
}


class LEM_Edge{
     static FLAG_LENGTH:number=0;
    //id= 0 | 0;
     flags:number=0|0;          //都有哪些参数计算了。 因为后面的len，dxdydz可能不需要。注意每当参数变化后，要把这个清零
    // 边的左右面的索引。现在先假设只能有两个面。 TODO 不对，三维中没有左右面的概念，除非指定什么是上
     f: any[];         // 使用这个边的面
    //f1 = -1 | 0;         //左面 -1表示不存在
    //f2 = -1 | 0;         //右面

    // 边的两个点的索引
     v1:number = -1 | 0;
     v2:number = -1 | 0; 

     len:number = +0.0;
     dx:number = +0.0;
     dy:number = +0.0;
     dz:number = +0.0;
     addFace(fid:number):void{
        if(!this.f){ 
            this.f=[fid];
            return;
        }
        if(this.f.indexOf(fid)<0){
            this.f.push(fid);
        }
    }
}


class LEM_Vert {
    //id= 0 | 0;
     x:number = 0 ;
     y:number = 0 ;
     z:number = 0;        // 位置
	 nor:Vector3=new Vector3(); 	//法线
     nx:number = 0; 
	 ny:number = 0; 
	 nz:number = 0;    // 法线。 顶点的法线都是根据关联关系重新计算的，单个点没有法线，线的法线是根据线来算的
     u:number = 0;
	 v:number = 0;    //uv
	 binnor:Vector3 = new Vector3();	// binormal ，v的变化方向。对于侧面线建立的模型，可以根据这个来确定用什么法线
     mtlid:number =-1;                  // 材质id
     otherStaticElement:any[];     // 其他静态属性，即mesh上所有点都相同的结构。可以任意添加
	
     edges: any[];           // 关联的边
     faces: any[];           //关联的面
     expid:number=-1;                  //导出的时候用，>=0表示当前点已经被导出到第expid位置了
     addEdge(id:number):void{
        if(!this.edges){
            this.edges = [id];
            return;
        }
        if(this.edges.indexOf(id)<0)
            this.edges.push(id);
    }
     addFace(id:number):void{
        if(!this.faces){
            this.faces=[id];
            return;
        }
        if(this.faces.indexOf(id)<0)
            this.faces.push(id);
    }
}

