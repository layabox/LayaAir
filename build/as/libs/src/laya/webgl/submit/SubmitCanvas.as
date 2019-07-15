/*[IF-FLASH]*/
package laya.webgl.submit {
	improt laya.resource.Context;
	improt laya.webgl.submit.SubmitBase;
	public class SubmitCanvas extends laya.webgl.submit.SubmitBase {
		public var canv:Context;
		public static function create(canvas:*,alpha:Number,filters:Array):SubmitCanvas{}

		public function SubmitCanvas(){}
		public function renderSubmit():Number{}
		public function releaseRender():void{}
		public function getRenderType():Number{}
		public static var POOL:*;
	}

}
