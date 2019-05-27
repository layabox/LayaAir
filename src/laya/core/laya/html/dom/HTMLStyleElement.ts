import { HTMLElement } from "././HTMLElement";
import { Graphics } from "laya/display/Graphics"
	import { HTMLStyle } from "../utils/HTMLStyle"
	
	/**
	 * @private
	 */
	export class HTMLStyleElement extends HTMLElement {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		
		/*override*/ protected _creates():void 
		{
		}
		
		/*override*/  drawToGraphic(graphic:Graphics, gX:number, gY:number, recList:any[]):void 
		{
		}
		//TODO:coverage
		/*override*/  reset():HTMLElement {
			return this;
		}
		
		/**
		 * 解析样式
		 */
		/*override*/  set innerTEXT(value:string) {
			HTMLStyle.parseCSS(value, null);
        }
        
        get innerTEXT(){
            return super.innerTEXT;
        }
	}

