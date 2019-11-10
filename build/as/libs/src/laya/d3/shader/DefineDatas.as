package laya.d3.shader {
	import laya.d3.core.IClone;
	import laya.d3.shader.ShaderDefine;

	/**
	 * <code>DefineDatas</code> 类用于创建宏定义数据集合。
	 */
	public class DefineDatas implements IClone {

		/**
		 * 创建一个 <code>DefineDatas</code> 实例。
		 */

		public function DefineDatas(){}

		/**
		 * 添加宏定义值。
		 * @param define 宏定义值。
		 */
		public function add(define:ShaderDefine):void{}

		/**
		 * 移除宏定义。
		 * @param define 宏定义。
		 */
		public function remove(define:ShaderDefine):void{}

		/**
		 * 添加宏定义集合。
		 * @param define 宏定义集合。
		 */
		public function addDefineDatas(define:DefineDatas):void{}

		/**
		 * 移除宏定义集合。
		 * @param define 宏定义集合。
		 */
		public function removeDefineDatas(define:DefineDatas):void{}

		/**
		 * 是否有宏定义。
		 * @param define 宏定义。
		 */
		public function has(define:ShaderDefine):Boolean{
			return null;
		}

		/**
		 * 清空宏定义。
		 */
		public function clear():void{}

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
