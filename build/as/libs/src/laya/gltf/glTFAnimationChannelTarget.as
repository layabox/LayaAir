package laya.gltf {

	/**
	 * The index of the node and TRS property that an animation channel targets
	 */
	public interface glTFAnimationChannelTarget {

		/**
		 * The index of the node to target
		 */
		var node:Number;

		/**
		 * The name of the node's TRS property to modify, or the weights of the Morph Targets it instantiates
		 */
		var path:*;
	}

}
