package laya.gltf {

	/**
	 * The material appearance of a primitive
	 */
	public interface glTFMaterial {

		/**
		 * A set of parameter values that are used to define the metallic-roughness material model from Physically-Based Rendering (PBR) methodology. When not specified, all the default values of pbrMetallicRoughness apply
		 */
		var pbrMetallicRoughness:glTFMaterialPbrMetallicRoughness;

		/**
		 * The normal map texture
		 */
		var normalTexture:glTFMaterialNormalTextureInfo;

		/**
		 * The occlusion map texture
		 */
		var occlusionTexture:glTFMaterialOcclusionTextureInfo;

		/**
		 * The emissive map texture
		 */
		var emissiveTexture:glTFTextureInfo;

		/**
		 * The RGB components of the emissive color of the material. These values are linear. If an emissiveTexture is specified, this value is multiplied with the texel values
		 */
		var emissiveFactor:Array;

		/**
		 * The alpha rendering mode of the material
		 */
		var alphaMode:*;

		/**
		 * The alpha cutoff value of the material
		 */
		var alphaCutoff:Number;

		/**
		 * Specifies whether the material is double sided
		 */
		var doubleSided:Boolean;
	}

}
