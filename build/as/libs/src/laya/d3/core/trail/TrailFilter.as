/*[IF-FLASH]*/
package laya.d3.core.trail {
	improt laya.d3.math.Vector3;
	improt laya.d3.core.FloatKeyframe;
	improt laya.d3.core.Gradient;
	improt laya.d3.core.trail.TrailSprite3D;
	public class TrailFilter {
		public static var CURTIME:Number;
		public static var LIFETIME:Number;
		public static var WIDTHCURVE:Number;
		public static var WIDTHCURVEKEYLENGTH:Number;
		public var _owner:TrailSprite3D;
		public var _lastPosition:Vector3;
		public var _curtime:Number;
		public var alignment:Number;
		public var time:Number;
		public var minVertexDistance:Number;
		public var widthMultiplier:Number;
		public var widthCurve:Array;
		public var colorGradient:Gradient;
		public var textureMode:Number;

		public function TrailFilter(owner:TrailSprite3D){}
		public static var ALIGNMENT_VIEW:Number;
		public static var ALIGNMENT_TRANSFORM_Z:Number;
	}

}
