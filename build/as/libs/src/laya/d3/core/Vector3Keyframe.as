/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.d3.core.Keyframe;
	improt laya.d3.math.Vector3;
	public class Vector3Keyframe extends laya.d3.core.Keyframe {
		public var inTangent:Vector3;
		public var outTangent:Vector3;
		public var value:Vector3;

		public function Vector3Keyframe(){}
		public function cloneTo(dest:*):void{}
	}

}
