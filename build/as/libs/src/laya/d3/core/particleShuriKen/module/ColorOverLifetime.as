/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.particleShuriKen.module.GradientColor;
	public class ColorOverLifetime {
		private var _color:*;
		public var enbale:Boolean;
		public function get color():GradientColor{};

		public function ColorOverLifetime(color:GradientColor){}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
