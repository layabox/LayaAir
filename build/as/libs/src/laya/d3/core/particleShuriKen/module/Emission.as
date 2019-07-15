/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.particleShuriKen.module.Burst;
	improt laya.d3.core.IClone;
	improt laya.resource.IDestroy;
	public class Emission implements laya.d3.core.IClone,laya.resource.IDestroy {
		private var _destroyed:*;
		private var _emissionRate:*;
		public var enbale:Boolean;
		public var emissionRate:Number;
		public function get destroyed():Boolean{};

		public function Emission(){}
		public function destroy():void{}
		public function getBurstsCount():Number{}
		public function getBurstByIndex(index:Number):Burst{}
		public function addBurst(burst:Burst):void{}
		public function removeBurst(burst:Burst):void{}
		public function removeBurstByIndex(index:Number):void{}
		public function clearBurst():void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
