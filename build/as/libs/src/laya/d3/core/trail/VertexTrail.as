/*[IF-FLASH]*/
package laya.d3.core.trail {
	improt laya.d3.graphics.IVertex;
	improt laya.d3.graphics.VertexDeclaration;
	public class VertexTrail implements laya.d3.graphics.IVertex {
		public static var TRAIL_POSITION0:Number;
		public static var TRAIL_OFFSETVECTOR:Number;
		public static var TRAIL_TIME0:Number;
		public static var TRAIL_TEXTURECOORDINATE0Y:Number;
		public static var TRAIL_TEXTURECOORDINATE0X:Number;
		public static var TRAIL_COLOR:Number;
		private static var _vertexDeclaration1:*;
		private static var _vertexDeclaration2:*;
		public static function get vertexDeclaration1():VertexDeclaration{};
		public static function get vertexDeclaration2():VertexDeclaration{};
		public function get vertexDeclaration():VertexDeclaration{};

		public function VertexTrail(){}
	}

}
