package laya.resource {
	import laya.resource.Bitmap;
	import laya.resource.Texture;
	import laya.resource.Context;

	/**
	 * <code>HTMLCanvas</code> 是 Html Canvas 的代理类，封装了 Canvas 的属性和方法。
	 */
	public class HTMLCanvas extends Bitmap {
		private var _ctx:*;

		/**
		 * @inheritDoc 
		 */
		public function get source():*{
				return null;
		}

		/**
		 * 根据指定的类型，创建一个 <code>HTMLCanvas</code> 实例。
		 */

		public function HTMLCanvas(createCanvas:Boolean = undefined){}

		/**
		 * 清空画布内容。
		 */
		public function clear():void{}

		/**
		 * 销毁。
		 * @override 
		 */
		override public function destroy():void{}

		/**
		 * 释放。
		 */
		public function release():void{}

		/**
		 * Canvas 渲染上下文。
		 */
		public function get context():Context{
				return null;
		}

		/**
		 * 获取 Canvas 渲染上下文。
		 * @param contextID 上下文ID.
		 * @param other 
		 * @return Canvas 渲染上下文 Context 对象。
		 */
		public function getContext(contextID:String,other:* = null):Context{
			return null;
		}

		/**
		 * 获取内存大小。
		 * @return 内存大小。
		 */
		public function getMemSize():Number{
			return null;
		}

		/**
		 * 设置宽高。
		 * @param w 宽度。
		 * @param h 高度。
		 */
		public function size(w:Number,h:Number):void{}

		/**
		 * 获取texture实例
		 */
		public function getTexture():Texture{
			return null;
		}

		/**
		 * 把图片转换为base64信息
		 * @param type "image/png"
		 * @param encoderOptions 质量参数，取值范围为0-1
		 */
		public function toBase64(type:String,encoderOptions:Number):String{
			return null;
		}
		public function toBase64Async(type:String,encoderOptions:Number,callBack:Function):void{}
	}

}
