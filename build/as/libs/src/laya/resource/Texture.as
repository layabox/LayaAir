package laya.resource {
	import laya.resource.Texture2D;
	import laya.events.EventDispatcher;
	import laya.utils.Handler;

	/**
	 * 资源加载完成后调度。
	 * @eventType Event.READY
	 */

	/**
	 * <code>Texture</code> 是一个纹理处理类。
	 */
	public class Texture extends EventDispatcher {

		/**
		 * @private 默认 UV 信息。
		 */
		public static var DEF_UV:Float32Array;

		/**
		 * @private 
		 */
		public static var NO_UV:Float32Array;

		/**
		 * @private 反转 UV 信息。
		 */
		public static var INV_UV:Float32Array;

		/**
		 * @private 
		 */
		private static var _rect1:*;

		/**
		 * @private 
		 */
		private static var _rect2:*;

		/**
		 * @private uv的范围
		 */
		public var uvrect:Array;

		/**
		 * @private 
		 */
		private var _destroyed:*;

		/**
		 * @private 
		 */
		private var _bitmap:*;

		/**
		 * @private 
		 */
		private var _referenceCount:*;

		/**
		 * 沿 X 轴偏移量。
		 */
		public var offsetX:Number;

		/**
		 * 沿 Y 轴偏移量。
		 */
		public var offsetY:Number;

		/**
		 * @private 
		 */
		private var _w:*;

		/**
		 * @private 
		 */
		private var _h:*;

		/**
		 * 原始宽度（包括被裁剪的透明区域）。
		 */
		public var sourceWidth:Number;

		/**
		 * 原始高度（包括被裁剪的透明区域）。
		 */
		public var sourceHeight:Number;

		/**
		 * 图片地址
		 */
		public var url:String;

		/**
		 * @private 
		 */
		public var scaleRate:Number;

		/**
		 * 平移 UV。
		 * @param offsetX 沿 X 轴偏移量。
		 * @param offsetY 沿 Y 轴偏移量。
		 * @param uv 需要平移操作的的 UV。
		 * @return 平移后的UV。
		 */
		public static function moveUV(offsetX:Number,offsetY:Number,uv:Array):Array{
			return null;
		}

		/**
		 * 根据指定资源和坐标、宽高、偏移量等创建 <code>Texture</code> 对象。
		 * @param source 绘图资源 Texture2D 或者 Texture对象。
		 * @param x 起始绝对坐标 x 。
		 * @param y 起始绝对坐标 y 。
		 * @param width 宽绝对值。
		 * @param height 高绝对值。
		 * @param offsetX X 轴偏移量（可选）。	就是[x,y]相对于原始小图片的位置。一般都是正的，表示裁掉了空白边的大小，如果是负的一般表示加了保护边
		 * @param offsetY Y 轴偏移量（可选）。
		 * @param sourceWidth 原始宽度，包括被裁剪的透明区域（可选）。
		 * @param sourceHeight 原始高度，包括被裁剪的透明区域（可选）。
		 * @return <code>Texture</code> 对象。
		 */
		public static function create(source:*,x:Number,y:Number,width:Number,height:Number,offsetX:Number = null,offsetY:Number = null,sourceWidth:Number = null,sourceHeight:Number = null):Texture{
			return null;
		}

		/**
		 * 截取Texture的一部分区域，生成新的Texture，如果两个区域没有相交，则返回null。
		 * @param texture 目标Texture。
		 * @param x 相对于目标Texture的x位置。
		 * @param y 相对于目标Texture的y位置。
		 * @param width 截取的宽度。
		 * @param height 截取的高度。
		 * @return 返回一个新的Texture。
		 */
		public static function createFromTexture(texture:Texture,x:Number,y:Number,width:Number,height:Number):Texture{
			return null;
		}
		public var uv:Array;

		/**
		 * 实际宽度。
		 */
		public var width:Number;

		/**
		 * 实际高度。
		 */
		public var height:Number;

		/**
		 * 获取位图。
		 * @return 位图。
		 */

		/**
		 * 设置位图。
		 * @param 位图 。
		 */
		public var bitmap:*;

		/**
		 * 获取是否已经销毁。
		 * @return 是否已经销毁。
		 */
		public function get destroyed():Boolean{
				return null;
		}

		/**
		 * 创建一个 <code>Texture</code> 实例。
		 * @param bitmap 位图资源。
		 * @param uv UV 数据信息。
		 */

		public function Texture(bitmap:* = undefined,uv:Array = undefined,sourceWidth:Number = undefined,sourceHeight:Number = undefined){}

		/**
		 * @private 
		 */
		private var _onLoaded:*;

		/**
		 * 获取是否可以使用。
		 */
		public function getIsReady():Boolean{
			return null;
		}

		/**
		 * 设置此对象的位图资源、UV数据信息。
		 * @param bitmap 位图资源
		 * @param uv UV数据信息
		 */
		public function setTo(bitmap:* = null,uv:Array = null,sourceWidth:Number = null,sourceHeight:Number = null):void{}

		/**
		 * 加载指定地址的图片。
		 * @param url 图片地址。
		 * @param complete 加载完成回调
		 */
		public function load(url:String,complete:Handler = null):void{}
		public function getTexturePixels(x:Number,y:Number,width:Number,height:Number):Uint8Array{
			return null;
		}

		/**
		 * 获取Texture上的某个区域的像素点
		 * @param x 
		 * @param y 
		 * @param width 
		 * @param height 
		 * @return 返回像素点集合
		 */
		public function getPixels(x:Number,y:Number,width:Number,height:Number):Uint8Array{
			return null;
		}

		/**
		 * 通过url强制恢复bitmap。
		 */
		public function recoverBitmap(onok:Function = null):void{}

		/**
		 * 强制释放Bitmap,无论是否被引用。
		 */
		public function disposeBitmap():void{}

		/**
		 * 销毁纹理。
		 */
		public function destroy(force:Boolean = null):void{}
	}

}
