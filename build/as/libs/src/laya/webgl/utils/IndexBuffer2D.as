/*[IF-FLASH]*/
package laya.webgl.utils {
	improt laya.webgl.utils.Buffer2D;
	public class IndexBuffer2D extends laya.webgl.utils.Buffer2D {
		public static var create:Function;
		protected var _uint16Array:Uint16Array;

		public function IndexBuffer2D(bufferUsage:Number = null){}
		protected function _checkArrayUse():void{}
		public function getUint16Array():Uint16Array{}
		public function _bindForVAO():void{}
		public function bind():Boolean{}
		public function destory():void{}
		public function disposeResource():void{}
	}

}
