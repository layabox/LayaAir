import { RenderContext3D } from "../core/render/RenderContext3D"
	/**
	 * 
	 */
	export class Size {
		/**
		 * 全局场景的屏幕大小
		 */
		 static get fullScreen():Size {
			return new Size(-1, -1);
		}
		
		private _width:number = 0;
		private _height:number = 0;
		
		/**
		 * 宽度
		 */
		get width():number {
			if (this._width === -1)
				return RenderContext3D.clientWidth;
			
			return this._width;
		}
		
		/**
		 * 高度
		 */
		get height():number {
			if (this._height === -1)
				return RenderContext3D.clientHeight;
			return this._height;
		}
		
		/**
		 * 创建Size实例
		 * @param width 宽度 
		 * @param height 高度
		 */
		constructor(width:number, height:number){
			this._width = width;
			this._height = height;
		}
	
	}


