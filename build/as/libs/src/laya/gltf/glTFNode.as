package laya.gltf {

	/**
	 * A node in the node hierarchy
	 */
	public interface glTFNode {

		/**
		 * The index of the camera referenced by this node
		 */
		var camera:Number;

		/**
		 * The indices of this node's children
		 */
		var children:Array;

		/**
		 * The index of the skin referenced by this node
		 */
		var skin:Number;

		/**
		 * A floating-point 4x4 transformation matrix stored in column-major order
		 */
		var matrix:Array;

		/**
		 * The index of the mesh in this node
		 */
		var mesh:Number;

		/**
		 * The node's unit quaternion rotation in the order (x, y, z, w), where w is the scalar
		 */
		var rotation:Array;

		/**
		 * The node's non-uniform scale, given as the scaling factors along the x, y, and z axes
		 */
		var scale:Array;

		/**
		 * The node's translation along the x, y, and z axes
		 */
		var translation:Array;

		/**
		 * The weights of the instantiated Morph Target. Number of elements must match number of Morph Targets of used mesh
		 */
		var weights:Array;
	}

}
