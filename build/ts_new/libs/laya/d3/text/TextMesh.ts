import { Color } from "../math/Color"
	
	/**
	 * <code>TextMesh</code> 类用于创建文本网格。
	 */
	export class TextMesh {
		private _text:string;
		private _fontSize:number;
		private _color:Color;
		
		/**
		 * 获取文本。
		 * @return 文本。
		 */
		 get text():string {
			return this._text;
		}
		
		/**
		 * 设置文本。
		 * @param value 文本。
		 */
		 set text(value:string) {
			this._text = value;
		}
		
		/**
		 * 获取字体尺寸。
		 * @param  value 字体尺寸。
		 */
		 get fontSize():number {
			return this._fontSize;
		}
		
		/**
		 * 设置字体储存。
		 * @return 字体尺寸。
		 */
		 set fontSize(value:number) {
			this._fontSize = value;
		}
		
		/**
		 * 获取颜色。
		 * @return 颜色。
		 */
		 get color():Color {
			return this._color;
		}
		
		/**
		 * 设置颜色。
		 * @param 颜色。
		 */
		 set color(value:Color) {
			this._color = value;
		}
		
		/**
		 * 创建一个新的 <code>TextMesh</code> 实例。
		 */
		constructor(){
		
		}
		
	
		// private _createVertexBuffer(charCount:number):void {
		// }
		
	
		// private _resizeVertexBuffer(charCount:number):void {
		
		// }
		
	
		// private _addChar():void {
		// 	//_vertexBuffer
		// }
	
	}


