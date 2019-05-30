import { BezierLerp } from "laya/ani/math/BezierLerp"
	import { BufferState } from "laya/d3/core/BufferState"
	import { GeometryElement } from "laya/d3/core/GeometryElement"
	import { RenderContext3D } from "laya/d3/core/render/RenderContext3D"
	import { BoundSphere } from "laya/d3/math/BoundSphere"
	import { Vector3 } from "laya/d3/math/Vector3"
    import { UISprite3D } from "./UISprite3D";
	/**
	 */
	export class UISprite3DFilter extends GeometryElement {
		/**@private */
		private static _type:number = GeometryElement._typeCounter++;
		
		 boundSphere:BoundSphere = new BoundSphere(new Vector3(6, 6, 6), 10.392);
		 indexNum:number = 0;
		 vertexNum:number = 0;
		private _bbx:any[] = [0, 0, 0, 0, 0, 0];
		private _owner:UISprite3D = null;
		
		constructor(owner:UISprite3D){
			super();
this._owner = owner;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _getType():number {
			return UISprite3DFilter._type;
		}
			
		
		/**
		 * @private
		 * @return  是否需要渲染。
		 */
		/*override*/  _prepareRender(state:RenderContext3D):boolean {
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
		

		//
		/*override*/  _render(state:RenderContext3D):void {
			this._owner.renderUI();
			/*
			var gl:WebGLContext = LayaGL.instance;
			gl.drawElements(WebGLContext.TRIANGLES, indexNum, WebGLContext.UNSIGNED_SHORT, 0);
			Stat.drawCall += 1;
			Stat.trianglesFaces += indexNum/3;
			*/
		}
		
		 _destroy():void {
			//_bufferState.destroy();
			//TODO 郭磊这里应该怎么处理啊
		}		
	}



