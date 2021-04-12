package laya.gltf {

	/**
	 * A perspective camera containing properties to create a perspective projection matrix
	 */
	public interface glTFCameraPerspective {

		/**
		 * The floating-point aspect ratio of the field of view
		 */
		var aspectRatio:Number;

		/**
		 * The floating-point vertical field of view in radians
		 */
		var yfov:Number;

		/**
		 * The floating-point distance to the far clipping plane
		 */
		var zfar:Number;

		/**
		 * The floating-point distance to the near clipping plane
		 */
		var znear:Number;
	}

}
