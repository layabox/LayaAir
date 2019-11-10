/*[IF-FLASH]*/
package {
	
	/**
	 * littleEndian和bigEndian在As内是用不到的,传入参数仅用于兼容JS
	 * @private
	 */
	public class DataView {
		private var _byteArr:ArrayBuffer;
		
		// 数据位置指针
		public var byteOffset:int = 0;
		
		public function DataView(... arg) {
		}
		
		public function setUint8(pos:int, val:int, le:Boolean = false):void {
		
		}
		
		public function setInt16(idx:int, val:int, le:Boolean = false):void {
		}
		
		public function getInt16(idx:int, le:Boolean = false):int {
			return -1;
		}
		
		public function getUint16(idx:int, le:Boolean = false):uint {
			return 0;
		}
		
		public function setUint16(pos:int, val:uint, le:Boolean = false):void {
		}
		
		public function getUint32(pos:int, littleEndian:Boolean = false):uint {
			return 0;
		}
		
		public function setUint32(pos:int, val:uint, littleEndian:Boolean = false):void {
		}
		
		public function setInt32(pos:int, val:int, le:Boolean = false):void {
		}
		
		public function getInt32(pos:int, le:Boolean = false):int {
			return 0;
		}
		
		public function setInt8(pos:int, val:int):void {
		
		}
		
		public function getInt8(pos:int):int {
			return 0;
		}
		
		public function getUint8(pos:int):uint {
			return 0;
		}
		
		public function getFloat32(pos:int, littleEndian:Boolean = false):Number {
			return 0;
		}
		
		public function setFloat32(pos:int, val:Number, littleEndian:Boolean = false):void {
			return;
		}
		
		public function get byteLength():int {
			return 0;
		}
		
		public function get buffer():ArrayBuffer {
			return null;
		}
	
	}
}