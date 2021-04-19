package laya.gltf {
	public interface glTFAccessorSparseValues {

		/**
		 * The index of the bufferView with sparse values. Referenced bufferView can't have ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER target
		 */
		var bufferView:Number;

		/**
		 * The offset relative to the start of the bufferView in bytes. Must be aligned
		 */
		var byteOffset:Number;
	}

}
