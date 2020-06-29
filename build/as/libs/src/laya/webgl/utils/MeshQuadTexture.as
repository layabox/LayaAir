package laya.webgl.utils {
	import laya.webgl.utils.Mesh2D;

	/**
	 * drawImage，fillRect等会用到的简单的mesh。每次添加必然是一个四边形。
	 */
	public class MeshQuadTexture extends Mesh2D {
		public static var const_stride:Number;
		private static var _fixib:*;
		private static var _maxIB:*;
		private static var _fixattriInfo:*;
		private static var _POOL:*;
		public static function __int__():void{}

		public function MeshQuadTexture(){}

		/**
		 */
		public static function getAMesh(mainctx:Boolean):MeshQuadTexture{
			return null;
		}

		/**
		 * 把本对象放到回收池中，以便getMesh能用。
		 * @override 
		 */
		override public function releaseMesh():void{}

		/**
		 * @override 
		 */
		override public function destroy():void{}

		/**
		 * @param pos 
		 * @param uv 
		 * @param color 
		 * @param clip ox,oy,xx,xy,yx,yy
		 * @param useTex 是否使用贴图。false的话是给fillRect用的
		 */
		public function addQuad(pos:Array,uv:Array,color:Number,useTex:Boolean):void{}
	}

}
