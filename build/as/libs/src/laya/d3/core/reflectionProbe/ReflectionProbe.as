package laya.d3.core.reflectionProbe {
	import laya.d3.core.Bounds;
	import laya.d3.resource.TextureCube;
	import laya.d3.math.Vector4;
	import laya.d3.math.Vector3;
	import laya.d3.math.Vector4;
	import laya.d3.resource.TextureCube;
	import laya.d3.core.Bounds;
	import laya.d3.core.Sprite3D;
	import laya.d3.math.Vector3;

	/**
	 * <code>ReflectionProbe</code> 类用于实现反射探针组件
	 * @miner 
	 */
	public class ReflectionProbe extends Sprite3D {
		public static var TEMPVECTOR3:Vector3;

		/**
		 * 默认解码数据
		 */
		public static var defaultTextureHDRDecodeValues:Vector4;

		/**
		 * 盒子反射是否开启
		 */
		private var _boxProjection:*;

		/**
		 * 探针重要度
		 */
		private var _importance:*;

		/**
		 * 反射探针图片
		 */
		private var _reflectionTexture:*;

		/**
		 * 包围盒大小
		 */
		private var _size:*;

		/**
		 * 包围盒偏移
		 */
		private var _offset:*;

		/**
		 * 包围盒
		 */
		private var _bounds:*;

		/**
		 * 反射强度
		 */
		private var _intensity:*;

		/**
		 * 反射参数
		 */
		private var _reflectionHDRParams:*;

		/**
		 * 反射探针解码格式
		 */
		private var _reflectionDecodeFormat:*;

		/**
		 * 队列索引
		 */
		private var _indexInReflectProbList:*;

		/**
		 * 是否是场景探针
		 */
		public var _isScene:Boolean;

		public function ReflectionProbe(){}

		/**
		 * 是否开启正交反射。
		 */
		public function get boxProjection():Boolean{return null;}
		public function set boxProjection(value:Boolean):void{}

		/**
		 * 设置反射探针的重要度
		 */
		public function get importance():Number{return null;}
		public function set importance(value:Number):void{}

		/**
		 * 设置反射探针资源
		 */
		public function get intensity():Number{return null;}
		public function set intensity(value:Number):void{}

		/**
		 * 设置反射贴图
		 */
		public function get reflectionTexture():TextureCube{return null;}
		public function set reflectionTexture(value:TextureCube):void{}

		/**
		 * 获得反射探针的包围盒
		 */
		public function get bounds():Bounds{return null;}
		public function get boundsMax():Vector3{return null;}
		public function get boundsMin():Vector3{return null;}
		public function get probePosition():Vector3{return null;}

		/**
		 * 反射参数
		 */
		public function get reflectionHDRParams():Vector4{return null;}

		/**
		 * 设置队列索引
		 * @param value 
		 */
		public function _setIndexInReflectionList(value:Number):void{}

		/**
		 * 获得队列索引
		 */
		public function _getIndexInReflectionList():Number{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onActive():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onInActive():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}
	}

}
