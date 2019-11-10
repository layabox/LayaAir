package laya.d3.core {
	import laya.d3.core.MeshSprite3D;
	import laya.d3.core.HeightMap;
	import laya.d3.resource.models.Mesh;
	import laya.resource.Texture2D;

	/**
	 * <code>TerrainMeshSprite3D</code> 类用于创建网格。
	 */
	public class MeshTerrainSprite3D extends MeshSprite3D {
		private static var _tempVector3:*;
		private static var _tempMatrix4x4:*;

		/**
		 * 从网格创建一个TerrainMeshSprite3D实例和其高度图属性。
		 * @param mesh 网格。
		 * @param heightMapWidth 高度图宽度。
		 * @param heightMapHeight 高度图高度。
		 * @param name 名字。
		 */
		public static function createFromMesh(mesh:Mesh,heightMapWidth:Number,heightMapHeight:Number,name:String = null):MeshTerrainSprite3D{
			return null;
		}

		/**
		 * 从网格创建一个TerrainMeshSprite3D实例、图片读取高度图属性。
		 * @param mesh 网格。
		 * @param image 高度图。
		 * @param name 名字。
		 */
		public static function createFromMeshAndHeightMap(mesh:Mesh,texture:Texture2D,minHeight:Number,maxHeight:Number,name:String = null):MeshTerrainSprite3D{
			return null;
		}
		private var _minX:*;
		private var _minZ:*;
		private var _cellSize:*;
		private var _heightMap:*;

		/**
		 * 获取地形X轴最小位置。
		 * @return 地形X轴最小位置。
		 */
		public function get minX():Number{
				return null;
		}

		/**
		 * 获取地形Z轴最小位置。
		 * @return 地形X轴最小位置。
		 */
		public function get minZ():Number{
				return null;
		}

		/**
		 * 获取地形X轴长度。
		 * @return 地形X轴长度。
		 */
		public function get width():Number{
				return null;
		}

		/**
		 * 获取地形Z轴长度。
		 * @return 地形Z轴长度。
		 */
		public function get depth():Number{
				return null;
		}

		/**
		 * 创建一个 <code>TerrainMeshSprite3D</code> 实例。
		 * @param mesh 网格。
		 * @param heightMap 高度图。
		 * @param name 名字。
		 */

		public function MeshTerrainSprite3D(mesh:Mesh = undefined,heightMap:HeightMap = undefined,name:String = undefined){}
		private var _disableRotation:*;
		private var _getScaleX:*;
		private var _getScaleZ:*;
		private var _initCreateFromMesh:*;
		private var _initCreateFromMeshHeightMap:*;
		private var _computeCellSize:*;

		/**
		 * 获取地形高度。
		 * @param x X轴坐标。
		 * @param z Z轴坐标。
		 */
		public function getHeight(x:Number,z:Number):Number{
			return null;
		}
	}

}
