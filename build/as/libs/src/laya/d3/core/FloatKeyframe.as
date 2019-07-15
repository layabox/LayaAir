/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.d3.core.Keyframe;
	public class FloatKeyframe extends laya.d3.core.Keyframe {
		public var inTangent:Number;
		public var outTangent:Number;
		public var value:Number;

		public function FloatKeyframe(){}
		public function cloneTo(destObject:*):void{}
	}

}
