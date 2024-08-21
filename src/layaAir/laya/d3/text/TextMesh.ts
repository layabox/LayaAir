import { Color } from "../../maths/Color";

	
/**
 * @en TextMesh class used to create text mesh.
 * @zh TextMesh 类用于创建文本网格。
 */
	export class TextMesh {
		private _text:string;
		private _fontSize:number;
		private _color:Color;
		
    	/**
    	 * @en The text of the TextMesh.
    	 * @zh 文本网格的文本。
         */
		 get text():string {
			return this._text;
		}
		
		 set text(value:string) {
			this._text = value;
		}
		
		/**
		 * @en The font size of the TextMesh.
		 * @zh 字体尺寸。
		 */
		 get fontSize():number {
			return this._fontSize;
		}
		
		 set fontSize(value:number) {
			this._fontSize = value;
		}
		
		/**
		 * @en The color of the TextMesh.
		 * @zh 文本网格的颜色
		 */
		 get color():Color {
			return this._color;
		}
		
		 set color(value:Color) {
			this._color = value;
		}
		
		/** @ignore */
		constructor(){
		
		}
		
	}


