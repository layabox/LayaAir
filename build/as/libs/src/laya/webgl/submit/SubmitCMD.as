/*[IF-FLASH]*/
package laya.webgl.submit {
	improt laya.webgl.submit.ISubmit;
	public class SubmitCMD implements laya.webgl.submit.ISubmit {
		public static var POOL:*;
		public var fun:Function;
		public var args:Array;

		public function SubmitCMD(){}
		public function renderSubmit():Number{}
		public function getRenderType():Number{}
		public function releaseRender():void{}
		public static function create(args:Array,fun:Function,thisobj:*):SubmitCMD{}
	}

}
