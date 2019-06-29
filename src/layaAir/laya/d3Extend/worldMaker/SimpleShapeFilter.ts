import { HandlePoint } from "./HandlePoint";
import { LE_Mesh } from "./LE_Mesh";
import { IRenderableMesh } from "./IRenderableMesh";
	import { BufferState } from "laya/d3/core/BufferState"
	import { GeometryElement } from "laya/d3/core/GeometryElement"
	import { RenderContext3D } from "laya/d3/core/render/RenderContext3D"
	import { IndexBuffer3D } from "laya/d3/graphics/IndexBuffer3D"
	import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh"
	import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D"
	import { VertexDeclaration } from "laya/d3/graphics/VertexDeclaration"
	import { BoundSphere } from "laya/d3/math/BoundSphere"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { LayaGL } from "laya/layagl/LayaGL"
	import { Stat } from "laya/utils/Stat"
	import { WebGLContext } from "laya/webgl/WebGLContext"
	
	/**
	 */
	export class SimpleShapeFilter extends GeometryElement {
		/**@private */
		private static _type:number = GeometryElement._typeCounter++;
		
		 boundSphere:BoundSphere = new BoundSphere(new Vector3(6, 6, 6), 10.392);
		 indexNum:number = 0;
		 vertexNum:number = 0;
		 crossSectionData:HandlePoint[] =[];
		//public var crossSectionSplineCtrl:Array=[];	// 二次贝塞尔曲线的控制点。有几个点就有几个控制点，不管是否是封闭的
		private _crossSecInterpNum:number = 0;		//横截面的插值次数
		 profileLineData:HandlePoint[] = [];
		//public var profileLineDataSplineCtrl:Array = [];
		private _profilelineInterfNum:number = 0;	//侧面的插值次数
		private _color:number= 0xffffff;			//bgr
		private _polygonStyle:boolean = true;
		private needReExport:boolean = true;	//是否需要重新导出
		private leMesh:LE_Mesh = new LE_Mesh();
		private _bEditMode:boolean = false;		//编辑器模式下，会有一个缺省外观，并且修改参数会立即导出
		private _bbx:any[] = [0, 0, 0, 0, 0, 0];
		private exported:boolean = false;
		
		 profileLineMiniY:number = 0;
		 profileLineMaxY:number = 0;
		
		 _splineType:string = 'bezier2interp';	//这个要保存到文件中，防止由于算法不一致导致的效果不一致
		protected bufferState:BufferState;
		
		constructor(bEditMode:boolean = false ){
			super();
this._bEditMode = bEditMode;
			//setCrossSection( [ -0.5, -0.5, -0.5, 0.5,0.5, 0.5, 0.5, -0.5]);	// 这个必须是顺时针
			this.setCrossSection([0.309, 0.951, 0.154, 0.4755, 0.809, 0.587, 0.5, 0, 0.809, -0.587, 0.154, -0.475, -0.309, -0.951, -0.404, -0.293, -1, 0, -0.404, 0.293]);// 这个必须是顺时针
			this.setProfileLine([0.01, 0.1, 1, 0 ,0.01, 0.3]);	// 这个必须是从下往上的顺序
			if(bEditMode){
				this.rebuildMesh();
				this.reExportMeshData();
			}
		}
		
		
		/**
		 * 二次贝塞尔曲线
		 * @param	sx	起点
		 * @param	sy
		 * @param	ex	终点
		 * @param	ey
		 * @param	cx	控制点
		 * @param	cy
		 * @param	interpNum 	插值次数
		 * @return 返回插值后的数组
		 */
		 bezier2(sx:number, sy:number, ex:number, ey:number, cx:number, cy:number,interpNum:number):any[] {
			var ret:any[] = new Array(interpNum*2);
			// 起始点到控制点的x和y每次的增量
			var changeX1:number = (cx - sx) / interpNum;
			var changeY1:number = (cy - sy) / interpNum;
			// 控制点到结束点的x和y每次的增量
			var changeX2:number = (ex - cx) / interpNum;
			var changeY2:number = (ey - cy) / interpNum;
	 
			for(var i:number = 0; i < interpNum; i++) {
				// 计算两个动点的坐标
				var qx1:number = sx + changeX1 * i;
				var qy1:number = sy + changeY1 * i;
				var qx2:number = cx + changeX2 * i;
				var qy2:number = cy + changeY2 * i;
				// 计算得到此时的一个贝塞尔曲线上的点坐标
				var bx:number  = qx1 + (qx2 - qx1) * i / interpNum;
				var by:number  = qy1 + (qy2 - qy1) * i / interpNum;
				ret[i * 2] = bx;
				ret[i * 2 + 1] = by;
			}
			return ret;
		}
			
		/**
		 * 三次贝塞尔曲线
		 */
		 PointOnCubicBezier():void {
			
		}
			
		/**
		 * 把一个折线用贝塞尔插值。
		 * @param	data
		 * @param	interpNum  每一段插成多少段
		 * @param	close 	是否是闭合
		 * @return
		 */
		 bezier2interp(data:HandlePoint[],  interpNum:number, close:boolean):any[] {
			if (data.length < 2 )
				return [];
			var i:number = 0;
			var ret:any[] = [];
			var ptnum:number = data.length;
			if ( interpNum == 0) {
				for (i = 0; i < ptnum; i++) {
					ret.push(data[i].x, data[i].y);
				}
				return ret;//线性只能原样
			}
			var ci:number = 0;
			for (i = 0; i < ptnum - 1; i++) {
				ret = ret.concat( this.bezier2(data[i].x, data[i].y, data[i+1].x, data[i+1].y, data[i].ctrlx, data[i].ctrly, interpNum));
			}
			
			//如果有close要把最后一段画上
			if (close) {
				var last:HandlePoint = data[data.length - 1];
				ret = ret.concat(this.bezier2(last.x, last.y, data[0].x, data[0].y, last.ctrlx, last.ctrly, interpNum));
			}
			return ret;
		}
		
		/**
		 * 根据数据重新生成渲染模型
		 */
		 rebuildMesh():void {
			var interpFun:any = this[this._splineType];
			this.leMesh.createFromCrossSection_taperPath(
				//HermitSpline.inerp(crossSectionData,_crossSecInterpNum,true),
				interpFun.call(this,this.crossSectionData,this._crossSecInterpNum,true),
				true,
				//HermitSpline.inerp(profileLineData,_profilelineInterfNum,false), 
				interpFun.call(this,this.profileLineData,this._profilelineInterfNum,false), 
				null);
		}
		
		/**
		 * @private
		 * @return  是否需要渲染。
		 */
		/*override*/  _prepareRender(state:RenderContext3D):boolean {
			if (!this.exported) {
				this.rebuildMesh();
				this.reExportMeshData();
			}
			return true;
		}		
		
		private updateBBX(x:number,y:number,z:number):void {
			if (this._bbx[0] > x)this._bbx[0] = x;
			if (this._bbx[1] > y)this._bbx[1] = y;
			if (this._bbx[2] > z)this._bbx[2] = z;
			if (this._bbx[3] < x)this._bbx[3] = x;
			if (this._bbx[4] < y)this._bbx[4] = y;
			if (this._bbx[5] < z)this._bbx[5] = z;
		}
		
		private getBBXCenter(vout:Vector3):void {
			vout.x = (this._bbx[0] + this._bbx[3]) / 2;
			vout.y = (this._bbx[1] + this._bbx[4]) / 2;
			vout.z = (this._bbx[2] + this._bbx[5]) / 2;
		}
		
		//包围盒的对角线
		private getBBXSize():number {
			var dx:number = this._bbx[3] - this._bbx[0];
			var dy:number = this._bbx[4] - this._bbx[1];
			var dz:number = this._bbx[5] - this._bbx[2];
			return Math.sqrt(dx * dx + dy * dy + dz * dz);
		}
		
		/**
		 * 重新导出模型
		 */
		 reExportMeshData():void {
			//导出数据
			var expmesh:IRenderableMesh = this.leMesh.fastExportRenderableMesh( this.polygonStyle?1:0);
			
			//构造VB，IB
			//vertex buffer
			var vertnum:number = this.vertexNum =  expmesh.pos.length / 3;
			var vd:VertexDeclaration = /*VertexPositionNormalColor.vertexDeclaration*/VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR");
			var Buffers:VertexBuffer3D[] = [];
			var vb:VertexBuffer3D = new VertexBuffer3D(vd.vertexStride * vertnum*4, WebGLContext.DYNAMIC_DRAW, true);
			var vbbuf:Float32Array = new Float32Array(vd.vertexStride * vertnum);
			var vi:number = 0;
			var pi:number = 0;
			var ni:number = 0;
			var ci:number = 0;
			var cr:number = (this._color&0xff)/255.0;
			var cg:number = ((this._color>>>8)&0xff)/255.0;
			var cb:number = ((this._color>>>16)&0xff)/255.0;
			var ca:number = 1.0;
			var cx:number = 0; 
			var cy:number = 0;
			var cz:number = 0;
			for ( var i:number = 0; i < vertnum; i++) {
				//pos
				cx = expmesh.pos[pi++];
				cy = expmesh.pos[pi++];
				cz = expmesh.pos[pi++];
				vbbuf[vi++] = cx; vbbuf[vi++] = cy; vbbuf[vi++] = cz;
				this.updateBBX(cx, cy, cz);
				//normal
				vbbuf[vi++] = expmesh.normal[ni++];vbbuf[vi++] = expmesh.normal[ni++];vbbuf[vi++] = expmesh.normal[ni++];
				//color
				//vbbuf[vi++] = expmesh.color[ci++];vbbuf[vi++] = expmesh.color[ci++];vbbuf[vi++] = expmesh.color[ci++];vbbuf[vi++] = expmesh.color[ci++];
				vbbuf[vi++] = cr;vbbuf[vi++] = cg; vbbuf[vi++] = cb; vbbuf[vi++] = ca;
			}
			vb.setData(vbbuf);
			vb.vertexDeclaration = vd;
			Buffers[0] = vb;
			
			//包围球
			this.getBBXCenter( this.boundSphere.center);
			this.boundSphere.radius = this.getBBXSize()/2;
			
			//index buffer 
			this.indexNum = expmesh.index.length;
			var ib:IndexBuffer3D = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, expmesh.index.length, WebGLContext.DYNAMIC_DRAW);
			ib.setData(expmesh.index);
			
			this.bufferState = new BufferState();
			this.bufferState.bind();
			this.bufferState.applyVertexBuffers(Buffers);
			this.bufferState.applyIndexBuffer(ib);
			this.bufferState.unBind();
			
			//_applyBufferState(bufferState);
			this.exported = true;
		}
		
		/**
		 * 设置模型的横截面
		 * @param	data
		 */
		 setCrossSection(data:any[]):void {
			if (!data || data.length<=0) return;
			if ( typeof(data[0]) == 'number') {
				//如果设置的是数字，则要计算初始控制点
				var i:number = 0;
				var cx:number = 0, cy:number = 0, nx:number = 0, ny:number = 0;
				//如果没有控制点就先计算
				//HermitSpline
				var ptnum:number = data.length / 2 ;
				this.crossSectionData.length = ptnum;
				for (i = 0; i < ptnum; i++) {
					cx = data[i * 2];
					cy = data[i * 2 + 1];
					nx = data[(i * 2 + 2) % data.length];
					ny = data[(i * 2 + 3) % data.length];
					this.crossSectionData[i] = new HandlePoint(cx, cy, (cx + nx) / 2, (cy + ny) / 2);
				}
			}else {
				//否则就是自带控制点
				this.crossSectionData = data as HandlePoint[];
			}
			this.onDataChanged();
		}
		
		 onDataChanged():void {
			if (this._bEditMode) {
				this.rebuildMesh();
				this.reExportMeshData();
			}else {
				this.exported = false;
			}
			if(this.profileLineData && this.profileLineData.length){
				this.profileLineMiniY = this.profileLineData[0].y;
				this.profileLineMaxY = this.profileLineMiniY + 1;
				for (var i:number = 1; i < this.profileLineData.length; i++) {
					var cy:number =  this.profileLineData[i].y;
					if (cy < this.profileLineMiniY) this.profileLineMiniY = cy;
					if (cy > this.profileLineMaxY) this.profileLineMaxY = cy;
				}
			}
		}
		
		/**
		 * 仅供读写文件用
		 */
		 set splineType(type:string) {
			this._splineType = type;
		}
		
		 get splineType():string {
			return this._splineType;
		}
		
		/**
		 * 设置侧面线，
		 * @param	data 是一个数组，x表示缩放，y表示高度
		 */
		 setProfileLine(data:any[]):void {
			if (!data || data.length<=0) return;
			if ( typeof(data[0]) == 'number') {
				//如果设置的是数字，则要计算初始控制点
				var i:number = 0;
				var cx:number = 0, cy:number = 0, nx:number = 0, ny:number = 0;
				//如果没有控制点就先计算
				//HermitSpline
				var ptnum:number = data.length / 2 ;
				this.profileLineData.length = ptnum;
				for (i = 0; i < ptnum; i++) {
					cx = data[i * 2];
					cy = data[i * 2 + 1];
					nx = data[(i * 2 + 2) % data.length];
					ny = data[(i * 2 + 3) % data.length];
					this.profileLineData[i] = new HandlePoint(cx, cy, (cx + nx) / 2, (cy + ny) / 2);
				}
				
			}else {
				this.profileLineData = data as HandlePoint[];
			}
			if(this._bEditMode){
				this.rebuildMesh();
				this.reExportMeshData();
			}else {
				this.exported = false;	
			}
		}
		
		 get crossSectionInterpNum():number {
			return this._crossSecInterpNum;
		}
		 set crossSectionInterpNum(i:number) {
			if(this._crossSecInterpNum!=i){
				this._crossSecInterpNum = i;
				if(this._bEditMode){
					this.rebuildMesh();
					this.reExportMeshData();
				}else {
					this.exported = false;
				}
			}
		}
		
		 get profileLineInterpNum():number {
			return this._profilelineInterfNum;
		}
		
		 set profileLineInterpNum(i:number) {
			if (this._profilelineInterfNum != i) {
				this._profilelineInterfNum = i;
				if(this._bEditMode){
					this.rebuildMesh();
					this.reExportMeshData();
				}else {
					this.exported = false;
				}
			}
		}
		/**
		 * 是否为多边形风格
		 * @param	b
		 */
		 set polygonStyle(b:boolean) {
			if(b!=this._polygonStyle){
				this._polygonStyle = b;
				if(this._bEditMode){
					this.reExportMeshData();
				}else {
					this.exported = false;
				}
			}
		}
		
		 get polygonStyle():boolean{
			return this._polygonStyle;
		}
		
		/**
		 * color 格式是 0xbbggrr
		 */
		 set color(color:number) {
			if (this._color != color) {
				this._color = color;
				if (this._bEditMode) {
					this.reExportMeshData();
				}else {
					this.exported = false;
				}
			}
		}
		 get color():number {
			return this._color;
		}
		
		 set roughness(r:number) {
			
		}
		
		 get roughness():number {
			return 1;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _getType():number {
			return SimpleShapeFilter._type;
		}
		
		//
		/*override*/  _render(state:RenderContext3D):void {
			var gl:WebGLContext = LayaGL.instance;
			this.bufferState.bind();
			gl.drawElements(WebGLContext.TRIANGLES, this.indexNum, WebGLContext.UNSIGNED_SHORT, 0);
			Stat.renderBatches += 1;
			Stat.trianglesFaces += this.indexNum/3;
		}
		
		 _destroy():void {
			//_bufferState.destroy();
			//TODO 郭磊这里应该怎么处理啊
		}		
	}



