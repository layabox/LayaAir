package laya.gltf {

	/**
	 * Targets an animation's sampler at a node's property
	 */
	public interface glTFAnimationChannel {

		/**
		 * * The index of a sampler in this animation used to compute the value for the target
		 */
		var sampler:Number;

		/**
		 * * The index of the node and TRS property to target
		 */
		var target:glTFAnimationChannelTarget;
	}

}
