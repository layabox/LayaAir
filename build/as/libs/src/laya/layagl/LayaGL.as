/*[IF-FLASH]*/
package laya.layagl {
	improt laya.layagl.CommandEncoder;
	improt laya.webgl.LayaGPU;
	public class LayaGL {
		public static var EXECUTE_JS_THREAD_BUFFER:Number;
		public static var EXECUTE_RENDER_THREAD_BUFFER:Number;
		public static var EXECUTE_COPY_TO_RENDER:Number;
		public static var EXECUTE_COPY_TO_RENDER3D:Number;
		public static var ARRAY_BUFFER_TYPE_DATA:Number;
		public static var ARRAY_BUFFER_TYPE_CMD:Number;
		public static var ARRAY_BUFFER_REF_REFERENCE:Number;
		public static var ARRAY_BUFFER_REF_COPY:Number;
		public static var UPLOAD_SHADER_UNIFORM_TYPE_ID:Number;
		public static var UPLOAD_SHADER_UNIFORM_TYPE_DATA:Number;
		public static var instance:WebGLRenderingContext;
		public static var layaGPUInstance:LayaGPU;
		public function createCommandEncoder(reserveSize:Number = null,adjustSize:Number = null,isSyncToRenderThread:Boolean = null):CommandEncoder{}
		public function beginCommandEncoding(commandEncoder:CommandEncoder):void{}
		public function endCommandEncoding():void{}
		public static function getFrameCount():Number{}
		public static function syncBufferToRenderThread(value:*,index:Number = null):void{}
		public static function createArrayBufferRef(arrayBuffer:*,type:Number,syncRender:Boolean):void{}
		public static function createArrayBufferRefs(arrayBuffer:*,type:Number,syncRender:Boolean,refType:Number):void{}
		public function matrix4x4Multiply(m1:*,m2:*,out:*):void{}
		public function evaluateClipDatasRealTime(nodes:*,playCurTime:Number,realTimeCurrentFrameIndexs:*,addtive:Boolean):void{}
	}

}
