package laya.physics {
	import laya.physics.ColliderBase;

	/**
	 * 2D边框碰撞体
	 */
	public class EdgeCollider extends ColliderBase {

		/**
		 * 相对节点的x轴偏移
		 */
		private var _x:*;

		/**
		 * 相对节点的y轴偏移
		 */
		private var _y:*;

		/**
		 * 用逗号隔开的点的集合，注意只有两个点，格式：x,y,x,y
		 */
		private var _points:*;

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
		 * 用逗号隔开的点的集合，注意只有两个点，格式：x,y,x,y
		 */
		public function get points():String{return null;}
		public function set points(value:String):void{}
	}

}
