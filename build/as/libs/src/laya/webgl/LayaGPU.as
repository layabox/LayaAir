package laya.webgl {

	/**
	 * @private 
	 */
	public class LayaGPU {

		/**
		 * @private 
		 */
		private static var _extentionVendorPrefixes:*;

		/**
		 * @private 
		 */
		private var _gl:*;

		/**
		 * @private 
		 */
		private var _vaoExt:*;

		/**
		 * @private 
		 */
		private var _angleInstancedArrays:*;

		/**
		 * @private 
		 */

		public function LayaGPU(gl:* = undefined,isWebGL2:Boolean = undefined){}

		/**
		 * @private 
		 */
		private var _getExtension:*;

		/**
		 * @private 
		 */
		public function createVertexArray():*{}

		/**
		 * @private 
		 */
		public function bindVertexArray(vertexArray:*):void{}

		/**
		 * @private 
		 */
		public function deleteVertexArray(vertexArray:*):void{}

		/**
		 * @private 
		 */
		public function isVertexArray(vertexArray:*):void{}

		/**
		 * @private 
		 */
		public function drawElementsInstanced(mode:Number,count:Number,type:Number,offset:Number,instanceCount:Number):void{}

		/**
		 * @private 
		 */
		public function drawArraysInstanced(mode:Number,first:Number,count:Number,instanceCount:Number):void{}

		/**
		 * @private 
		 */
		public function vertexAttribDivisor(index:Number,divisor:Number):void{}

		/**
		 * @private 
		 */
		public function supportInstance():Boolean{
			return null;
		}
	}

}
