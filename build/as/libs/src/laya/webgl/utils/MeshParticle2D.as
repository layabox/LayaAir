package laya.webgl.utils {
	import laya.webgl.utils.Mesh2D;

	/**
	 * drawImage，fillRect等会用到的简单的mesh。每次添加必然是一个四边形。
	 */
	public class MeshParticle2D extends Mesh2D {
		public static var const_stride:Number;
		private static var _fixattriInfo:*;
		private static var _POOL:*;
		public static function __init__():void{}

		public function MeshParticle2D(maxNum:Number = undefined){}
		public function setMaxParticleNum(maxNum:Number):void{}

		/**
		 */
		public static function getAMesh(maxNum:Number):MeshParticle2D{
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
	}

}
