/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.particleShuriKen.module.GradientVelocity;
	improt laya.d3.core.IClone;
	public class VelocityOverLifetime implements laya.d3.core.IClone {
		public var enbale:Boolean;
		public var space:Number;
		public function get velocity():GradientVelocity{};

		public function VelocityOverLifetime(velocity:GradientVelocity){}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
