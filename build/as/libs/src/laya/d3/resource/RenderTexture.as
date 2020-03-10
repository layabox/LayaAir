package laya.d3.resource {
	import laya.resource.BaseTexture;
	import laya.resource.RenderTextureFormat;

	/**
	 * <code>RenderTexture</code> 类用于创建渲染目标。
	 */
	public class RenderTexture extends BaseTexture {

		/**
		 * 获取当前激活的Rendertexture。
		 */
		public static function get currentActive():RenderTexture{
				return null;
		}

		/**
		 * 从对象池获取临时渲染目标。
		 */
		public static function createFromPool(width:Number,height:Number,format:Number = null,depthStencilFormat:Number = null):RenderTexture{
			return null;
		}

		/**
		 * 回收渲染目标到对象池,释放后可通过createFromPool复用。
		 */
		public static function recoverToPool(renderTexture:RenderTexture):void{}

		/**
		 * 深度格式。
		 */
		public function get depthStencilFormat():Number{
				return null;
		}

		/**
		 * @param width 宽度。
		 * @param height 高度。
		 * @param format 纹理格式。
		 * @param depthStencilFormat 深度格式。创建一个 <code>RenderTexture</code> 实例。
		 */

		public function RenderTexture(width:Number = undefined,height:Number = undefined,format:int = undefined,depthStencilFormat:int = undefined){}

		/**
		 * 获得像素数据。
		 * @param x X像素坐标。
		 * @param y Y像素坐标。
		 * @param width 宽度。
		 * @param height 高度。
		 * @return 像素数据。
		 */
		public function getData(x:Number,y:Number,width:Number,height:Number,out:Uint8Array):Uint8Array{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _disposeResource():void{}
	}

}
