package laya.d3.animation {
	import laya.d3.core.IClone;

	/**
	 * <code>BoneNode</code> 类用于实现骨骼节点。
	 */
	public class AnimationNode implements IClone {
		private var _children:*;

		/**
		 * 节点名称。
		 */
		public var name:String;

		/**
		 * 创建一个新的 <code>AnimationNode</code> 实例。
		 */

		public function AnimationNode(localPosition:Float32Array = undefined,localRotation:Float32Array = undefined,localScale:Float32Array = undefined,worldMatrix:Float32Array = undefined){}

		/**
		 * 添加子节点。
		 * @param child 子节点。
		 */
		public function addChild(child:AnimationNode):void{}

		/**
		 * 移除子节点。
		 * @param child 子节点。
		 */
		public function removeChild(child:AnimationNode):void{}

		/**
		 * 根据名字获取子节点。
		 * @param name 名字。
		 */
		public function getChildByName(name:String):AnimationNode{
			return null;
		}

		/**
		 * 根据索引获取子节点。
		 * @param index 索引。
		 */
		public function getChildByIndex(index:Number):AnimationNode{
			return null;
		}

		/**
		 * 获取子节点的个数。
		 */
		public function getChildCount():Number{
			return null;
		}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
	}

}
