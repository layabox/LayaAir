/*[IF-FLASH]*/
package laya.utils {
	improt laya.display.Graphics;
	public class HitArea {
		private static var _cmds:*;
		private static var _rect:*;
		private static var _ptPoint:*;
		private var _hit:*;
		private var _unHit:*;
		public function contains(x:Number,y:Number):Boolean{}
		public static function _isHitGraphic(x:Number,y:Number,graphic:Graphics):Boolean{}
		public var hit:Graphics;
		public var unHit:Graphics;
	}

}
