package laya.d3.core {
	import laya.display.Node;
	import laya.utils.Handler;
	import laya.d3.math.Quaternion;
	import laya.d3.math.Vector3;
	import laya.d3.core.Transform3D;
	import laya.resource.ICreateResource;

	/**
	 * <code>Sprite3D</code> 类用于实现3D精灵。
	 */
	public class Sprite3D extends Node implements ICreateResource {

		/**
		 * Hierarchy资源。
		 */
		public static var HIERARCHY:String;

		/**
		 * 创建精灵的克隆实例。
		 * @param original 原始精灵。
		 * @param parent 父节点。
		 * @param worldPositionStays 是否保持自身世界变换。
		 * @param position 世界位置,worldPositionStays为false时生效。
		 * @param rotation 世界旋转,worldPositionStays为false时生效。
		 * @return 克隆实例。
		 */
		public static function instantiate(original:Sprite3D,parent:Node = null,worldPositionStays:Boolean = null,position:Vector3 = null,rotation:Quaternion = null):Sprite3D{
			return null;
		}

		/**
		 * 加载网格模板。
		 * @param url 模板地址。
		 * @param complete 完成回掉。
		 */
		public static function load(url:String,complete:Handler):void{}

		/**
		 * 唯一标识ID。
		 */
		public function get id():Number{
				return null;
		}

		/**
		 * 蒙版层。
		 */
		public var layer:Number;

		/**
		 * 资源的URL地址。
		 */
		public function get url():String{
				return null;
		}

		/**
		 * 是否为静态。
		 */
		public function get isStatic():Boolean{
				return null;
		}

		/**
		 * 精灵变换。
		 */
		public function get transform():Transform3D{
				return null;
		}

		/**
		 * 创建一个 <code>Sprite3D</code> 实例。
		 * @param name 精灵名称。
		 * @param isStatic 是否为静态。
		 */

		public function Sprite3D(name:String = undefined,isStatic:Boolean = undefined){}

		/**
		 */
		public function _setCreateURL(url:String):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onAdded():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onRemoved():void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():Node{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}
	}

}
