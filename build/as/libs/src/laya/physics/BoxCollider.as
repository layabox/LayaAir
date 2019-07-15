/*[IF-FLASH]*/
package laya.physics {
	improt laya.physics.ColliderBase;
	public class BoxCollider extends laya.physics.ColliderBase {
		private static var _temp:*;
		private var _x:*;
		private var _y:*;
		private var _width:*;
		private var _height:*;
		protected function getDef():*{}
		private var _setShape:*;
		public var x:Number;
		public var y:Number;
		public var width:Number;
		public var height:Number;
		public function resetShape(re:Boolean = null):void{}
	}

}
