package laya.webgl.submit {
	import laya.webgl.submit.ISubmit;
	public class SubmitCMD implements ISubmit {
		public static var POOL:*;
		public var fun:Function;
		public var args:Array;

		public function SubmitCMD(){}
		public function renderSubmit():Number{
			return null;
		}
		public function getRenderType():Number{
			return null;
		}
		public function releaseRender():void{}
		public static function create(args:Array,fun:Function,thisobj:*):SubmitCMD{
			return null;
		}
	}

}
