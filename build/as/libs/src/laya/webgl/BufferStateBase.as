/*[IF-FLASH]*/
package laya.webgl {
	public class BufferStateBase {
		private var _nativeVertexArrayObject:*;

		public function BufferStateBase(){}
		public function bind():void{}
		public function unBind():void{}
		public function destroy():void{}
		public function bindForNative():void{}
		public function unBindForNative():void{}
	}

}
