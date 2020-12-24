package laya.webgl.submit {
	import laya.webgl.submit.ISubmit;
	import laya.resource.Context;
	import laya.resource.RenderTexture2D;
	import laya.webgl.shader.d2.value.Value2D;
	import laya.webgl.utils.Mesh2D;
	public class SubmitTarget implements ISubmit {
		public var shaderValue:Value2D;
		public var blendType:Number;
		public var srcRT:RenderTexture2D;

		public function SubmitTarget(){}
		public static var POOL:*;
		public function renderSubmit():Number{
			return null;
		}
		public function blend():void{}
		public function getRenderType():Number{
			return null;
		}
		public function releaseRender():void{}
		public static function create(context:Context,mesh:Mesh2D,sv:Value2D,rt:RenderTexture2D):SubmitTarget{
			return null;
		}
	}

}
