package laya.html.utils {
	import laya.html.utils.ILayout;

	/**
	 * @private 
	 */
	public class LayoutLine {
		public var elements:Array;
		public var x:Number;
		public var y:Number;
		public var w:Number;
		public var h:Number;
		public var wordStartIndex:Number;
		public var minTextHeight:Number;
		public var mWidth:Number;

		/**
		 * 底对齐（默认）
		 * @param left 
		 * @param width 
		 * @param dy 
		 * @param align 水平
		 * @param valign 垂直
		 * @param lineHeight 行高
		 */
		public function updatePos(left:Number,width:Number,lineNum:Number,dy:Number,align:String,valign:String,lineHeight:Number):void{}
	}

}
