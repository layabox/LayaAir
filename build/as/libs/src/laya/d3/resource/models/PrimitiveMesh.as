package laya.d3.resource.models {
	import laya.d3.resource.models.Mesh;

	/**
	 * <code>PrimitiveMesh</code> 类用于创建简单网格。
	 */
	public class PrimitiveMesh {
		public static function __init__():void{}

		/**
		 * 创建Box网格。
		 * @param long 半径
		 * @param height 垂直层数
		 * @param width 水平层数
		 * @return 
		 */
		public static function createBox(long:Number = null,height:Number = null,width:Number = null):Mesh{
			return null;
		}

		/**
		 * 创建一个胶囊体模型
		 * @param radius 半径
		 * @param height 高度
		 * @param stacks 水平层数,一般设为垂直层数的一半
		 * @param slices 垂直层数
		 */
		public static function createCapsule(radius:Number = null,height:Number = null,stacks:Number = null,slices:Number = null):Mesh{
			return null;
		}

		/**
		 * 创建一个圆锥体模型
		 * @param radius 半径
		 * @param height 高度
		 * @param slices 分段数
		 */
		public static function createCone(radius:Number = null,height:Number = null,slices:Number = null):Mesh{
			return null;
		}

		/**
		 * 创建一个圆柱体模型
		 * @param radius 半径
		 * @param height 高度
		 * @param slices 垂直层数
		 */
		public static function createCylinder(radius:Number = null,height:Number = null,slices:Number = null):Mesh{
			return null;
		}

		/**
		 * 创建一个平面模型
		 * @param long 长
		 * @param width 宽
		 */
		public static function createPlane(long:Number = null,width:Number = null,stacks:Number = null,slices:Number = null):Mesh{
			return null;
		}

		/**
		 * 创建一个四边形模型
		 * @param long 长
		 * @param width 宽
		 */
		public static function createQuad(long:Number = null,width:Number = null):Mesh{
			return null;
		}

		/**
		 * 创建一个球体模型
		 * @param radius 半径
		 * @param stacks 水平层数
		 * @param slices 垂直层数
		 */
		public static function createSphere(radius:Number = null,stacks:Number = null,slices:Number = null):Mesh{
			return null;
		}
	}

}
