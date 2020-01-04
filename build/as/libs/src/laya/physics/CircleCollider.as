package laya.physics {
	import laya.physics.ColliderBase;

	/**
	 * 2D圆形碰撞体
	 */
	public class CircleCollider extends ColliderBase {

		/**
		 * @private 
		 */
		private static var _temp:*;

		/**
		 * 相对节点的x轴偏移
		 */
		private var _x:*;

		/**
		 * 相对节点的y轴偏移
		 */
		private var _y:*;

		/**
		 * 圆形半径，必须为正数
		 */
		private var _radius:*;

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
		 * 圆形半径，必须为正数
		 */
		public var radius:Number;

		/**
		 * @private 重置形状
		 * @override 
		 */
		override public function resetShape(re:Boolean = null):void{}
	}

}
