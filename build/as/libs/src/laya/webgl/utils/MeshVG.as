package laya.webgl.utils {
	import laya.resource.Context;
	import laya.webgl.utils.Mesh2D;

	/**
	 * 用来画矢量的mesh。顶点格式固定为 x,y,rgba
	 */
	public class MeshVG extends Mesh2D {
		public static var const_stride:Number;
		private static var _fixattriInfo:*;
		private static var _POOL:*;
		public static function __init__():void{}

		public function MeshVG(){}
		public static function getAMesh(mainctx:Boolean):MeshVG{
			return null;
		}

		/**
		 * 往矢量mesh中添加顶点和index。会把rgba和points在mesh中合并。
		 * @param points 顶点数组，只包含x,y。[x,y,x,y...]
		 * @param rgba rgba颜色
		 * @param ib index数组。
		 */
		public function addVertAndIBToMesh(ctx:Context,points:Array,rgba:Number,ib:Array):void{}

		/**
		 * 把本对象放到回收池中，以便getMesh能用。
		 * @override 
		 */
		override public function releaseMesh():void{}

		/**
		 * @override 
		 */
		override public function destroy():void{}
	}

}
