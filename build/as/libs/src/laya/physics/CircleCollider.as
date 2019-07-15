/*[IF-FLASH]*/
package laya.physics {
	improt laya.physics.ColliderBase;
	public class CircleCollider extends laya.physics.ColliderBase {
		private static var _temp:*;
		private var _x:*;
		private var _y:*;
		private var _radius:*;
		protected function getDef():*{}
		private var _setShape:*;
		public var x:Number;
		public var y:Number;
		public var radius:Number;
		public function resetShape(re:Boolean = null):void{}
	}

}
