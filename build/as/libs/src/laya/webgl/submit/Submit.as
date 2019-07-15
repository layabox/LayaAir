/*[IF-FLASH]*/
package laya.webgl.submit {
	improt laya.resource.Context;
	improt laya.webgl.shader.d2.value.Value2D;
	improt laya.webgl.utils.Mesh2D;
	improt laya.webgl.submit.SubmitBase;
	public class Submit extends laya.webgl.submit.SubmitBase {
		protected static var _poolSize:Number;
		protected static var POOL:Array;

		public function Submit(renderType:Number = null){}
		public function renderSubmit():Number{}
		public function releaseRender():void{}
		public static function create(context:Context,mesh:Mesh2D,sv:Value2D):Submit{}
		public static function createShape(ctx:Context,mesh:Mesh2D,numEle:Number,sv:Value2D):Submit{}
	}

}
