package laya.gltf {

	/**
	 * A set of parameter values that are used to define the metallic-roughness material model from Physically-Based Rendering (PBR) methodology
	 */
	public interface glTFMaterialPbrMetallicRoughness {

		/**
		 * The material's base color factor
		 */
		var baseColorFactor:Array;

		/**
		 * The base color texture
		 */
		var baseColorTexture:glTFTextureInfo;

		/**
		 * The metalness of the material
		 */
		var metallicFactor:Number;

		/**
		 * The roughness of the material
		 */
		var roughnessFactor:Number;

		/**
		 * The metallic-roughness texture
		 */
		var metallicRoughnessTexture:glTFTextureInfo;
	}

}
