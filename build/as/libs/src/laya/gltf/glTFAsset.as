package laya.gltf {

	/**
	 * Metadata about the glTF asset
	 */
	public interface glTFAsset {

		/**
		 * A copyright message suitable for display to credit the content creator.
		 */
		var copyright:String;

		/**
		 * Tool that generated this glTF model. Useful for debugging.
		 */
		var generator:String;

		/**
		 * The glTF version that this asset targets.
		 */
		var version:String;

		/**
		 * The minimum glTF version that this asset targets.
		 */
		var minVersion:String;
	}

}
