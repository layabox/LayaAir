/*[IF-FLASH]*/
package laya.webgl.utils {
	improt laya.webgl.utils.Mesh2D;
	improt laya.resource.Context;
	public class MeshVG extends laya.webgl.utils.Mesh2D {
		public static var const_stride:Number;
		private static var _fixattriInfo:*;
		private static var _POOL:*;
		public static function __init__():void{}

		public function MeshVG(){}
		public static function getAMesh(mainctx:Boolean):MeshVG{}
		public function addVertAndIBToMesh(ctx:Context,points:Array,rgba:Number,ib:Array):void{}
		public function releaseMesh():void{}
		public function destroy():void{}
	}

}
