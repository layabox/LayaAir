package laya.display {
	import laya.display.AnimationBase;

	/**
	 * 动画播放完毕后调度。
	 * @eventType Event.COMPLETE
	 */

	/**
	 * 播放到某标签后调度。
	 * @eventType Event.LABEL
	 */

	/**
	 * 节点关键帧动画播放类。解析播放IDE内制作的节点动画。
	 */
	public class FrameAnimation extends AnimationBase {

		/**
		 * @private 
		 */
		private static var _sortIndexFun:*;

		/**
		 * @private 
		 */
		protected var _usedFrames:Array;

		public function FrameAnimation(){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function clear():AnimationBase{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _displayToIndex(value:Number):void{}

		/**
		 * @private 将节点设置到某一帧的状态
		 * @param node 节点ID
		 * @param frame 
		 * @param targetDic 节点表
		 */
		protected function _displayNodeToFrame(node:*,frame:Number,targetDic:* = null):void{}

		/**
		 * @private 计算帧数据
		 */
		private var _calculateDatas:*;

		/**
		 * @private 计算某个节点的帧数据
		 */
		protected function _calculateKeyFrames(node:*):void{}

		/**
		 * 重置节点，使节点恢复到动画之前的状态，方便其他动画控制
		 */
		public function resetNodes():void{}

		/**
		 * @private 计算节点某个属性的帧数据
		 */
		private var _calculateNodePropFrames:*;

		/**
		 * @private 
		 */
		private var _dealKeyFrame:*;

		/**
		 * @private 计算两个关键帧直接的帧数据
		 */
		private var _calculateFrameValues:*;
	}

}
