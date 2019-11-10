package laya.resource {
	import laya.resource.BaseTexture;

	/**
	 * <code>RenderTexture</code> 类用于创建渲染目标。
	 */
	public class RenderTexture2D extends BaseTexture {

		/**
		 * @private 
		 */
		private static var _currentActive:*;
		private var _lastRT:*;
		private var _lastWidth:*;
		private var _lastHeight:*;
		private static var rtStack:*;
		public static var defuv:Array;
		public static var flipyuv:Array;

		/**
		 * 获取当前激活的Rendertexture
		 */
		public static function get currentActive():RenderTexture2D{
				return null;
		}

		/**
		 * @private 
		 */
		private var _frameBuffer:*;

		/**
		 * @private 
		 */
		private var _depthStencilBuffer:*;

		/**
		 * @private 
		 */
		private var _depthStencilFormat:*;

		/**
		 * 获取深度格式。
		 * @return 深度格式。
		 */
		public function get depthStencilFormat():Number{
				return null;
		}
		public function getIsReady():Boolean{
			return null;
		}

		/**
		 * 获取宽度。
		 */
		public function get sourceWidth():Number{
				return null;
		}

		/**
		 * *
		 * 获取高度。
		 */
		public function get sourceHeight():Number{
				return null;
		}

		/**
		 * 获取offsetX。
		 */
		public function get offsetX():Number{
				return null;
		}

		/**
		 * *
		 * 获取offsetY
		 */
		public function get offsetY():Number{
				return null;
		}

		/**
		 * @param width 宽度。
		 * @param height 高度。
		 * @param format 纹理格式。
		 * @param depthStencilFormat 深度格式。创建一个 <code>RenderTexture</code> 实例。
		 */

		public function RenderTexture2D(width:Number = undefined,height:Number = undefined,format:Number = undefined,depthStencilFormat:Number = undefined){}

		/**
		 * @private 
		 */
		private var _create:*;

		/**
		 * 生成mipMap。
		 * @override 
		 */
		override public function generateMipmap():void{}

		/**
		 * 保存当前的RT信息。
		 */
		public static function pushRT():void{}

		/**
		 * 恢复上次保存的RT信息
		 */
		public static function popRT():void{}

		/**
		 * 开始绑定。
		 */
		public function start():void{}

		/**
		 * 结束绑定。
		 */
		public function end():void{}

		/**
		 * 恢复上一次的RenderTarge.由于使用自己保存的，所以如果被外面打断了的话，会出错。
		 */
		public function restore():void{}
		public function clear(r:Number = null,g:Number = null,b:Number = null,a:Number = null):void{}

		/**
		 * 获得像素数据。
		 * @param x X像素坐标。
		 * @param y Y像素坐标。
		 * @param width 宽度。
		 * @param height 高度。
		 * @return 像素数据。
		 */
		public function getData(x:Number,y:Number,width:Number,height:Number):Uint8Array{
			return null;
		}

		/**
		 * native多线程
		 */
		public function getDataAsync(x:Number,y:Number,width:Number,height:Number,callBack:Function):void{}
		public function recycle():void{}
	}

}
