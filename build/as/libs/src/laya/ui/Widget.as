package laya.ui {
	import laya.components.Component;

	/**
	 * 相对布局插件
	 */
	public class Widget extends Component {

		/**
		 * 一个已初始化的 <code>Widget</code> 实例。
		 */
		public static var EMPTY:Widget;
		private var _top:*;
		private var _bottom:*;
		private var _left:*;
		private var _right:*;
		private var _centerX:*;
		private var _centerY:*;

		/**
		 * @override 
		 */
		override public function onReset():void{}

		/**
		 * 父容器的 <code>Event.RESIZE</code> 事件侦听处理函数。
		 */
		protected function _onParentResize():void{}

		/**
		 * <p>重置对象的 <code>X</code> 轴（水平方向）布局。</p>
		 * @private 
		 */
		public function resetLayoutX():Boolean{
			return null;
		}

		/**
		 * <p>重置对象的 <code>Y</code> 轴（垂直方向）布局。</p>
		 * @private 
		 */
		public function resetLayoutY():Boolean{
			return null;
		}

		/**
		 * 重新计算布局
		 */
		public function resetLayout():void{}

		/**
		 * 表示距顶边的距离（以像素为单位）。
		 */
		public var top:Number;

		/**
		 * 表示距底边的距离（以像素为单位）。
		 */
		public var bottom:Number;

		/**
		 * 表示距左边的距离（以像素为单位）。
		 */
		public var left:Number;

		/**
		 * 表示距右边的距离（以像素为单位）。
		 */
		public var right:Number;

		/**
		 * 表示距水平方向中心轴的距离（以像素为单位）。
		 */
		public var centerX:Number;

		/**
		 * 表示距垂直方向中心轴的距离（以像素为单位）。
		 */
		public var centerY:Number;
	}

}
