/*[IF-FLASH]*/
package laya.d3.resource.models {
	improt laya.d3.resource.models.Mesh;
	public class PrimitiveMesh {
		public static function __init__():void{}
		public static function createBox(long:Number = null,height:Number = null,width:Number = null):Mesh{}
		public static function createCapsule(radius:Number = null,height:Number = null,stacks:Number = null,slices:Number = null):Mesh{}
		public static function createCone(radius:Number = null,height:Number = null,slices:Number = null):Mesh{}
		public static function createCylinder(radius:Number = null,height:Number = null,slices:Number = null):Mesh{}
		public static function createPlane(long:Number = null,width:Number = null,stacks:Number = null,slices:Number = null):Mesh{}
		public static function createQuad(long:Number = null,width:Number = null):Mesh{}
		public static function createSphere(radius:Number = null,stacks:Number = null,slices:Number = null):Mesh{}
	}

}
