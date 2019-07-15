/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.particleShuriKen.module.GradientSize;
	improt laya.d3.core.IClone;
	public class SizeOverLifetime implements laya.d3.core.IClone {
		private var _size:*;
		public var enbale:Boolean;
		public function get size():GradientSize{};

		public function SizeOverLifetime(size:GradientSize){}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
