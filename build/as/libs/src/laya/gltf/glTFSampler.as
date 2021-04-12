package laya.gltf {

	/**
	 * Texture sampler properties for filtering and wrapping modes
	 */
	public interface glTFSampler {

		/**
		 * Magnification filter.  Valid values correspond to WebGL enums: 9728 (NEAREST) and 9729 (LINEAR)
		 */
		var magFilter:*;

		/**
		 * Minification filter.  All valid values correspond to WebGL enums
		 */
		var minFilter:*;

		/**
		 * S (U) wrapping mode.  All valid values correspond to WebGL enums
		 */
		var wrapS:*;

		/**
		 * T (V) wrapping mode.  All valid values correspond to WebGL enums
		 */
		var wrapT:*;
	}

}
