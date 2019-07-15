/*[IF-FLASH]*/
package laya.d3.utils {
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.math.Ray;
	improt laya.d3.math.Vector2;
	improt laya.d3.math.Vector3;
	improt laya.d3.math.Viewport;
	public class Picker {
		private static var _tempVector30:*;
		private static var _tempVector31:*;
		private static var _tempVector32:*;
		private static var _tempVector33:*;
		private static var _tempVector34:*;

		public function Picker(){}
		public static function calculateCursorRay(point:Vector2,viewPort:Viewport,projectionMatrix:Matrix4x4,viewMatrix:Matrix4x4,world:Matrix4x4,out:Ray):void{}
		public static function rayIntersectsTriangle(ray:Ray,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3):Number{}
	}

}
