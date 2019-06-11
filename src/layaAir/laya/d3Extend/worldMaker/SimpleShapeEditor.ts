import { SimpleShapeSprite3D } from "././SimpleShapeSprite3D";
import { Editor_3dController } from "././Editor_3dController";
import { Pick2DResult } from "././Pick2DResult";
import { Pick2DEdgeResult } from "././Pick2DEdgeResult";
import { SimpleShapeFilter } from "././SimpleShapeFilter";
import { HandlePoint } from "././HandlePoint";
import { Laya } from "Laya";
import { Vec3Pool } from "././Vec3Pool";
import { Camera } from "laya/d3/core/Camera"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
	import { Ray } from "laya/d3/math/Ray"
	import { Vector2 } from "laya/d3/math/Vector2"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { HitResult } from "laya/d3/physics/HitResult"
	import { Graphics } from "laya/display/Graphics"
	import { Event } from "laya/events/Event"
	import { Keyboard } from "laya/events/Keyboard"
	
	/**
	 * 可以从通用sprite3d编辑器派生，额外提供simpleshapeFilter的编辑功能
	 * 先直接假设编辑的就是mesh
	 */
	export class SimpleShapeEditor {
		private static tmpMat:Matrix4x4 = new Matrix4x4();	// 为了提高效率
		private static tmpVec3:Vector3 = new Vector3();
		private static tmpVec31:Vector3 = new Vector3();
		private ray:Ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
		
		 target:SimpleShapeSprite3D = null;	// 要编辑的对象
		private editMode:boolean = true;			// 编辑模式
		private ctrl:boolean = false;
		 worldEditor:Editor_3dController;		// 提供一些通用方法。例如摄像机相关的 localToScreen
		private mat_World:Matrix4x4 = null; 			// 对象本身的矩阵
		private mat_InvWorld:Matrix4x4 = new Matrix4x4(); 	// 世界矩阵的逆
		private mat_WVP:Matrix4x4 = new Matrix4x4();	// 选中对象之后，立即计算这个矩阵。
		
		 camera:Camera = null;				// TODO 这里不允许有这个
		private point:Vector2 = new Vector2();

		//2d data
		 crossDataOnScr:any[] = [];			// 原始数据投影到屏幕上的位置。
		 crossDataOnScrZ:any[] = [];			// 每个点对应的z值。
		 crossCtrlOnScr:any[] = [];
		 crossCtrlOnScrZ:any[] = [];
		
		 profileLineDataOnScr:any[] = [];		//
		 profileLineDataOnScrZ:any[] = [];
		 profileCtrlOnScr:any[] = [];
		 profileCtrlOnScrZ:any[] = [];
		
		private pickResult:Pick2DResult = new Pick2DResult();
		private pickEdgeResult:Pick2DEdgeResult = new Pick2DEdgeResult();
		
		private interpNum:number = 0;
		
		// 本地空间的特殊平面。 注意值是用来索引的，所以不要乱改
		private static LOCAL_YZ:number = 0;	//x轴是法线
		private static LOCAL_XZ:number = 4;
		private static LOCAL_XY:number = 8;
		
		// UNDO
		//private var UndoStack:Vector.<IUndo> = new Vector.<IUndo>();
		private static UndoStackLen:number = 100;
		private undoStack:any[] = new Array(0);
		private undoPos:number = 0;				// 当前undo可以开始的地方，通常是数组结尾，一旦undo了就离开了结尾，从 undoPos到结尾是可以redo的地方
		
		private dataBeforeEdit:any = { };	// 整体undo用
		private dataChanged:boolean = false; 	//编辑器是否对数据进行过修改。
		private continueChangeSavedData:any[];	// 拖动前保存的cross或者profile数据
		private dataChangedAfterStart:boolean = false;		//按下鼠标后实际修改数据了
		private curEditProp:string;				// 正在修改的属性
		// UNDO END
		
		 static canEditObject():string {
			return "SimpleShapeSprite3D";
		}
		
		constructor(obj:SimpleShapeSprite3D, cam:Camera){
			this.target = obj;
			this.camera = cam;
			this.updateData();
		}
		
		  updateData():void {
			var mesh:SimpleShapeFilter = this.target._simpleShapeMesh;
			//计算转换矩阵
			var wmat:Matrix4x4 = this.mat_World = this.target._transform.worldMatrix;
			Matrix4x4.multiply( this.camera.viewMatrix, wmat, SimpleShapeEditor.tmpMat);
			Matrix4x4.multiply( this.camera.projectionMatrix, SimpleShapeEditor.tmpMat, this.mat_WVP);
			wmat.invert(this.mat_InvWorld);
			
			this.crossCtrlOnScr.length =this.crossDataOnScr.length = mesh.crossSectionData.length*2;
			this.crossCtrlOnScrZ.length = this.crossDataOnScrZ.length = this.crossDataOnScr.length ;
			
			this.profileCtrlOnScr.length = this.profileLineDataOnScr.length = mesh.profileLineData.length*2;
			this.profileLineDataOnScrZ.length = this.profileLineDataOnScrZ.length = this.profileLineDataOnScr.length;
		}
		
		/**
		 * 进入编辑模式，开始编辑mesh
		 */
		 enterEditMode():void {
			
		}
		
		/**
		 * 持续性操作开始,下面可能是拖动数据，也可能会什么都不干（1 确实什么都不干 2 其他操作的前导 ）
		 * @param	propName
		 */
		/*public function undo_op_continueChange_start(propName:String):void {
			if (undoOp.opName != propName) {
				//记录原始值
				
			}
		}
		*/
		
		// 立即操作
		  undo_op_changeInterp(bef:number, after:number):void {
			this.undo_pushUndoData(
				{
					target:this.target._simpleShapeMesh,
					undo:function ():void {
						this.target.crossSectionInterpNum = bef;
						this.target.profileLineInterpNum = bef;
					},
					redo:function ():void {
						this.target.crossSectionInterpNum = after;
						this.target.profileLineInterpNum = after;
					}
				}			
			);
		}
		
		 undo_op_changeStyle(bef:boolean, after:boolean):void {
			this.undo_pushUndoData(
				{
					target:this.target._simpleShapeMesh,
					undo:function ():void {
						this.target.polygonStyle = bef;
					},
					redo:function ():void {
						this.target.polygonStyle = after;
					}
				}			
			);
		}
		
		 copyHandlePointArray(dt:HandlePoint[]):HandlePoint[] {
			var ret:HandlePoint[] = dt.concat();
			ret.forEach(function(v:HandlePoint, i:number):void { 
				ret[i] = new HandlePoint(v.x, v.y, v.ctrlx, v.ctrly);
			} );
			return ret;
		}
		
		 undo_startCrossData():void {
			this.curEditProp = "crossSectionData";
			this.dataChangedAfterStart = false;
			this.continueChangeSavedData = (<any[]>this.copyHandlePointArray(this.target._simpleShapeMesh.crossSectionData) );
		}
		
		 undo_startProfileData():void {
			this.curEditProp = "profileLineData";
			this.dataChangedAfterStart = false;
			this.continueChangeSavedData = (<any[]>this.copyHandlePointArray(this.target._simpleShapeMesh.profileLineData) );
		}
		
		 undo_drage_changeData():void {
			this.dataChangedAfterStart = true;
		}
		
		 undo_op_end():void {
			if (this.dataChangedAfterStart) {
				var newv:any[] = null;
				switch(this.curEditProp) {
				case 	'crossSectionData':
					newv = (<any[]>this.copyHandlePointArray(this.target._simpleShapeMesh.crossSectionData) );
					break;
				case 'profileLineData':
					newv = (<any[]>this.copyHandlePointArray(this.target._simpleShapeMesh.profileLineData) );
					break;
				default:
					throw "err158";
					break;
				}
				
				this.undo_pushUndoData({
					target:this.target._simpleShapeMesh,
					oldv:this.continueChangeSavedData,
					newv:newv,
					prop:this.curEditProp,
					undo:function ():void {
						this.target[this.prop] = this.oldv;
					},
					redo:function ():void {
						this.target[this.prop] = this.newv;
					}
				});
			}
			this.curEditProp = "";
			this.dataChangedAfterStart = false;
		}

		/**
		 * 当前位置就是数据的最终位置？
		 * @param	undoObj
		 */
		 undo_pushUndoData(undoObj:any):void {
			if (this.undoPos < this.undoStack.length){
				this.undoStack[this.undoPos++] = undoObj;
				this.undoStack.length = this.undoPos;	//裁掉后面的数据
			}
			else {
				this.undoStack.push(undoObj);
			}
			
			if (this.undoStack.length > SimpleShapeEditor.UndoStackLen) {
				this.undoStack.shift();
			}
			
			this.undoPos = this.undoStack.length;
		}

		 undo():void {
			this.undoPos--;
			if (this.undoPos < 0) {
				this.undoPos = 0;
				return;
			}
			var ud:any = this.undoStack[this.undoPos];
			ud && ud.undo.call(ud);
			this.target._simpleShapeMesh.onDataChanged();
			this.updateData();	// 更新二维数据
		}
		
		 redo():void {
			if (this.undoPos >= this.undoStack.length)
				return;
			var ud:any = this.undoStack[this.undoPos++];
			ud && ud.redo.call(ud);
			this.target._simpleShapeMesh.onDataChanged();
			this.updateData(); //更新二维数据
		}
				
		 onSelect():void {
			var mesh:SimpleShapeFilter = this.target._simpleShapeMesh;
			this.dataBeforeEdit.crossSectionData = (<any[]>this.copyHandlePointArray(mesh.crossSectionData) );
			this.dataBeforeEdit.profileLineData = (<any[]>this.copyHandlePointArray(mesh.profileLineData) );
		}
		
		 onUnselect():void {
			if (this.dataChanged) {
				//如果有变动，需要加undo
				//worldEditor.puashUndo(dataBeforeEdit)
				this.undoStack.length = 0;	//本地undo全部删除
				this.dataChanged = false;
			}
		}
		
		/**
		 * 把位置从本地空间转换到屏幕空间
		 * @param	position
		 * @param	out
		 */
		 localToScreen(position:Vector3, out:Vector3):void {
			this.camera.viewport.project1(position, this.mat_WVP, out);
			out.x = out.x / Laya.stage.clientScaleX;
			out.y = out.y / Laya.stage.clientScaleY;
		}		
		
		 pick2DData(x:number, y:number, data:any[], dist:number, result:Pick2DResult):Pick2DResult {
			var minid:number = -1;
			var miniDist:number = dist;
			var pickOffX:number = 0;
			var pickOffY:number = 0;
			
			var dtnum:number = data.length / 2;
			for (var i:number = 0; i < dtnum; i++) {
				//TODO 用不用判断z是否>0
				var dx:number = data[i*2] - x;
				var dy:number = data[i*2+1] - y;
				var cdist:number = Math.sqrt(dx * dx + dy * dy);
				if (miniDist > cdist) {
					miniDist = cdist;
					minid = i;
					pickOffX = dx;
					pickOffY = dy;
				}
			}
			if (minid >= 0) {
				result.miniPointID = minid;
				result.miniDist = miniDist;
				result.offX = pickOffX;
				result.offY = pickOffY;
				return result;
			}
			return null;
		}
		
		/**
		 * 点选算法。按照投影到屏幕上的二维点的距离来算，这样最自然。也方便以后转到gpu点选。
		 * 可能选中点，也可能选中边。如果都满足优先按照点来算
		 * @param	x
		 * @param	y
		 * @param	dist
		 * @return
		 */
		 pick(x:number, y:number, dist:number = 70):void {
			this.pickResult.miniObjID =-1;
			
			// 横截面
			if ( this.pick2DData(x, y, this.crossDataOnScr, dist, this.pickResult)) {
				this.pickResult.miniObjID = 0;
				dist = this.pickResult.miniDist;
				this.undo_startCrossData();
				console.log('pick ', this.pickResult.miniPointID);
			}
			// 横截面控制点
			if ( this.interpNum > 0) {
				var resultcc:Pick2DResult = new Pick2DResult();
				if (this.pick2DData(x, y, this.crossCtrlOnScr, dist, resultcc)) {
					this.pickResult = resultcc;
					this.pickResult.miniObjID = 2;
					dist = this.pickResult.miniDist;
					this.undo_startCrossData();
				}
			}
			
			//侧面
			var result1:Pick2DResult = new Pick2DResult();
			if ( this.pick2DData(x, y, this.profileLineDataOnScr, dist, result1)) {
				this.pickResult = result1;
				this.pickResult.miniObjID = 1;
				dist = result1.miniDist;
				this.undo_startProfileData();
			}
			
			//侧面控制点
			var resultpc:Pick2DResult = new Pick2DResult();
			if (this.pick2DData(x, y, this.profileCtrlOnScr, dist, resultpc)) {
				this.pickResult = resultpc;
				this.pickResult.miniObjID = 3;
				this.undo_startProfileData();
			}
		}
		
		/**
		 * 返回是否靠近某条边，以及对应的最近的边上的点。
		 * 只有投影点落在两个点之间的才算，所以如果相邻边形成锐角，在尖角外面会有一个无效区域
		 * @param	x
		 * @param	y
		 */
		 pickEdge(x:number, y:number, data:any[], close:boolean, dist:number, result:Pick2DEdgeResult):Pick2DEdgeResult {
			result.PtIdx =-1;
			result.dist2 = dist * dist;
			var dtnum:number = data.length / 2;
			var end:number = dtnum - 1;
			if (close) end = dtnum;
			for (var i:number = 0; i < end; i++) {
				var st:number = i * 2;
				var p0x:number = data[st];
				var p0y:number = data[st + 1];
				var p1x:number = data[(st + 2)%data.length];
				var p1y:number = data[(st + 3)%data.length];
				var dx:number = p1x - p0x;	//p0->p1
				var dy:number = p1y - p0y;
				var p0px:number = x - p0x;	//p0->p
				var p0py:number = y - p0y;
				
				var d2:number = dx * dx + dy * dy;
				if (d2 < 1e-6)	//边的长度太短
					continue;
					
				//normalize 一下边的方向矢量
				var elen:number = Math.sqrt(d2);
				var ndx:number = dx / elen;
				var ndy:number = dy / elen;
				
				// p{x,y} 在边上的投影
				var dv:number = ndx * p0px + ndy * p0py;
				if (dv<0||dv>elen) // 投影到线段外面了，忽略
					continue;
				var projx:number = p0x + ndx * dv;	// 在线段上的投射点
				var projy:number = p0y + ndy * dv;
				
				// 再看看到线段的距离是否合适
				var dx1:number = projx - x;
				var dy1:number = projy - y;
				d2 = dx1 * dx1 + dy1 * dy1;
				if ( d2< result.dist2) {
					result.dist2 = d2;
					result.PtIdx = i;
					result.projX = projx;
					result.projY = projy;
				}
			}
			return result.PtIdx >= 0?result:null;
		}		
		
		/**
		 * 摄像机改变了，需要重新计算控制点
		 */
		 onCameraChange():void {
			if (!this.target)
				return;
				
			Matrix4x4.multiply( this.camera.viewMatrix, this.mat_World, SimpleShapeEditor.tmpMat);
			Matrix4x4.multiply( this.camera.projectionMatrix, SimpleShapeEditor.tmpMat, this.mat_WVP);
			
			var mesh:SimpleShapeFilter = this.target._simpleShapeMesh;
			// 转换到屏幕坐标
			var scrPos:Vector3  = new Vector3();
			var hdata:HandlePoint[]= mesh.crossSectionData;
			var hdatanum:number = hdata.length ;
			for (var hi:number = 0; hi < hdatanum; hi++) {
				SimpleShapeEditor.tmpVec3.x = hdata[hi].x;
				SimpleShapeEditor.tmpVec3.y = 0;				// 先放到水平面
				SimpleShapeEditor.tmpVec3.z = hdata[hi].y;
				this.localToScreen(SimpleShapeEditor.tmpVec3, scrPos);
				this.crossDataOnScr[hi * 2] = scrPos.x;
				this.crossDataOnScr[hi * 2 + 1] = scrPos.y;
				this.crossDataOnScrZ[hi] = scrPos.z;
				
				SimpleShapeEditor.tmpVec3.x = hdata[hi].ctrlx;
				SimpleShapeEditor.tmpVec3.y = 0;
				SimpleShapeEditor.tmpVec3.z = hdata[hi].ctrly;
				this.localToScreen(SimpleShapeEditor.tmpVec3, scrPos);
				this.crossCtrlOnScr[hi * 2] = scrPos.x;
				this.crossCtrlOnScr[hi * 2 + 1] = scrPos.y;
				this.crossCtrlOnScrZ[hi] = scrPos.z;
			}			
			
			var cdata:HandlePoint[] = mesh.profileLineData;
			var cdtNum:number = cdata.length;
			for (var ci:number = 0; ci < cdtNum; ci++) {
				SimpleShapeEditor.tmpVec3.x = cdata[ci].x;
				SimpleShapeEditor.tmpVec3.y = cdata[ci].y;
				SimpleShapeEditor.tmpVec3.z = 0;		// 放到xy平面
				this.localToScreen(SimpleShapeEditor.tmpVec3, scrPos);
				this.profileLineDataOnScr[ci * 2] = scrPos.x;
				this.profileLineDataOnScr[ci * 2 + 1] = scrPos.y;
				this.profileLineDataOnScrZ[ci] = scrPos.z;
				
				SimpleShapeEditor.tmpVec3.x = cdata[ci].ctrlx;
				SimpleShapeEditor.tmpVec3.y = cdata[ci].ctrly;
				SimpleShapeEditor.tmpVec3.z = 0;
				this.localToScreen(SimpleShapeEditor.tmpVec3, scrPos);
				this.profileCtrlOnScr[ci * 2] = scrPos.x;
				this.profileCtrlOnScr[ci * 2 + 1] = scrPos.y;
				this.profileCtrlOnScrZ[ci] = scrPos.z;
			}
		}		
		
		/**
		 * 平面用点法式，而不是现在的Plane类，因为需要一个点，且不想构造Plane
		 * @param	x
		 * @param	y
		 * @param	planePos
		 * @param	planeNormal
		 * @param	out
		 */
		 scrToPlane(x:number,  y:number, planePos: Vector3, planeNormal:Vector3, out:Vector3):void {
			this.point.x = x;
			this.point.y = y;
			this.camera.viewportPointToRay(this.point, this.ray);
			var ro:Vector3 = this.ray.origin;
			var rd:Vector3 = this.ray.direction
			var ppos:Vector3 = planePos;
			var pnor:Vector3 = planeNormal; 
			//ray的起点到平面的距离
			var dx:number =  ppos.x - ro.x;
			var dy:number =  ppos.y - ro.y;
			var dz:number =  ppos.y - ro.z;
			var dist:number = dx * pnor.x + dy * pnor.y + dz * pnor.z;
			var v:number = rd.x * pnor.x + rd.y * pnor.y + rd.z * pnor.z;
			var t:number = dist / v;
			out.x = ro.x + rd.x * t;
			out.y = ro.y + rd.y * t;
			out.z = ro.z + rd.z * t;
		}		
		
		/**
		 * 把一个世界空间的坐标变成编辑对象本地空间的
		 * @param	wpos
		 * @param	lpos
		 */
		 worldToLocal(wpos:Vector3, lpos:Vector3):void {
			Vector3.transformV3ToV3(wpos, this.mat_InvWorld, lpos);
		}
		
		 deletePoint(objid:number, pointid:number):void {
			if (!this.target)
				return;
			var dt:any[];
			if (objid == 0) {
				this.undo_startCrossData();
				this.undo_drage_changeData();
				dt = (<any[]>this.target._simpleShapeMesh.crossSectionData );
				dt.splice(pointid, 1);
				this.target._simpleShapeMesh.setCrossSection(dt);
				this.undo_op_end();
			}else if(objid==1) {
				this.undo_startProfileData();
				this.undo_drage_changeData();
				
				dt = (<any[]>this.target._simpleShapeMesh.profileLineData );
				dt.splice(pointid, 1);
				this.target._simpleShapeMesh.setProfileLine(dt);
				this.undo_op_end();
			}else {
				console.log("不能删除这个点");
			}
			this.updateData();
			this.pickResult.miniObjID =-1;	// 撤销当前选择
		}
		
		 addPoint(x:number, y:number):void {
			var dist:number = 70;
			this.pickEdgeResult.ObjID =-1;
			if (this.pickEdge(x, y, this.crossDataOnScr, true, dist, this.pickEdgeResult)) {//有满足条件的
				this.pickEdgeResult.ObjID = 0;
				dist = Math.sqrt(this.pickEdgeResult.dist2);
			}
			
			var result1:Pick2DEdgeResult = new Pick2DEdgeResult();
			if ( this.pickEdge(x, y, this.profileLineDataOnScr, false, dist, result1)) {
				this.pickEdgeResult = result1;
				this.pickEdgeResult.ObjID = 1;
			}
			
			var dt:any[];
			var stid:number = 0;
			if (this.pickEdgeResult.ObjID == 0) {
				this.undo_startCrossData();
				this.undo_drage_changeData();
				dt = (<any[]>this.target._simpleShapeMesh.crossSectionData );
				stid = this.pickEdgeResult.PtIdx + 1;	//在下一个点
				//新的点投影到三维中 TODO 如果改了平面这个也要改
				this.scrToLocalPlane(this.pickEdgeResult.projX, this.pickEdgeResult.projY, SimpleShapeEditor.LOCAL_XZ, SimpleShapeEditor.tmpVec3);
				var addx:number = SimpleShapeEditor.tmpVec3.x;
				var addy:number = SimpleShapeEditor.tmpVec3.z
				var nx:number = dt[stid%dt.length].x;
				var ny:number = dt[stid%dt.length].y;
				dt.splice(stid, 0, new HandlePoint( addx, addy,(addx+nx)/2, (addy+ny)/2));
				this.target._simpleShapeMesh.onDataChanged();
				//选中点
				//pickResult.miniObjID = 0;
				//pickResult.miniPointID = pickEdgePtIdx + 1;
				this.updateData();//更新数据
				this.undo_op_end();
				
			}else if (this.pickEdgeResult.ObjID == 1) {
				this.undo_startProfileData();
				this.undo_drage_changeData();
				dt = (<any[]>this.target._simpleShapeMesh.profileLineData );
				stid = this.pickEdgeResult.PtIdx + 1;
				this.scrToLocalPlane(this.pickEdgeResult.projX, this.pickEdgeResult.projY, SimpleShapeEditor.LOCAL_XY, SimpleShapeEditor.tmpVec3);
				addx = SimpleShapeEditor.tmpVec3.x;
				addy = SimpleShapeEditor.tmpVec3.y;
				nx = dt[stid].x;
				ny = dt[stid].y;
				dt.splice(stid, 0, new HandlePoint(addx,addy,(addx+nx)/2, (addy+ny)/2));
				this.target._simpleShapeMesh.onDataChanged();
				//选中点
				this.updateData();//更新数据
				this.undo_op_end();
			}
		}
		
		/**
		 * 编辑器一个完整的op结束了
		 */
		 onEditorOpEnd():void {
			//添加到redo中
		}
		
		 onMouseDown(e:Event):void {
			this.pick(e.stageX, e.stageY);			
		}
		
		 onMouseUp(e:Event):void {
			this.pickResult.miniObjID = -1;
			this.pickResult.miniPointID =-1;
			this.undo_op_end();
		}
		
		/**
		 * 屏幕坐标转换到对象本地空间的坐标系平面。
		 * @param	x
		 * @param	y
		 * @param  planeid 只能是 LOCAL_XY， LOCAL_XZ， LOCAL_YZ 之一
		 * @param	out
		 */
		 scrToLocalPlane(x:number, y:number, planeid:number, out:Vector3):void {
			if (planeid != SimpleShapeEditor.LOCAL_XY && planeid != SimpleShapeEditor.LOCAL_XZ && planeid != SimpleShapeEditor.LOCAL_YZ) {
				console.error('planeid 不是指定值');
				return;
			}
			
			var planePos:Vector3 = Vec3Pool.getVec3();
			var planeNor:Vector3 = Vec3Pool.getVec3();
			var worldPos:Vector3 = Vec3Pool.getVec3();
			
			planePos.x = this.mat_World.elements[12];
			planePos.y = this.mat_World.elements[13];
			planePos.z = this.mat_World.elements[14];
			
			//xz平面，法线是y
			planeNor.x = this.mat_World.elements[planeid]; planeNor.y = this.mat_World.elements[planeid+1];planeNor.z = this.mat_World.elements[planeid+2];
			this.scrToPlane(x, y, planePos, planeNor, worldPos);
			this.worldToLocal(worldPos, out);
			
			Vec3Pool.discardVec3(planeNor);
			Vec3Pool.discardVec3(planePos);
			Vec3Pool.discardVec3(worldPos);
		}
		
		 onMouseMov(e:Event):void {		
			// 如果当前正选中某个点，则拖动他
			var dt:any[];
			var lastx:number = 0;
			var lasty:number = 0;
			var mesh:SimpleShapeFilter = this.target._simpleShapeMesh;
			if (this.pickResult.miniObjID >= 0 && this.pickResult.miniPointID >= 0) {
				var mx:number = e.stageX + this.pickResult.offX;
				var my:number = e.stageY + this.pickResult.offY;
				var pointid:number = this.pickResult.miniPointID;
				
				switch (this.pickResult.miniObjID) {
				case 0:{// 横截面. 
					this.scrToLocalPlane(mx, my, SimpleShapeEditor.LOCAL_XZ, SimpleShapeEditor.tmpVec3);
					dt = (<any[]>mesh.crossSectionData );
					lastx = dt[pointid].x;
					lasty = dt[pointid].y;
					dt[pointid ].x = SimpleShapeEditor.tmpVec3.x;
					dt[pointid ].y = SimpleShapeEditor.tmpVec3.z;
					//同时控制控制点
					dt[pointid].ctrlx += (SimpleShapeEditor.tmpVec3.x - lastx);
					dt[pointid].ctrly += (SimpleShapeEditor.tmpVec3.z - lasty);
					mesh.onDataChanged();
				}
					break;
				case 1: {// 侧面缩放. 法线是z
					this.scrToLocalPlane(mx, my, SimpleShapeEditor.LOCAL_XY, SimpleShapeEditor.tmpVec3);
					dt = (<any[]>mesh.profileLineData );
					lastx = dt[pointid ].x;
					lasty = dt[pointid ].y;
					dt[pointid ].x = SimpleShapeEditor.tmpVec3.x;
					dt[pointid ].y = SimpleShapeEditor.tmpVec3.y;
					//同时控制控制点
					dt[pointid].ctrlx += (SimpleShapeEditor.tmpVec3.x - lastx);
					dt[pointid].ctrly += (SimpleShapeEditor.tmpVec3.y - lasty);
					mesh.onDataChanged();
				}	
					break;
				case 2: {	//横截面控制点
					this.scrToLocalPlane(mx, my, SimpleShapeEditor.LOCAL_XZ, SimpleShapeEditor.tmpVec3);
					dt = (<any[]>mesh.crossSectionData );
					dt[pointid ].ctrlx = SimpleShapeEditor.tmpVec3.x;
					dt[pointid ].ctrly = SimpleShapeEditor.tmpVec3.z;
					mesh.onDataChanged();
				}
					break;
				case 3: {	//侧面控制点
					this.scrToLocalPlane(mx, my, SimpleShapeEditor.LOCAL_XY, SimpleShapeEditor.tmpVec3);
					dt = (<any[]>mesh.profileLineData );
					dt[pointid].ctrlx = SimpleShapeEditor.tmpVec3.x;
					dt[pointid].ctrly = SimpleShapeEditor.tmpVec3.y;
					mesh.onDataChanged();
				}
					break;
					default:
				}
				this.undo_drage_changeData();
			}
		}
		
		 onKeyDown(e:Event):void {
			var interpBase:number = 3;
			switch(e.keyCode) {
			case Keyboard.ESCAPE:
				break;
			case Keyboard.TAB:
				this.editMode = !this.editMode;
				break;
			case Keyboard.NUMBER_0:
			case Keyboard.NUMBER_1:
			case Keyboard.NUMBER_2:
			case Keyboard.NUMBER_3:
			case Keyboard.NUMBER_4:
			case Keyboard.NUMBER_5:
			case Keyboard.NUMBER_6:
			case Keyboard.NUMBER_7:
			case Keyboard.NUMBER_8:
			case Keyboard.NUMBER_9:
				if (this.ctrl) {
					e.stopPropagation();
					this.interpNum= interpBase * (e.keyCode-Keyboard.NUMBER_0);
					this.undo_op_changeInterp(this.target._simpleShapeMesh.profileLineInterpNum, this.interpNum);
					this.target._simpleShapeMesh.profileLineInterpNum = this.target._simpleShapeMesh.crossSectionInterpNum = this.interpNum;
				}
				break;
			case Keyboard.CONTROL:
				this.ctrl = true;
				break;
			case Keyboard.Z:
				this.ctrl && this.undo();
				break;
			case Keyboard.Y:
				this.ctrl && this.redo();
				break;
			case Keyboard.S: {
					var curstyle:boolean = this.target._simpleShapeMesh.polygonStyle ;
					e.stopPropagation();
					this.target._simpleShapeMesh.polygonStyle = !curstyle;
					this.undo_op_changeStyle(curstyle , !curstyle );
				}
				break;
			}
		}
		
		 onKeyUp(e:Event):void {
			switch(e.keyCode) {
			case Keyboard.CONTROL:
				this.ctrl = false;
				break;
			}
		}
		 onDbClick(e:Event):void {
			//优先删除
			this.pick(e.stageX, e.stageY,20);	//删除的范围要小一些
			if (this.pickResult.miniObjID >= 0 && this.pickResult.miniPointID >= 0) {
				this.deletePoint(this.pickResult.miniObjID, this.pickResult.miniPointID);
			}else {
				//检查是否是选中边了
				this.addPoint(e.stageX, e.stageY);
			}
		}
		
		/**
		 * 需要提供的数据：
		 * 。可控点	（垂直于镜头的黑色小方块）
		 * 。连边（放在这里是否合适）（黑色。选中状态是土黄色渐变）
		 * 。移动限制。（亮黄色）
		 * 。如果是线限制的话，可以提供当前值（长度）
		 * 。
		 */
		 renderVisualData(g: Graphics):void {
			if (!this.editMode)
				return;
			var mat_World:Matrix4x4 = this.target.transform.worldMatrix;
			g.alpha(0.5);
			//坐标轴
			var pos:Vector3 = new Vector3(mat_World.elements[12], mat_World.elements[13], mat_World.elements[14]);
			var scrPos:Vector3  = new Vector3();
			this.localToScreen(pos, scrPos);
			var orix:number = scrPos.x;
			var oriy:number = scrPos.y;
			var oriz:number = scrPos.z;
			
			if (scrPos.z >0 ){
				pos.x += 1;
				this.localToScreen(pos, scrPos);
				if (scrPos.z > 0) {
					//g.drawLine(orix, oriy, scrPos.x, scrPos.y, 'red');
				}
				pos.x -= 1; pos.y += 1;
				this.localToScreen(pos, scrPos);
				if (scrPos.z > 0) {
					//g.drawLine(orix, oriy, scrPos.x, scrPos.y, 'green');
					//g.fillBorderText('y',scrPos.x, scrPos.y, '20px Arial', 'green','yellow');
				}
				
				
				pos.y -= 1; pos.z += 1;
				this.localToScreen(pos, scrPos);
				if ( scrPos.z > 0) {
					//g.drawLine(orix, oriy, scrPos.x, scrPos.y, 'blue');
				}
			}
			//侧面参考线
			pos.x = 0; pos.y = this.target._simpleShapeMesh.profileLineMiniY; pos.z = 0;
			this.localToScreen(pos, scrPos);
			var osx:number = scrPos.x;
			var osy:number = scrPos.y;
			var osz:number = scrPos.z;
			pos.y = this.target._simpleShapeMesh.profileLineMaxY;
			this.localToScreen(pos, scrPos);
			if (osz > 0 && scrPos.z > 0) {
				g.drawLine(osx, osy, scrPos.x, scrPos.y, '#007700');
			}
			
			//横截面
			//var ck1:Number = fitForScrDrag( mat_World.elements[4], mat_World.elements[5], mat_World.elements[6]);//y axis
			//g.alpha(ck1);
			var interp:number = this.target._simpleShapeMesh.crossSectionInterpNum;
			var cx:number;
			var cy:number;
			var hdatanum:number = this.crossDataOnScr.length / 2;
			for (var hi:number = 0; hi < hdatanum; hi++) {
				var nex:number = (hi + 1) % hdatanum;
				var curz:number = this.crossDataOnScrZ[hi];
				var nextz:number = this.crossDataOnScrZ[nex];
				cx = this.crossDataOnScr[hi * 2];
				cy = this.crossDataOnScr[hi * 2 + 1]
				var nexx:number = this.crossDataOnScr[nex * 2];
				var nexy:number = this.crossDataOnScr[nex * 2 + 1];
				if ( curz > 0) {
					g.drawRect(cx - 4, cy - 4, 8, 8, '#ffff44');
					if (nextz > 0) {
						//两个都在前面
						g.drawLine(cx, cy, nexx, nexy, '#999900');
						
						//控制点
						if (interp > 0) {
							if (this.crossCtrlOnScrZ[hi] > 0) {
								var ctrlx:number = this.crossCtrlOnScr[hi * 2];
								var ctrly:number = this.crossCtrlOnScr[hi * 2 + 1];
								g.drawRect( ctrlx - 4, ctrly - 4, 8, 8, '#ff0000');
								g.drawLine(cx, cy, ctrlx,ctrly,'#880000');
							}
						}
					}else {
						//这种需要插值。先不做了。效果差不多
					}
				}else {
					if (nextz > 0) {
						// 需要插值先不做了
					}else {//两个点都在外面
						continue;
					}
				}
			}
			//g.drawLines(0, 0, crossDataOnScr, '#999900');
			//g.drawLine(crossDataOnScr[crossDataOnScr.length - 2], crossDataOnScr[crossDataOnScr.length - 1], crossDataOnScr[0], crossDataOnScr[1], '#999900'); // 最后一段
			
			//侧边
			//var ck2:Number = fitForScrDrag(mat_World.elements[8], mat_World.elements[9], mat_World.elements[10]);//z axis
			//g.alpha(ck2);
			
			var cdtNum:number = this.profileLineDataOnScr.length / 2;
			for (var ci:number = 0; ci < cdtNum; ci++) {
				var cz:number = this.profileLineDataOnScrZ[ci];
				cx = this.profileLineDataOnScr[ci * 2];
				cy = this.profileLineDataOnScr[ci * 2 + 1];
				if(cz>0){
					g.drawRect(cx - 4, cy - 4, 8, 8, '#44ffff');
				}
				if (ci < cdtNum - 1) {
					var nz:number = this.profileLineDataOnScrZ[ci + 1];
					if (cz > 0 && nz > 0) {
						g.drawLine(cx, cy, this.profileLineDataOnScr[ci * 2 + 2], this.profileLineDataOnScr[ci * 2 + 3], '#009999');
						
						//控制点
						if (interp > 0) {
							if (this.profileCtrlOnScrZ[ci] > 0) {
								ctrlx = this.profileCtrlOnScr[ci * 2];
								ctrly = this.profileCtrlOnScr[ci * 2 + 1];
								g.drawRect( ctrlx - 4, ctrly - 4, 8, 8, '#ff0000');
								g.drawLine(cx, cy, ctrlx,ctrly,'#880000');
							}
						}
					}
				}
				
				if (interp > 0) {
					
				}
			}
			//g.drawLines(0, 0, profileLineDataOnScr, '#009999');				
		}		
	}

	