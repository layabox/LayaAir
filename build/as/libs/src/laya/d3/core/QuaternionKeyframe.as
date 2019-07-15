/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.d3.core.Keyframe;
	improt laya.d3.math.Quaternion;
	improt laya.d3.math.Vector4;
	public class QuaternionKeyframe extends laya.d3.core.Keyframe {
		public var inTangent:Vector4;
		public var outTangent:Vector4;
		public var value:Quaternion;

		public function QuaternionKeyframe(){}
		public function cloneTo(dest:*):void{}
	}

}
