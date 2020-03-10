package laya.physics {
	import laya.physics.ColliderBase;

	/**
	 * 2D多边形碰撞体，暂时不支持凹多边形，如果是凹多边形，先手动拆分为多个凸多边形
	 * 节点个数最多是b2_maxPolygonVertices，这数值默认是8，所以点的数量不建议超过8个，也不能小于3个
	 */
	public class PolygonCollider extends ColliderBase {

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
	}

}
