/*[IF-FLASH]*/
package laya.webgl.submit {
	improt laya.webgl.submit.SubmitBase;
	improt laya.resource.Context;
	improt laya.webgl.shader.d2.value.Value2D;
	improt laya.webgl.utils.Mesh2D;
	public class SubmitTexture extends laya.webgl.submit.SubmitBase {
		private static var _poolSize:*;
		private static var POOL:*;

		public function SubmitTexture(renderType:Number = null){}
		public function releaseRender():void{}
		public function renderSubmit():Number{}
		public static function create(context:Context,mesh:Mesh2D,sv:Value2D):SubmitTexture{}
	}

}
