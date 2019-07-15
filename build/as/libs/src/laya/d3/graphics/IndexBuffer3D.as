/*[IF-FLASH]*/
package laya.d3.graphics {
	improt laya.webgl.utils.Buffer;
	public class IndexBuffer3D extends laya.webgl.utils.Buffer {
		public static var INDEXTYPE_UBYTE:String;
		public static var INDEXTYPE_USHORT:String;
		public function get indexType():String{};
		public function get indexTypeByteCount():Number{};
		public function get indexCount():Number{};
		public function get canRead():Boolean{};

		public function IndexBuffer3D(indexType:String,indexCount:Number,bufferUsage:Number = null,canRead:Boolean = null){}
		public function _bindForVAO():void{}
		public function bind():Boolean{}
		public function setData(data:*,bufferOffset:Number = null,dataStartIndex:Number = null,dataCount:Number = null):void{}
		public function getData():Uint16Array{}
		public function destroy():void{}
	}

}
