package laya.gltf {

	/**
	 * An orthographic camera containing properties to create an orthographic projection matrix
	 */
	public interface glTFCameraOrthographic {

		/**
		 * The floating-point horizontal magnification of the view. Must not be zero
		 */
		var xmag:Number;

		/**
		 * The floating-point vertical magnification of the view. Must not be zero
		 */
		var ymag:Number;

		/**
		 * The floating-point distance to the far clipping plane. zfar must be greater than znear
		 */
		var zfar:Number;

		/**
		 * The floating-point distance to the near clipping plane
		 */
		var znear:Number;
	}

}
