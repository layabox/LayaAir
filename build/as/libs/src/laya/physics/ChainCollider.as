package laya.physics {
	import laya.physics.ColliderBase;

	/**
	 * 2D线形碰撞体
	 */
	public class ChainCollider extends ColliderBase {

		/**
		 * 相对节点的x轴偏移
		 */
		private var _x:*;

		/**
		 * 相对节点的y轴偏移
		 */
		private var _y:*;

		/**
		 * 用逗号隔开的点的集合，格式：x,y,x,y ...
		 */
		private var _points:*;

		/**
		 * 是否是闭环，注意不要有自相交的链接形状，它可能不能正常工作
		 */
		private var _loop:*;

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
		 * 用逗号隔开的点的集合，格式：x,y,x,y ...
		 */
		public var points:String;

		/**
		 * 是否是闭环，注意不要有自相交的链接形状，它可能不能正常工作
		 */
		public var loop:Boolean;
	}

}
