/*[IF-FLASH]*/
package laya.utils {
	public class CallLater {
		public static var I:CallLater;
		private var _pool:*;
		private var _map:*;
		private var _laters:*;
		private var _getHandler:*;
		public function callLater(caller:*,method:Function,args:Array = null):void{}
		public function runCallLater(caller:*,method:Function):void{}
	}

}
