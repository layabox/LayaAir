/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.Image;
	public class AdvImage extends laya.ui.Image {
		private var advsListArr:*;
		private var resUrl:*;
		private var _http:*;
		private var _data:*;
		private var _resquestTime:*;
		private var _appid:*;
		private var _playIndex:*;
		private var _lunboTime:*;

		public function AdvImage(skin:String = null){}
		private var setLoadUrl:*;
		private var init:*;
		private var initEvent:*;
		private var onAdvsImgClick:*;
		private var revertAdvsData:*;
		public function isSupportJump():Boolean{}
		private var jumptoGame:*;
		private var updateAdvsInfo:*;
		private var onLunbo:*;
		private var getCurrentAppidObj:*;
		private var onGetAdvsListData:*;
		public static function randRange(minNum:*,maxNum:*):Number{}
		private var _onError:*;
		private var _onLoad:*;
		private var error:*;
		private var complete:*;
		private var getAdvsQArr:*;
		private var clear:*;
		public function destroy(destroyChild:Boolean = null):void{}
	}

}
