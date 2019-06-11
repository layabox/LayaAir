import { Rectangle } from "laya/maths/Rectangle"
	
	import { Pool } from "laya/utils/Pool"
	/**
	 * @private
	 */
	export class HTMLHitRect {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		 rec:Rectangle;
		 href:string;
		
		//TODO:coverage
		constructor(){
			this.rec = new Rectangle();
			this.reset();
		}
		
		 reset():HTMLHitRect {
			this.rec.reset();
			this.href = null;
			return this;
		}
		
		 recover():void {
			Pool.recover("HTMLHitRect", this.reset());
		}
		
		 static create():HTMLHitRect {
			return Pool.getItemByClass("HTMLHitRect", HTMLHitRect);
		}	
	}

