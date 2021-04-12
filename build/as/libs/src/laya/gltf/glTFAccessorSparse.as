package laya.gltf {
	public interface glTFAccessorSparse {

		/**
		 * Number of entries stored in the sparse array.
		 */
		var count:Number;

		/**
		 * Index array of size count that points to those accessor attributes that deviate from their initialization value. Indices must strictly increase
		 */
		var indices:glTFAccessorSparseIndeces;

		/**
		 * Array of size count times number of components, storing the displaced accessor attributes pointed by indices. Substituted values must have the same componentType and number of components as the base accessor
		 */
		var values:glTFAccessorSparseValues;
	}

}
