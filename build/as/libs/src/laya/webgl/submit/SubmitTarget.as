/*[IF-FLASH]*/
package laya.webgl.submit {
	improt laya.webgl.submit.ISubmit;
	improt laya.resource.Context;
	improt laya.resource.RenderTexture2D;
	improt laya.webgl.shader.d2.value.Value2D;
	improt laya.webgl.utils.Mesh2D;
	public class SubmitTarget implements laya.webgl.submit.ISubmit {
		public var shaderValue:Value2D;
		public var blendType:Number;
		public var srcRT:RenderTexture2D;

		public function SubmitTarget(){}
		public static var POOL:*;
		public function renderSubmit():Number{}
		public function blend():void{}
		public function getRenderType():Number{}
		public function releaseRender():void{}
		public static function create(context:Context,mesh:Mesh2D,sv:Value2D,rt:RenderTexture2D):SubmitTarget{}
	}

}
