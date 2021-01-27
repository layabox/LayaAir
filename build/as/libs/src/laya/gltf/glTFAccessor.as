package laya.gltf {

	/**
	 * Indices of those attributes that deviate from their initialization value
	 */
	public interface glTFAccessor {

		/**
		 * The index of the bufferView.
		 */
		var bufferView:Number;

		/**
		 * The offset relative to the start of the bufferView in bytes.
		 */
		var byteOffset:Number;

		/**
		 * The datatype of components in the attribute.
		 */
		var componentType:*;

		/**
		 * Specifies whether integer data values should be normalized.
		 */
		var normalized:Boolean;

		/**
		 * The number of attributes referenced by this accessor.
		 */
		var count:Number;

		/**
		 * Specifies if the attribute is a scalar, vector, or matrix.
		 */
		var type:*;

		/**
		 * Maximum value of each component in this attribute.
		 */
		var max:Array;

		/**
		 * Minimum value of each component in this attribute.
		 */
		var min:Array;

		/**
		 * Sparse storage of attributes that deviate from their initialization value.
		 */
		var sparse:glTFAccessorSparse;
	}

}
