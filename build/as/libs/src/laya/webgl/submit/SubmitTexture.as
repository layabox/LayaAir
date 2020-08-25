package laya.webgl.submit {
	import laya.webgl.submit.SubmitBase;
	import laya.resource.Context;
	import laya.webgl.shader.d2.value.Value2D;
	import laya.webgl.utils.Mesh2D;
	public class SubmitTexture extends SubmitBase {
		private static var _poolSize:*;
		private static var POOL:*;

		public function SubmitTexture(renderType:Number = undefined){}

		/**
		 * @override 
		 */
		override public function releaseRender():void{}

		/**
		 * @override 
		 */
		override public function renderSubmit():Number{
			return null;
		}
		public static function create(context:Context,mesh:Mesh2D,sv:Value2D):SubmitTexture{
			return null;
		}
	}

}
