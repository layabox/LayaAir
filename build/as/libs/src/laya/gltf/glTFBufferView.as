package laya.gltf {

	/**
	 * A view into a buffer generally representing a subset of the buffer
	 */
	public interface glTFBufferView {

		/**
		 * The index of the buffer
		 */
		var buffer:Number;

		/**
		 * The offset into the buffer in bytes
		 */
		var byteOffset:Number;

		/**
		 * The lenth of the bufferView in bytes
		 */
		var byteLength:Number;

		/**
		 * The stride, in bytes
		 */
		var byteStride:Number;
	}

}
