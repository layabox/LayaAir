package laya.webgl.submit {
	import laya.resource.Context;
	import laya.webgl.submit.SubmitBase;

	/**
	 * cache as normal 模式下的生成的canvas的渲染。
	 */
	public class SubmitCanvas extends SubmitBase {
		public var canv:Context;
		public static function create(canvas:*,alpha:Number,filters:Array):SubmitCanvas{
			return null;
		}

		public function SubmitCanvas(){}

		/**
		 * @override 
		 */
		override public function renderSubmit():Number{
			return null;
		}

		/**
		 * @override 
		 */
		override public function releaseRender():void{}

		/**
		 * @override 
		 */
		override public function getRenderType():Number{
			return null;
		}
		public static var POOL:*;
	}

}
