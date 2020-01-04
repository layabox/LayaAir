package laya.webgl.submit {
	import laya.resource.Context;
	import laya.webgl.shader.d2.value.Value2D;
	import laya.webgl.utils.Mesh2D;
	import laya.webgl.submit.SubmitBase;
	public class Submit extends SubmitBase {
		protected static var _poolSize:Number;
		protected static var POOL:Array;

		public function Submit(renderType:Number = undefined){}

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
		public static function create(context:Context,mesh:Mesh2D,sv:Value2D):Submit{
			return null;
		}

		/**
		 * 创建一个矢量submit
		 * @param ctx 
		 * @param mesh 
		 * @param numEle 对应drawElement的第二个参数:count
		 * @param offset drawElement的时候的ib的偏移。
		 * @param sv Value2D
		 * @return 
		 */
		public static function createShape(ctx:Context,mesh:Mesh2D,numEle:Number,sv:Value2D):Submit{
			return null;
		}
	}

}
