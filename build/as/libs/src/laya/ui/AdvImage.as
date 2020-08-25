package laya.ui {
	import laya.ui.Image;

	/**
	 * 广告插件
	 * @author 小松
	 * @date -2018-09-19
	 */
	public class AdvImage extends Image {

		/**
		 * 广告列表数据*
		 */
		private var advsListArr:*;

		/**
		 * 资源列表请求地址*
		 */
		private var resUrl:*;

		/**
		 * 加载请求实例*
		 */
		private var _http:*;

		/**
		 * 广告列表信息*
		 */
		private var _data:*;

		/**
		 * 每6分钟重新请求一次新广告列表*
		 */
		private var _resquestTime:*;

		/**
		 * 微信跳转appid*
		 */
		private var _appid:*;

		/**
		 * 播放索引*
		 */
		private var _playIndex:*;

		/**
		 * 轮播间隔时间*
		 */
		private var _lunboTime:*;

		public function AdvImage(skin:String = undefined){}

		/**
		 * 设置导量加载地址*
		 */
		private var setLoadUrl:*;
		private var init:*;
		private var initEvent:*;
		private var onAdvsImgClick:*;
		private var revertAdvsData:*;

		/**
		 * 当前小游戏环境是否支持游戏跳转功能*
		 */
		public function isSupportJump():Boolean{
			return null;
		}

		/**
		 * 跳转游戏
		 * @param callBack Function 回调参数说明：type 0 跳转成功；1跳转失败；2跳转接口调用成功
		 */
		private var jumptoGame:*;
		private var updateAdvsInfo:*;
		private var onLunbo:*;

		/**
		 * 获取轮播数据*
		 */
		private var getCurrentAppidObj:*;

		/**
		 * 获取广告列表数据信息
		 */
		private var onGetAdvsListData:*;

		/**
		 * 生成指定范围的随机数
		 * @param minNum 最小值
		 * @param maxNum 最大值
		 */
		public static function randRange(minNum:*,maxNum:*):Number{
			return null;
		}

		/**
		 * @private 请求出错侦的听处理函数。
		 * @param e 事件对象。
		 */
		private var _onError:*;

		/**
		 * @private 请求消息返回的侦听处理函数。
		 * @param e 事件对象。
		 */
		private var _onLoad:*;

		/**
		 * @private 请求错误的处理函数。
		 * @param message 错误信息。
		 */
		private var error:*;

		/**
		 * @private 请求成功完成的处理函数。
		 */
		private var complete:*;

		/**
		 * 转换数据*
		 */
		private var getAdvsQArr:*;

		/**
		 * @private 清除当前请求。
		 */
		private var clear:*;

		/**
		 * @override 
		 * @param destroyChild 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}
	}

}
