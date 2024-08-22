import { RenderContext3D } from "../core/render/RenderContext3D"
/**
 * @en The `Size` class represents the dimensions of a rectangle or other shape in 2D space.
 * @zh `Size` 类表示2D空间中矩形或其他形状的尺寸。
 */
	export class Size {
    	/**
    	 * @en Gets the screen size of the global scene.
    	 * @return Returns a `Size` instance with both width and height set to -1, indicating full screen.
    	 * @zh 获取全局场景的屏幕尺寸。
    	 * @return 返回一个宽度和高度都设置为 -1 的 `Size` 实例，表示全屏。
    	 */
		 static get fullScreen():Size {
			return new Size(-1, -1);
		}
		
		private _width:number = 0;
		private _height:number = 0;
		
		/**
		 * @en Width.
		 * @zh 宽度
		 */
		get width():number {
			if (this._width === -1)
				return RenderContext3D.clientWidth;
			
			return this._width;
		}
		
		/**
		 * @en Height.
		 * @zh 高度
		 */
		get height():number {
			if (this._height === -1)
				return RenderContext3D.clientHeight;
			return this._height;
		}
		
		/**
		 * @en Creates an instance of  `Size`.
		 * @param width  Width.
		 * @param height Height.
		 * @zh 创建一个 `Size` 实例。
		 * @param width 宽度 
		 * @param height 高度
		 */
		constructor(width:number, height:number){
			this._width = width;
			this._height = height;
		}
	
	}


