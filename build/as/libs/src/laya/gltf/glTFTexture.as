package laya.gltf {

	/**
	 * A texture and its sampler
	 */
	public interface glTFTexture {

		/**
		 * The index of the sampler used by this texture. When undefined, a sampler with repeat wrapping and auto filtering should be used
		 */
		var sampler:Number;

		/**
		 * The index of the image used by this texture
		 */
		var source:Number;
	}

}
