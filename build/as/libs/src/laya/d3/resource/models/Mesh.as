package laya.d3.resource.models {
	import laya.resource.Resource;
	import laya.utils.Handler;
	import laya.d3.core.Bounds;
	import laya.d3.core.IClone;
	import laya.d3.graphics.IndexFormat;
	import laya.d3.graphics.VertexDeclaration;
	import laya.d3.math.Color;
	import laya.d3.math.Matrix4x4;
	import laya.d3.math.Vector2;
	import laya.d3.math.Vector3;
	import laya.d3.math.Vector4;
	import laya.d3.resource.models.SubMesh;

	/**
	 * <code>Mesh</code> 类用于创建文件网格数据模板。
	 */
	public class Mesh extends Resource implements IClone {

		/**
		 * Mesh资源。
		 */
		public static var MESH:String;

		/**
		 * 加载网格模板。
		 * @param url 模板地址。
		 * @param complete 完成回调。
		 */
		public static function load(url:String,complete:Handler):void{}

		/**
		 * 网格的全局默认绑定动作逆矩阵。
		 */
		public function get inverseAbsoluteBindPoses():Array{
				return null;
		}

		/**
		 * 获取顶点个数。
		 */
		public function get vertexCount():Number{
				return null;
		}

		/**
		 * 获取索引个数。
		 */
		public function get indexCount():Number{
				return null;
		}

		/**
		 * SubMesh的个数。
		 */
		public function get subMeshCount():Number{
				return null;
		}

		/**
		 * 边界。
		 */
		public var bounds:Bounds;

		/**
		 * 索引格式。
		 */
		public function get indexFormat():IndexFormat{
				return null;
		}

		/**
		 * 创建一个 <code>Mesh</code> 实例,禁止使用。
		 * @param isReadable 是否可读。
		 */

		public function Mesh(isReadable:Boolean = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _disposeResource():void{}

		/**
		 * 根据获取子网格。
		 * @param index 索引。
		 */
		public function getSubMesh(index:Number):SubMesh{
			return null;
		}

		/**
		 * 拷贝并填充位置数据至数组。
		 * @param positions 位置数组。
		 * @remark 该方法为拷贝操作，比较耗费性能。
		 */
		public function getPositions(positions:Array):void{}

		/**
		 * 设置位置数据。
		 * @param positions 位置。
		 */
		public function setPositions(positions:Array):void{}

		/**
		 * 拷贝并填充颜色数据至数组。
		 * @param colors 颜色数组。
		 * @remark 该方法为拷贝操作，比较耗费性能。
		 */
		public function getColors(colors:Array):void{}

		/**
		 * 设置颜色数据。
		 * @param colors 颜色。
		 */
		public function setColors(colors:Array):void{}

		/**
		 * 拷贝并填充纹理坐标数据至数组。
		 * @param uvs 纹理坐标数组。
		 * @param channel 纹理坐标通道。
		 * @remark 该方法为拷贝操作，比较耗费性能。
		 */
		public function getUVs(uvs:Array,channel:Number = null):void{}

		/**
		 * 设置纹理坐标数据。
		 * @param uvs 纹理坐标。
		 * @param channel 纹理坐标通道。
		 */
		public function setUVs(uvs:Array,channel:Number = null):void{}

		/**
		 * 拷贝并填充法线数据至数组。
		 * @param normals 法线数组。
		 * @remark 该方法为拷贝操作，比较耗费性能。
		 */
		public function getNormals(normals:Array):void{}

		/**
		 * 设置法线数据。
		 * @param normals 法线。
		 */
		public function setNormals(normals:Array):void{}

		/**
		 * 拷贝并填充切线数据至数组。
		 * @param tangents 切线。
		 */
		public function getTangents(tangents:Array):void{}

		/**
		 * 设置切线数据。
		 * @param tangents 切线。
		 */
		public function setTangents(tangents:Array):void{}

		/**
		 * 获取骨骼权重。
		 * @param boneWeights 骨骼权重。
		 */
		public function getBoneWeights(boneWeights:Array):void{}

		/**
		 * 拷贝并填充骨骼权重数据至数组。
		 * @param boneWeights 骨骼权重。
		 */
		public function setBoneWeights(boneWeights:Array):void{}

		/**
		 * 获取骨骼索引。
		 * @param boneIndices 骨骼索引。
		 */
		public function getBoneIndices(boneIndices:Array):void{}

		/**
		 * 拷贝并填充骨骼索引数据至数组。
		 * @param boneWeights 骨骼索引。
		 */
		public function setBoneIndices(boneIndices:Array):void{}

		/**
		 * 将Mesh标记为不可读,可减少内存，标记后不可再调用相关读取方法。
		 */
		public function markAsUnreadbale():void{}

		/**
		 * 获取顶点声明。
		 */
		public function getVertexDeclaration():VertexDeclaration{
			return null;
		}

		/**
		 * 拷贝并获取顶点数据的副本。
		 * @return 顶点数据。
		 */
		public function getVertices():ArrayBuffer{
			return null;
		}

		/**
		 * 设置顶点数据。
		 * @param vertices 顶点数据。
		 */
		public function setVertices(vertices:ArrayBuffer):void{}

		/**
		 * 拷贝并获取网格索引的副本。
		 * @return 网格索引。
		 */
		public function getIndices():*{}

		/**
		 * 设置网格索引。
		 * @param indices 网格索引。
		 */
		public function setIndices(indices:*):void{}

		/**
		 * 从模型位置数据生成包围盒。
		 */
		public function calculateBounds():void{}

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
