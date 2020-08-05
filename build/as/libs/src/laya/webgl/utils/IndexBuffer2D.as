package laya.webgl.utils {
	import laya.webgl.utils.Buffer2D;
	public class IndexBuffer2D extends Buffer2D {
		public static var create:Function;
		protected var _uint16Array:Uint16Array;

		public function IndexBuffer2D(bufferUsage:Number = undefined){}

		/**
		 * @override 
		 */
		override protected function _checkArrayUse():void{}
		public function getUint16Array():Uint16Array{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function _bindForVAO():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function bind():Boolean{
			return null;
		}
		public function destory():void{}
		public function disposeResource():void{}
	}

}
