package laya.html.utils 
{
	import laya.utils.Pool;
	/**
	 * @private
	 */
	public class HTMLExtendStyle 
	{
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		public static var EMPTY:HTMLExtendStyle =/*[STATIC SAFE]*/ new HTMLExtendStyle();
		/**
		 * <p>描边宽度（以像素为单位）。</p>
		 * 默认值0，表示不描边。
		 * @default 0
		 */
		public var stroke:Number;
		/**
		 * <p>描边颜色，以字符串表示。</p>
		 * @default "#000000";
		 */
		public var strokeColor:String;
		/**
		 * <p>垂直行间距（以像素为单位）</p>
		 */
		public var leading:Number;
		/**行高。 */
		public var lineHeight:Number;
		public var letterSpacing:int;
		public var href:String;
		public function HTMLExtendStyle() 
		{
			reset();
		}
		public function reset():HTMLExtendStyle
		{
			stroke = 0;
			strokeColor = "#000000";
			leading = 0;
			lineHeight = 0;
			letterSpacing = 0;
			href = null;
			return this;
		}
		
		public function recover():void
		{
			if (this == EMPTY) return;
			Pool.recover("HTMLExtendStyle", reset());
		}
		
		/**
		 * 从对象池中创建
		 */
		//TODO:coverage
		public static function create():HTMLExtendStyle {
			return Pool.getItemByClass("HTMLExtendStyle", HTMLExtendStyle);
		}
	}

}