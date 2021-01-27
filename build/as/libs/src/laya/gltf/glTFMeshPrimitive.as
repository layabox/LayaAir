package laya.gltf {

	/**
	 * Geometry to be rendered with the given material
	 */
	public interface glTFMeshPrimitive {

		/**
		 * A dictionary object, where each key corresponds to mesh attribute semantic and each value is the index of the accessor containing attribute's data
		 */
		var attributes:*;

		/**
		 * The index of the accessor that contains the indices
		 */
		var indices:Number;

		/**
		 * The index of the material to apply to this primitive when rendering
		 */
		var material:Number;

		/**
		 * The type of primitives to render. All valid values correspond to WebGL enums
		 */
		var mode:*;

		/**
		 * An array of Morph Targets, each  Morph Target is a dictionary mapping attributes (only POSITION, NORMAL, and TANGENT supported) to their deviations in the Morph Target
		 */
		var targets:Array;
	}

}
