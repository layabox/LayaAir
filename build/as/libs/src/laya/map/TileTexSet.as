package laya.map {
	import laya.map.TileAniSprite;
	import laya.resource.Texture;

	/**
	 * 此类是子纹理类，也包括同类动画的管理
	 * TiledMap会把纹理分割成无数子纹理，也可以把其中的某块子纹理替换成一个动画序列
	 * 本类的实现就是如果发现子纹理被替换成一个动画序列，animationKey会被设为true
	 * 即animationKey为true,就使用TileAniSprite来做显示，把动画序列根据时间画到TileAniSprite上
	 * @author ...
	 */
	public class TileTexSet {

		/**
		 * 唯一标识
		 */
		public var gid:Number;

		/**
		 * 子纹理的引用
		 */
		public var texture:Texture;

		/**
		 * 纹理显示时的坐标偏移X
		 */
		public var offX:Number;

		/**
		 * 纹理显示时的坐标偏移Y
		 */
		public var offY:Number;

		/**
		 * 当前要播放动画的纹理序列
		 */
		public var textureArray:Array;

		/**
		 * 当前动画每帧的时间间隔
		 */
		public var durationTimeArray:Array;

		/**
		 * 动画播放的总时间
		 */
		public var animationTotalTime:Number;

		/**
		 * true表示当前纹理，是一组动画，false表示当前只有一个纹理
		 */
		public var isAnimation:Boolean;
		private var _spriteNum:*;
		private var _aniDic:*;
		private var _frameIndex:*;
		private var _time:*;
		private var _interval:*;
		private var _preFrameTime:*;

		/**
		 * 加入一个动画显示对象到此动画中
		 * @param aniName //显示对象的名字
		 * @param sprite //显示对象
		 */
		public function addAniSprite(aniName:String,sprite:TileAniSprite):void{}

		/**
		 * 把动画画到所有注册的SPRITE上
		 */
		private var animate:*;
		private var drawTexture:*;

		/**
		 * 移除不需要更新的SPRITE
		 * @param _name 
		 */
		public function removeAniSprite(_name:String):void{}

		/**
		 * 显示当前动画的使用情况
		 */
		public function showDebugInfo():String{
			return null;
		}

		/**
		 * 清理
		 */
		public function clearAll():void{}
	}

}
