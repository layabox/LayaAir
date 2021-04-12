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
		public function get x():Number{return null;}
		public function set x(value:Number):void{}

		/**
		 * 相对节点的y轴偏移
		 */
		public function get y():Number{return null;}
		public function set y(value:Number):void{}

		/**
		 * 矩形宽度
		 */
		public function get width():Number{return null;}
		public function set width(value:Number):void{}

		/**
		 * 矩形高度
		 */
		public function get height():Number{return null;}
		public function set height(value:Number):void{}

		/**
		 * @private 重置形状
		 * @override 
		 */
		override public function resetShape(re:Boolean = null):void{}
	}

}
