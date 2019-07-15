/*[IF-FLASH]*/
package laya.webgl.canvas {
	improt laya.utils.ColorUtils;
	public class DrawStyle {
		public static var DEFAULT:DrawStyle;
		public var _color:ColorUtils;
		public static function create(value:*):DrawStyle{}

		public function DrawStyle(value:*){}
		public function setValue(value:*):void{}
		public function reset():void{}
		public function toInt():Number{}
		public function equal(value:*):Boolean{}
		public function toColorStr():String{}
	}

}
