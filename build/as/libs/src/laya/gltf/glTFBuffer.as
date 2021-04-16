package laya.gltf {

	/**
	 * A buffer points to binary geometry, animation, or skins
	 */
	public interface glTFBuffer {

		/**
		 * The uri of the buffer.  Relative paths are relative to the .gltf file.  Instead of referencing an external file, the uri can also be a data-uri
		 */
		var uri:String;

		/**
		 * The length of the buffer in bytes
		 */
		var byteLength:Number;
	}

}
