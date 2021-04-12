package laya.gltf {

	/**
	 * A keyframe animation.
	 */
	public interface glTFAnimation {

		/**
		 * An array of channels, each of which targets an animation's sampler at a node's property
		 */
		var channels:Array;

		/**
		 * An array of samplers that combines input and output accessors with an interpolation algorithm to define a keyframe graph (but not its target)
		 */
		var samplers:Array;
	}

}
