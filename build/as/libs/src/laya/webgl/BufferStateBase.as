package laya.webgl {

	/**
	 * ...
	 * @author ...
	 */
	public class BufferStateBase {

		/**
		 * @private [只读]
		 */
		private var _nativeVertexArrayObject:*;

		public function BufferStateBase(){}

		/**
		 * @private 
		 */
		public function bind():void{}

		/**
		 * @private 
		 */
		public function unBind():void{}

		/**
		 * @private 
		 */
		public function destroy():void{}

		/**
		 * @private 
		 */
		public function bindForNative():void{}

		/**
		 * @private 
		 */
		public function unBindForNative():void{}
	}

}
