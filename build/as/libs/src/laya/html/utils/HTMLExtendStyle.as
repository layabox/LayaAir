package laya.html.utils {

	/**
	 * @private 
	 */
	public class HTMLExtendStyle {
		public static var EMPTY:HTMLExtendStyle;

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

		/**
		 * 行高。
		 */
		public var lineHeight:Number;
		public var letterSpacing:Number;
		public var href:String;

		public function HTMLExtendStyle(){}
		public function reset():HTMLExtendStyle{
			return null;
		}
		public function recover():void{}

		/**
		 * 从对象池中创建
		 */
		public static function create():HTMLExtendStyle{
			return null;
		}
	}

}
