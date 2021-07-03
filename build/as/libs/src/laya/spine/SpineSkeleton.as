package laya.spine {
	import laya.spine.SpineTempletBinary;
	import laya.spine.SpineTemplet;
	import laya.display.Sprite;
	import laya.spine.SpineTemplet;
	import laya.spine.SpineTempletBinary;

	/**
	 * 动画开始播放调度
	 * @eventType Event.PLAYED
	 */

	/**
	 * 动画停止播放调度
	 * @eventType Event.STOPPED
	 */

	/**
	 * 动画暂停播放调度
	 * @eventType Event.PAUSED
	 */

	/**
	 * 自定义事件。
	 * @eventType Event.LABEL
	 */

	/**
	 * spine动画由<code>SpineTemplet</code>，<code>SpineSkeletonRender</code>，<code>SpineSkeleton</code>三部分组成。
	 */
	public class SpineSkeleton extends Sprite {
		public static var stopped:Number;
		public static var paused:Number;
		public static var playing:Number;
		private var _templet:*;
		private var timeKeeper:*;
		private var skeleton:*;
		private var state:*;
		private var stateData:*;
		private var currentPlayTime:*;
		private var skeletonRenderer:*;
		public var _ins:SpineSkeleton;

		/**
		 * 播放速率
		 */
		private var _playbackRate:*;
		private var trackIndex:*;

		/**
		 * 创建一个Skeleton对象
		 * @param templet 骨骼动画模板
		 */

		public function SpineSkeleton(templet:* = undefined){}
		public function init(templet:*):void{}

		/**
		 * 播放动画
		 * @param nameOrIndex 动画名字或者索引
		 * @param loop 是否循环播放
		 * @param force false,如果要播的动画跟上一个相同就不生效,true,强制生效
		 * @param start 起始时间
		 * @param end 结束时间
		 * @param freshSkin 是否刷新皮肤数据
		 * @param playAudio 是否播放音频
		 */
		public function play(nameOrIndex:*,loop:Boolean,force:Boolean = null,start:Number = null,end:Number = null,freshSkin:Boolean = null,playAudio:Boolean = null):void{}
		private var _update:*;

		/**
		 * 得到当前动画的数量
		 * @return 当前动画的数量
		 */
		public function getAnimNum():Number{
			return null;
		}

		/**
		 * 得到指定动画的名字
		 * @param index 动画的索引
		 */
		public function getAniNameByIndex(index:Number):String{
			return null;
		}

		/**
		 * 通过名字得到插槽的引用
		 * @param slotName 
		 */
		public function getSlotByName(slotName:String):spine.Slot{
			return null;
		}

		/**
		 * 设置动画播放速率
		 * @param value 1为标准速率
		 */
		public function playbackRate(value:Number):void{}

		/**
		 * 通过名字显示一套皮肤
		 * @param name 皮肤的名字
		 */
		public function showSkinByName(name:String):void{}

		/**
		 * 通过索引显示一套皮肤
		 * @param skinIndex 皮肤索引
		 */
		public function showSkinByIndex(skinIndex:Number):void{}

		/**
		 * 停止动画
		 */
		public function stop():void{}

		/**
		 * 暂停动画的播放
		 */
		public function paused():void{}

		/**
		 * 恢复动画的播放
		 */
		public function resume():void{}

		/**
		 * 销毁当前动画
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * 得到动画模板的引用
		 * @return templet
		 */
		public function get templet():*{return null;}

		/**
		 * 添加一个动画
		 * @param nameOrIndex 动画名字或者索引
		 * @param loop 是否循环播放
		 * @param delay 延迟调用，可以为负数
		 */
		public function addAnimation(nameOrIndex:*,loop:Boolean = null,delay:Number = null):void{}

		/**
		 * 设置当动画被改变时，存储混合(交叉淡出)的持续时间
		 * @param fromNameOrIndex 
		 * @param toNameOrIndex 
		 * @param duration 
		 */
		public function setMix(fromNameOrIndex:*,toNameOrIndex:*,duration:Number):void{}

		/**
		 * 获取骨骼信息(spine.Bone)
		 * 注意: 获取到的是spine运行时的骨骼信息(spine.Bone)，不适用引擎的方法
		 * @param boneName 
		 */
		public function getBoneByName(boneName:String):spine.Bone{
			return null;
		}

		/**
		 * 获取Skeleton(spine.Skeleton)
		 */
		public function getSkeleton():*{}

		/**
		 * 替换插槽皮肤
		 * @param slotName 
		 * @param attachmentName 
		 */
		public function setSlotAttachment(slotName:String,attachmentName:String):void{}

		/**
		 * 设置当前播放位置
		 * @param value 当前时间
		 */
		public function set currentTime(value:Number):void{}

		/**
		 * 获取当前播放状态
		 * @return 当前播放状态
		 */
		public function get playState():Number{return null;}
	}

}
