/*[IF-FLASH]*/
package laya.physics {
	improt laya.physics.ColliderBase;
	public class ChainCollider extends laya.physics.ColliderBase {
		private var _x:*;
		private var _y:*;
		private var _points:*;
		private var _loop:*;
		protected function getDef():*{}
		private var _setShape:*;
		public var x:Number;
		public var y:Number;
		public var points:String;
		public var loop:Boolean;
	}

}
