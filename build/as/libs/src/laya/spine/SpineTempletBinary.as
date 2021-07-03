package laya.spine {
	import laya.spine.SpineSkeleton;
	import laya.spine.SpineSkeleton;
	import laya.resource.Resource;

	/**
	 * 数据解析完成后的调度。
	 * @eventType Event.COMPLETE
	 */

	/**
	 * 数据解析错误后的调度。
	 * @eventType Event.ERROR
	 */

	/**
	 * spine动画模板类
	 */
	public class SpineTempletBinary extends Resource {
		private var pathPrefix:*;
		private var assetManager:*;
		public var skeletonData:spine.SkeletonData;
		private var skeletonBinary:*;
		private var skelUrl:*;
		private var atlasUrl:*;
		private var textureUrlList:*;
		private var _layaPremultipliedAlpha:*;
		public var _spinePremultipliedAlpha:Boolean;

		public function SpineTempletBinary(){}
		public function loadAni(skelUrl:String,textureUrlList:Array = null):void{}
		private var textureLoader:*;
		private var loop:*;
		private var parseSpineAni:*;

		/**
		 * 创建动画
		 * @return 
		 */
		public function buildArmature():SpineSkeleton{
			return null;
		}

		/**
		 * 通过索引得动画名称
		 * @param index 
		 * @return 
		 */
		public function getAniNameByIndex(index:Number):String{
			return null;
		}

		/**
		 * 通过皮肤名字得到皮肤索引
		 * @param skinName 皮肤名称
		 * @return 
		 */
		public function getSkinIndexByName(skinName:String):Number{
			return null;
		}

		/**
		 * 释放纹理
		 * @override 
		 */
		override public function destroy():void{}
	}

}
