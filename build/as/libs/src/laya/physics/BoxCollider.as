package laya.physics {
	import laya.physics.ColliderBase;

	/**
	 * 2D矩形碰撞体
	 */
	public class BoxCollider extends ColliderBase {

		/**
		 * 相对节点的x轴偏移
		 */
		private var _x:*;

		/**
		 * 相对节点的y轴偏移
		 */
		private var _y:*;

		/**
		 * 矩形宽度
		 */
		private var _width:*;

		/**
		 * 矩形高度
		 */
		private var _height:*;

		/**
		 * @override 
		 */
		override protected function getDef():*{}
		private var _setShape:*;

		/**
		 * 相对节点的x轴偏移
		 */
		public var x:Number;

		/**
		 * 相对节点的y轴偏移
		 */
		public var y:Number;

		/**
		 * 矩形宽度
		 */
		public var width:Number;

		/**
		 * 矩形高度
		 */
		public var height:Number;

		/**
		 * @private 重置形状
		 * @override 
		 */
		override public function resetShape(re:Boolean = null):void{}
	}

}
