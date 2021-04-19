package laya.gltf {

	/**
	 * Reference to a texture
	 */
	public interface glTFTextureInfo {

		/**
		 * The index of the texture
		 */
		var index:Number;

		/**
		 * The set index of texture's TEXCOORD attribute used for texture coordinate mapping
		 */
		var texCoord:Number;
	}

}
