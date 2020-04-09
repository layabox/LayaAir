package laya.d3.component {
	import laya.components.Component;
	import laya.d3.core.Avatar;
	import laya.d3.core.Sprite3D;
	import laya.d3.component.AnimatorControllerLayer;
	import laya.d3.component.AnimatorPlayState;
	import laya.d3.component.AnimatorState;

	/**
	 * <code>Animator</code> 类用于创建动画组件。
	 */
	public class Animator extends Component {

		/**
		 * 裁剪模式_始终播放动画。
		 */
		public static var CULLINGMODE_ALWAYSANIMATE:Number;

		/**
		 * 裁剪模式_不可见时完全不播放动画。
		 */
		public static var CULLINGMODE_CULLCOMPLETELY:Number;

		/**
		 * 裁剪模式
		 */
		public var cullingMode:Number;

		/**
		 * 动画的播放速度,1.0为正常播放速度。
		 */
		public var speed:Number;

		/**
		 * 创建一个 <code>Animation</code> 实例。
		 */

		public function Animator(){}

		/**
		 * 获取默认动画状态。
		 * @param layerIndex 层索引。
		 * @return 默认动画状态。
		 */
		public function getDefaultState(layerIndex:Number = null):AnimatorState{
			return null;
		}

		/**
		 * 添加动画状态。
		 * @param state 动画状态。
		 * @param layerIndex 层索引。
		 */
		public function addState(state:AnimatorState,layerIndex:Number = null):void{}

		/**
		 * 移除动画状态。
		 * @param state 动画状态。
		 * @param layerIndex 层索引。
		 */
		public function removeState(state:AnimatorState,layerIndex:Number = null):void{}

		/**
		 * 添加控制器层。
		 */
		public function addControllerLayer(controllderLayer:AnimatorControllerLayer):void{}

		/**
		 * 获取控制器层。
		 */
		public function getControllerLayer(layerInex:Number = null):AnimatorControllerLayer{
			return null;
		}

		/**
		 * 播放动画。
		 * @param name 如果为null则播放默认动画，否则按名字播放动画片段。
		 * @param layerIndex 层索引。
		 * @param normalizedTime 归一化的播放起始时间。
		 */
		public function play(name:String = null,layerIndex:Number = null,normalizedTime:Number = null):void{}

		/**
		 * 在当前动画状态和目标动画状态之间进行融合过渡播放。
		 * @param name 目标动画状态。
		 * @param transitionDuration 过渡时间,该值为当前动画状态的归一化时间，值在0.0~1.0之间。
		 * @param layerIndex 层索引。
		 * @param normalizedTime 归一化的播放起始时间。
		 */
		public function crossFade(name:String,transitionDuration:Number,layerIndex:Number = null,normalizedTime:Number = null):void{}

		/**
		 * @deprecated 获取当前的播放状态。
		 * @param layerIndex 层索引。
		 * @return 动画播放状态。
		 */
		public function getCurrentAnimatorPlayState(layerInex:Number = null):AnimatorPlayState{
			return null;
		}

		/**
		 * avatar。
		 */
		public var avatar:Avatar;

		/**
		 * 关联精灵节点到Avatar节点,此Animator必须有Avatar文件。
		 * @param nodeName 关联节点的名字。
		 * @param sprite3D 精灵节点。
		 * @return 是否关联成功。
		 */
		public function linkSprite3DToAvatarNode(nodeName:String,sprite3D:Sprite3D):Boolean{
			return null;
		}

		/**
		 * 解除精灵节点到Avatar节点的关联,此Animator必须有Avatar文件。
		 * @param sprite3D 精灵节点。
		 * @return 是否解除关联成功。
		 */
		public function unLinkSprite3DToAvatarNode(sprite3D:Sprite3D):Boolean{
			return null;
		}
	}

}
