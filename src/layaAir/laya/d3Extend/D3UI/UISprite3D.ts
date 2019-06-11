import { UISprite3DFilter } from "././UISprite3DFilter";
import { Laya } from "Laya";
import { UISprite3DRenderer } from "./UISprite3DRenderer"
	import { Camera } from "laya/d3/core/Camera"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D"
	import { BaseMaterial } from "laya/d3/core/material/BaseMaterial"
	import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
	import { RenderState } from "laya/d3/core/material/RenderState"
	import { RenderElement } from "laya/d3/core/render/RenderElement"
	import { BoundSphere } from "laya/d3/math/BoundSphere"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
	import { Plane } from "laya/d3/math/Plane"
	import { Ray } from "laya/d3/math/Ray"
	import { Vector2 } from "laya/d3/math/Vector2"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { Sprite } from "laya/display/Sprite"
	import { Event } from "laya/events/Event"
	import { MouseManager } from "laya/events/MouseManager"
	import { LayaGL } from "laya/layagl/LayaGL"
	import { Point } from "laya/maths/Point"
	import { Context } from "laya/resource/Context"
	import { WebGLContext } from "laya/webgl/WebGLContext"
	import { RenderState2D } from "laya/webgl/utils/RenderState2D"
    import { View } from "laya/ui/View";
	
	/**
	 * 使用
	 *  _3dUI = new UISprite3D(camera);
	 *  其他3d设置
	 *  _3dUI.setView(sprite1,w,h);
	 * 
	 * 缺省位置是000位置，正面朝向z正方向
	 * 
	 */
	
	export class UISprite3D extends RenderableSprite3D{
		//public var ctx:WebGLContext2D = new WebGLContext2D();
		 rootView:View = new View();
		private camera:Camera;
		 isEnableIniput:boolean = false;
		private uiPlane:Plane;
		private tmpPoint:Point = new Point();
		 _bsphere:BoundSphere = new BoundSphere(new Vector3(0, 0, 0), 1);
		private _mesh:UISprite3DFilter;
		private _ctx2D:Context;
		 _matWVP:Matrix4x4;
		private _width:number = 0;
		private _height:number = 0;
		private _matInvW:Matrix4x4 = new Matrix4x4();
        private _mousePoint:Vector2 = new Vector2();			// 鼠标点
		private ray:Ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, -1));		// 鼠标射线
		 oritype:number = 0;	// free  1  固定y的朝向摄像机 2 billboard
		// 临时变量
		private static _transedRayO:Vector3 = new Vector3();
		private static _transedRayDir:Vector3 = new Vector3();

		constructor(cam:Camera){
			super("uisprite");
			this.camera = cam;
			this._render = new UISprite3DRenderer(this);
			
			this._mesh = new UISprite3DFilter(this);
			
			var renderElement:RenderElement = new RenderElement();
			this._render._renderElements.push(renderElement);
			this._render._defineDatas.add(MeshSprite3D.SHADERDEFINE_COLOR);
			
			renderElement.setTransform(this._transform);
			renderElement.render = this._render;
			
			var mat:BlinnPhongMaterial = (<BlinnPhongMaterial>this._render.sharedMaterial );
			mat || (mat = new BlinnPhongMaterial());
			mat.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
			mat.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
			//mat.getRenderState(0).blend = RenderState.BLEND_ENABLE_ALL;
			renderElement.material = mat;
			
			renderElement.setGeometry(this._mesh);
			this.set2DSize(800, 600);
			
			this.rootView.fromParentPoint = this.fromParentPoint.bind(this);
			Laya.stage.addInputChild(this.rootView);
		}
		
		 handleEventStart():void {
			
		}
		
		 handleEventEnd():void {
			
		}
		
		/**
		 * 设置1x1对应的2d单位的大小
		 * @param	width
		 * @param	height
		 */
		 set2DSize(width:number, height:number):void {
			this._width = width;
			this._height = height;
			this.rootView.size(width, height);
			this._ctx2D || (this._ctx2D = new Context());
			this._ctx2D.size(width, height);
		}
		
		/**
		 * 加载一个view，设置逻辑宽高
		 * @param	view
		 * @param	width
		 * @param	height
		 */
		 loadView(viewClass:new()=>View, width:number, height:number):void{
			var ui:View = new viewClass();
			// 用addchild 到 rootview么
		}
		
		/**
		 * 设置一个view，会清理掉之前的
		 * @param	view
		 * @param w	见set2DSize
		 * @param h 
		 */
		 setView(view:Sprite, w:number, h:number):void {
			this.set2DSize(w, h);
			this.rootView.removeChildren();
			this.rootView.addChild(view);
		}
		
		/**
		 * 设置朝向方式：
		 * 0 纯3d
		 * 1 固定中心y轴，其他朝向摄像机
		 * 2 billboard
		 */
		 setOritationType(type:number):void {
			this.oritype = type;
		}
		
		/**
		 * 将父容器坐标系坐标转换到本地坐标系。
		 * @param point 父容器坐标点。
		 * @return  转换后的点。
		 */
		 fromParentPoint(point:Point):Point {
			this.transform.worldMatrix.invert(this._matInvW);
			
            this._mousePoint.x = MouseManager.instance.mouseX;
            this._mousePoint.y = MouseManager.instance.mouseY;
            this.camera.viewportPointToRay(this._mousePoint, this.ray);	
			
			// 计算交点，作为新的坐标
			Vector3.transformV3ToV3(this.ray.origin, this._matInvW, UISprite3D._transedRayO);
			// 如果起点在z的负方向，则不算
			if ( UISprite3D._transedRayO.z < 0) {
				point.x =-10000;
				point.y =-10000;
				return point;
			}
			
			Vector3.TransformNormal(this.ray.direction, this._matInvW, UISprite3D._transedRayDir);
			// 如果朝向离开z也不算
			if ( UISprite3D._transedRayDir.z >= -1e-6) {
				point.x =-10000;
				point.y =-10000;
				return point;
			}
			
			var hitt:number = -UISprite3D._transedRayO.z / UISprite3D._transedRayDir.z;	// z>0，方向<0,所以要取负
			var hitx:number = UISprite3D._transedRayO.x + UISprite3D._transedRayDir.x * hitt;
			var hity:number = UISprite3D._transedRayO.y + UISprite3D._transedRayDir.y * hitt;
			point.x = (hitx + 1) / 2 * this._width;
			point.y = ( -hity + 1) / 2 * this._height;
			return point;
		}
		
		// 设置旋转缩放平移以及父对象
		
		 updateUIPlane():void{
		
		}
		
		 enableInput(b:boolean):void{
			this.isEnableIniput = b;
			if (b){
				// 监听鼠标事件
				//
			}
			else
			{
				
			}
		}
		
		 renderUI():void {
			//update
			//render
			var oldw:number = RenderState2D.width;
			var oldh:number = RenderState2D.height;
			RenderState2D.width = this._width;
			RenderState2D.height = this._height;
			var gl:WebGLContext = LayaGL.instance;
			//gl.disable(WebGLContext.DEPTH_TEST);
			var enablezw:boolean = gl.getParameter(WebGLContext.DEPTH_WRITEMASK);
			gl.disable(WebGLContext.CULL_FACE);
			gl.enable(WebGLContext.BLEND);
			gl.depthMask(false); // 不写入z
			this._ctx2D.clear();
			this.rootView.render(this._ctx2D, 0, 0);
			var lastWVP:Matrix4x4 = RenderState2D.matWVP;
			RenderState2D.matWVP = this._matWVP;
			//RenderState2D.width = 
			this._ctx2D.flush();
			RenderState2D.matWVP = lastWVP;
			gl.enable(WebGLContext.DEPTH_TEST);
			gl.enable(WebGLContext.CULL_FACE);
			gl.depthMask(enablezw);
			RenderState2D.width = oldw;
			RenderState2D.height = oldh;
		}
	}

