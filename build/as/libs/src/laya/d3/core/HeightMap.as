package laya.d3.core {
	import laya.d3.math.Vector2;
	import laya.d3.resource.models.Mesh;
	import laya.resource.Texture2D;

	/**
	 * <code>HeightMap</code> 类用于实现高度图数据。
	 */
	public class HeightMap {
		private static var _tempRay:*;

		/**
		 * 从网格精灵生成高度图。
		 * @param meshSprite 网格精灵。
		 * @param width 高度图宽度。
		 * @param height 高度图高度。
		 * @param outCellSize 输出 单元尺寸。
		 */
		public static function creatFromMesh(mesh:Mesh,width:Number,height:Number,outCellSize:Vector2):HeightMap{
			return null;
		}

		/**
		 * 从图片生成高度图。
		 * @param image 图片。
		 * @param maxHeight 最小高度。
		 * @param maxHeight 最大高度。
		 */
		public static function createFromImage(texture:Texture2D,minHeight:Number,maxHeight:Number):HeightMap{
			return null;
		}
		private static var _getPosition:*;
		private var _datas:*;
		private var _w:*;
		private var _h:*;
		private var _minHeight:*;
		private var _maxHeight:*;

		/**
		 * 获取宽度。
		 * @return value 宽度。
		 */
		public function get width():Number{
				return null;
		}

		/**
		 * 获取高度。
		 * @return value 高度。
		 */
		public function get height():Number{
				return null;
		}

		/**
		 * 最大高度。
		 * @return value 最大高度。
		 */
		public function get maxHeight():Number{
				return null;
		}

		/**
		 * 最大高度。
		 * @return value 最大高度。
		 */
		public function get minHeight():Number{
				return null;
		}

		/**
		 * 创建一个 <code>HeightMap</code> 实例。
		 * @param width 宽度。
		 * @param height 高度。
		 * @param minHeight 最大高度。
		 * @param maxHeight 最大高度。
		 */

		public function HeightMap(width:Number = undefined,height:Number = undefined,minHeight:Number = undefined,maxHeight:Number = undefined){}

		/**
		 * 获取高度。
		 * @param row 列数。
		 * @param col 行数。
		 * @return 高度。
		 */
		public function getHeight(row:Number,col:Number):Number{
			return null;
		}
	}

}
