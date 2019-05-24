package laya.html.dom {
	import laya.maths.Rectangle;
	import laya.maths.Rectangle;
	import laya.utils.Pool;
	/**
	 * @private
	 */
	public class HTMLHitRect {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		public var rec:Rectangle;
		public var href:String;
		
		//TODO:coverage
		public function HTMLHitRect() {
			rec = new Rectangle();
			reset();
		}
		
		public function reset():HTMLHitRect {
			rec.reset();
			href = null;
			return this;
		}
		
		public function recover():void {
			Pool.recover("HTMLHitRect", reset());
		}
		
		public static function create():HTMLHitRect {
			return Pool.getItemByClass("HTMLHitRect", HTMLHitRect);
		}	
	}
}