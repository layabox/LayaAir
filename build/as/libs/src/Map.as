/*[IF-FLASH]*/
package {
	
	/**
	 * @private
	 */
	public class Map {
		public function Map(... args) {
		}
		
		public function get(key:*):* {
			return null;
		}
		
		public function set(key:*, value:*):void {
		}
		
		public function clear():void { }
	
		public function size():int { return 0; }
		
		public function  forEach(f:Function):void{//(value,key,map)			
		}
	
		//public function delete():Boolean { return false; } 不能用delete做函数名？
	}
}