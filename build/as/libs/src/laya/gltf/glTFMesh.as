package laya.gltf {

	/**
	 * A set of primitives to be rendered.  A node can contain one mesh.  A node's transform places the mesh in the scene
	 */
	public interface glTFMesh {

		/**
		 * An array of primitives, each defining geometry to be rendered with a material
		 */
		var primitives:Array;

		/**
		 * Array of weights to be applied to the Morph Targets
		 */
		var weights:Array;
	}

}
