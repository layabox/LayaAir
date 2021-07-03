package laya.d3.component {
	import laya.d3.component.Animator;
	import laya.d3.component.Animator;

	/**
	 * 用来描述动画层遮罩
	 */
	public class AvatarMask {
		private var _catchAnimator:*;

		/**
		 * 创建一个<code>AvatarMask</code>实例
		 */

		public function AvatarMask(animator:Animator = undefined){}

		/**
		 * 获得动态
		 */
		public function get getCatchAnimator():Animator{return null;}

		/**
		 * 查找节点路径遮罩
		 * @param path 
		 * @returns 
		 */
		public function getTransformActive(path:String):Boolean{
			return null;
		}

		/**
		 * 设置
		 * @param path 
		 * @param value 
		 */
		public function setTransformActive(path:String,value:Boolean):void{}

		/**
		 * 获得遮罩信息
		 * @returns 
		 */
		public function getAllTranfromPath():*{}
	}

}
