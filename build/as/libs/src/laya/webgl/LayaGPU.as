/*[IF-FLASH]*/
package laya.webgl {
	public class LayaGPU {
		private static var _extentionVendorPrefixes:*;
		private var _gl:*;
		private var _vaoExt:*;
		private var _angleInstancedArrays:*;

		public function LayaGPU(gl:*,isWebGL2:Boolean){}
		private var _getExtension:*;
		public function createVertexArray():*{}
		public function bindVertexArray(vertexArray:*):void{}
		public function deleteVertexArray(vertexArray:*):void{}
		public function isVertexArray(vertexArray:*):void{}
		public function drawElementsInstanced(mode:Number,count:Number,type:Number,offset:Number,instanceCount:Number):void{}
		public function drawArraysInstanced(mode:Number,first:Number,count:Number,instanceCount:Number):void{}
		public function vertexAttribDivisor(index:Number,divisor:Number):void{}
		public function supportInstance():Boolean{}
	}

}
