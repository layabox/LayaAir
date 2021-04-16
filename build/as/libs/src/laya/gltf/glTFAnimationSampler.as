package laya.gltf {

	/**
	 * Combines input and output accessors with an interpolation algorithm to define a keyframe graph (but not its target)
	 */
	public interface glTFAnimationSampler {

		/**
		 * The index of an accessor containing keyframe input values, e.g., time
		 */
		var input:Number;

		/**
		 * Interpolation algorithm
		 */
		var interpolation:*;

		/**
		 * The index of an accessor, containing keyframe output values
		 */
		var output:Number;
	}

}
