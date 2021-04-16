package laya.gltf {

	public class glTFMaterialAlphaMode {

		/**
		 * The alpha value is ignored and the rendered output is fully opaque
		 */
		public static var OPAQUE:String = "OPAQUE";

		/**
		 * The rendered output is either fully opaque or fully transparent depending on the alpha value and the specified alpha cutoff value
		 */
		public static var MASK:String = "MASK";

		/**
		 * The alpha value is used to composite the source and destination areas. The rendered output is combined with the background using the normal painting operation (i.e. the Porter and Duff over operator)
		 */
		public static var BLEND:String = "BLEND";

	}
}