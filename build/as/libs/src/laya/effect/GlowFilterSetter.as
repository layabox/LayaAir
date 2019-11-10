package laya.effect {
	import laya.effect.FilterSetterBase;

	/**
	 * ...
	 * @author ww
	 */
	public class GlowFilterSetter extends FilterSetterBase {

		/**
		 * 滤镜的颜色
		 */
		private var _color:*;

		/**
		 * 边缘模糊的大小 0~20
		 */
		private var _blur:*;

		/**
		 * X轴方向的偏移
		 */
		private var _offX:*;

		/**
		 * Y轴方向的偏移
		 */
		private var _offY:*;

		public function GlowFilterSetter(){}

		/**
		 * @override 
		 */
		override protected function buildFilter():void{}
		public var color:String;
		public var blur:Number;
		public var offX:Number;
		public var offY:Number;
	}

}
