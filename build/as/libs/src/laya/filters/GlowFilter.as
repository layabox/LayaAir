package laya.filters {
	import laya.filters.Filter;

	/**
	 * 发光滤镜(也可以当成阴影滤使用）
	 */
	public class GlowFilter extends Filter {

		/**
		 * 数据的存储，顺序R,G,B,A,blurWidth,offX,offY;
		 */
		private var _elements:*;

		/**
		 * 滤镜的颜色
		 */
		private var _color:*;

		/**
		 * 创建发光滤镜
		 * @param color 滤镜的颜色
		 * @param blur 边缘模糊的大小
		 * @param offX X轴方向的偏移
		 * @param offY Y轴方向的偏移
		 */

		public function GlowFilter(color:String = undefined,blur:Number = undefined,offX:Number = undefined,offY:Number = undefined){}

		/**
		 * @private 滤镜类型
		 * @override 
		 */
		override public function get type():Number{return null;}

		/**
		 * @private 
		 */
		public function get offY():Number{return null;}

		/**
		 * @private 
		 */
		public function set offY(value:Number):void{}

		/**
		 * @private 
		 */
		public function get offX():Number{return null;}

		/**
		 * @private 
		 */
		public function set offX(value:Number):void{}

		/**
		 * @private 
		 */
		public function getColor():Array{
			return null;
		}

		/**
		 * @private 
		 */
		public function get blur():Number{return null;}

		/**
		 * @private 
		 */
		public function set blur(value:Number):void{}
		public function getColorNative():Float32Array{
			return null;
		}
		public function getBlurInfo1Native():Float32Array{
			return null;
		}
		public function getBlurInfo2Native():Float32Array{
			return null;
		}
	}

}
