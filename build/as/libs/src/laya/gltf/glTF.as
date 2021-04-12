package laya.gltf {
	public interface glTF {

		/**
		 * An array of accessors. An accessor is a typed view into a bufferView
		 */
		var accessors:Array;

		/**
		 * An array of keyframe animations
		 */
		var animations:Array;

		/**
		 * Metadata about the glTF asset
		 */
		var asset:glTFAsset;

		/**
		 * An array of buffers.  A buffer points to binary geometry, animation, or skins
		 */
		var buffers:Array;

		/**
		 * An array of bufferViews.  A bufferView is a view into a buffer generally representing a subset of the buffer
		 */
		var bufferViews:Array;

		/**
		 * An array of cameras
		 */
		var cameras:Array;

		/**
		 * Names of glTF extensions used somewhere in this asset
		 */
		var extensionsUsed:Array;

		/**
		 * Names of glTF extensions required to properly load this asset
		 */
		var extensionsRequired:Array;

		/**
		 * An array of images.  An image defines data used to create a texture
		 */
		var images:Array;

		/**
		 * An array of materials.  A material defines the appearance of a primitive
		 */
		var materials:Array;

		/**
		 * An array of meshes.  A mesh is a set of primitives to be rendered
		 */
		var meshes:Array;

		/**
		 * An array of nodes
		 */
		var nodes:Array;

		/**
		 * An array of samplers.  A sampler contains properties for texture filtering and wrapping modes
		 */
		var samplers:Array;

		/**
		 * The index of the default scene
		 */
		var scene:Number;

		/**
		 * An array of scenes
		 */
		var scenes:Array;

		/**
		 * An array of skins.  A skin is defined by joints and matrices
		 */
		var skins:Array;

		/**
		 * An array of textures
		 */
		var textures:Array;
	}

}
