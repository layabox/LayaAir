/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.particleShuriKen.module.GradientAngularVelocity;
	improt laya.d3.core.IClone;
	public class RotationOverLifetime implements laya.d3.core.IClone {
		private var _angularVelocity:*;
		public var enbale:Boolean;
		public function get angularVelocity():GradientAngularVelocity{};

		public function RotationOverLifetime(angularVelocity:GradientAngularVelocity){}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
