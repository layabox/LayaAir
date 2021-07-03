package laya.gltf {
	public interface glTFAccessorSparseIndeces {

		/**
		 * The index of the bufferView with sparse indices. Referenced bufferView can't have ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER target
		 */
		var bufferView:Number;

		/**
		 * The offset relative to the start of the bufferView in bytes. Must be aligned
		 */
		var byteOffset:Number;

		/**
		 * The indices data type.  Valid values correspond to WebGL enums: 5121 (UNSIGNED_BYTE), 5123 (UNSIGNED_SHORT), 5125 (UNSIGNED_INT)
		 */
		var componentType:*;
	}

}
