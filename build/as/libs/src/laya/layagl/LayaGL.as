package laya.layagl {
	import laya.webgl.LayaGPU;

	/*
	 * @private 封装GL命令
	 */
	public class LayaGL {
		public static var ARRAY_BUFFER_TYPE_DATA:Number;
		public static var ARRAY_BUFFER_TYPE_CMD:Number;
		public static var ARRAY_BUFFER_REF_REFERENCE:Number;
		public static var ARRAY_BUFFER_REF_COPY:Number;
		public static var UPLOAD_SHADER_UNIFORM_TYPE_ID:Number;
		public static var UPLOAD_SHADER_UNIFORM_TYPE_DATA:Number;
		public static var instance:*;
		public static var layaGPUInstance:LayaGPU;
	}

}
