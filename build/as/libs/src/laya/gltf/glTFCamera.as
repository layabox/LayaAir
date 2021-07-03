package laya.gltf {

	/**
	 * A camera's projection.  A node can reference a camera to apply a transform to place the camera in the scene
	 */
	public interface glTFCamera {

		/**
		 * An orthographic camera containing properties to create an orthographic projection matrix
		 */
		var orthographic:glTFCameraOrthographic;

		/**
		 * A perspective camera containing properties to create a perspective projection matrix
		 */
		var perspective:glTFCameraPerspective;

		/**
		 * Specifies if the camera uses a perspective or orthographic projection
		 */
		var type:*;
	}

}
