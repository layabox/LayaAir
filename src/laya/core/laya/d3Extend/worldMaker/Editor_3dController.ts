import { SimpleShapeSprite3D } from "././SimpleShapeSprite3D";
import { SimpleShapeEditor } from "././SimpleShapeEditor";
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
	import { Plane } from "laya/d3/math/Plane"
	import { Ray } from "laya/d3/math/Ray"
	import { Vector2 } from "laya/d3/math/Vector2"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Graphics } from "laya/display/Graphics"
	import { Event } from "laya/events/Event"
	import { Keyboard } from "laya/events/Keyboard"
	
	/**
	 * TODO 范围选择实际要求并不精确，因此如果用到效率低的数学函数，可以考虑查表
	 */
	
	export class Editor_3dController {
		private point:Vector2 = new Vector2();
		
		private sel_obj:SimpleShapeSprite3D = null;
		private mat_World:Matrix4x4 = null; 			// 对象本身的矩阵
		private mat_WVP:Matrix4x4 = new Matrix4x4();	// 选中对象之后，立即计算这个矩阵。
		private camera:Camera = null;
		 objs:any[] = [];
		
		/*
		private var pickEdgeObjID:int = -1;		// 当前选中边的数据对象id
		private var pickEdgePtIdx:int = -1; 	// 当前选中边的起点的点id
		private var pickEdgeProjX:Number = 0; 	// 当前选中边的投影点
		private var pickEdgeProjY:Number = 0;
		private var pickEdgeDist2:Number = 0;	// 距离边的距离的平方
		*/
		
		 editMode:boolean = true;
		private ctrl:boolean = false;
		
		private editor:SimpleShapeEditor;
		
		constructor( camera:Camera){
			this.camera = camera;
		}
		
		/**
		 * 把位置从本地空间转换到屏幕空间
		 * @param	position
		 * @param	out
		 */
		 localToScreen(position:Vector3, out:Vector3):void {
			this.camera.viewport.project1(position, this.mat_WVP, out);
			var outE:Float32Array = out.elements;
			outE[0] = outE[0] / Laya.stage.clientScaleX;
			outE[1] = outE[1] / Laya.stage.clientScaleY;
		}		
		
		//先
		 selectObj(obj:SimpleShapeSprite3D):void {
			if (this.sel_obj == obj)
				return;
				
			if (this.sel_obj) {
				this.sel_obj.onUnselect();
			}
			this.sel_obj = obj;
			this.editor = obj.getEditor(this.camera);
			this.sel_obj.onSelect();
			//editor.camera = camera;
			//obj._simpleShapeMesh.color = 0xff00ff;
		}
		
		
		/**
		 * 摄像机改变了，需要重新计算控制点
		 */
		 onCameraChange():void {
			if (!this.editor)
				return;
			this.editor.onCameraChange();
		}
		
		/**
		 * 把一个世界空间的Ray转换成本地空间
		 * @param	ray
		 * @param	matrix
		 * @param	rayLocal
		 */
		 RayToLocal(ray:Ray, matrix:Matrix4x4, rayLocal:Ray):void {
			var o:Float32Array = ray.origin.elements;
			var d:Float32Array = ray.direction.elements;
			var m:Float32Array = matrix.elements;
			//减去偏移
			var dx:number = o[0] - m[12];
			var dy:number = o[1] - m[13];
			var dz:number = o[2] - m[14];
			
			//位置投影到本地空间中
			var oo:Float32Array = rayLocal.origin.elements;
			oo[0] = dx * m[0] + dy * m[1] + dz * m[2];
			oo[1] = dx * m[4] + dy * m[5] + dz * m[6];
			oo[2] = dx * m[8] + dy * m[9] + dz * m[10];
			
			//朝向也投影到本地空间
			var od:Float32Array = rayLocal.direction.elements;
			od[0] = d[0] * m[0] + d[1] * m[1] + d[2] * m[2];
			od[1] = d[0] * m[4] + d[1] * m[5] + d[2] * m[6];
			od[2] = d[0] * m[8] + d[1] * m[9] + d[2] * m[10];
		}
		
		/**
		 * 这个平面的法线是不是基本上对着屏幕，这样就可以基于2d来编辑。否则不要编辑
		 * 给的参数是本地坐标的
		 * @param	normX
		 * @param	normY
		 * @param	normZ
		 * @return	0法线垂直，平面平行，无法编辑  1 最好
		 */
		 fitForScrDrag(normX:number, normY:number, normZ:number):number {
			var ce:Float32Array = this.camera.viewMatrix.elements;
			//z轴是摄像机朝向
			//TODO z轴会有缩放么，如果有的话，需要先normalize
			var d:number = Math.abs( ce[8] * normX + ce[9] * normY + ce[10] * normZ);
			return d;
		}
		
		 renderVisualData(g:Graphics):void {
			if (!this.editor)
				return ;
			g.clear();
			this.editor.renderVisualData(g);
		}
		
		
		 onMouseMov(e:Event):void {
			if (!this.editor)
				return ;
			this.editor.onMouseMov(e);
		}
		
		 onMouseDown(e:Event):void {
			if (!this.editor)
				return ;
			this.editor.onMouseDown(e);
		}
		 onMouseUp(e:Event):void {		
			if (!this.editor)
				return ;
			this.editor.onMouseUp(e);
		}
		
		 onDbClick(e:Event):void {
			if (!this.editor)
				return ;
			this.editor.onDbClick(e);
		}		
		
		 onKeyDown(e:Event):void {
			this.editor && this.editor.onKeyDown(e);			
			if (e._stoped) 
				return;
			
			switch(e.keyCode) {
			case Keyboard.ESCAPE:
				break;
			case Keyboard.TAB:
				this.editMode = !this.editMode;
				break;
			case Keyboard.NUMBER_0:
				this.selectObj(this.objs[0]);
				break;
			case Keyboard.NUMBER_1:
				this.selectObj(this.objs[1]);
				break;
			case Keyboard.NUMBER_2:
			case Keyboard.NUMBER_3:
			case Keyboard.NUMBER_4:
			case Keyboard.NUMBER_5:
			case Keyboard.NUMBER_6:
			case Keyboard.NUMBER_7:
			case Keyboard.NUMBER_8:
			case Keyboard.NUMBER_9:
				break;
			case Keyboard.NUMPAD_0:
				break;
			case Keyboard.NUMPAD_7:
				break;
			case Keyboard.NUMPAD_3:
				break;
			case Keyboard.CONTROL:
				this.ctrl = true;
				break;
			case Keyboard.S:
				break;
			}
		}
		
		 onKeyUp(e:Event):void {
			this.editor && this.editor.onKeyUp(e);
			
			switch (e.keyCode) {
			case Keyboard.CONTROL:
				this.ctrl = false;
				break;
			}
		}
	}

