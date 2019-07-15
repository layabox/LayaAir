/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.display.Node;
	improt laya.utils.Handler;
	improt laya.d3.math.Quaternion;
	improt laya.d3.math.Vector3;
	improt laya.d3.core.Transform3D;
	improt laya.resource.ICreateResource;
	public class Sprite3D extends laya.display.Node implements laya.resource.ICreateResource {
		public static var HIERARCHY:String;
		public static function instantiate(original:Sprite3D,parent:Node = null,worldPositionStays:Boolean = null,position:Vector3 = null,rotation:Quaternion = null):Sprite3D{}
		public static function load(url:String,complete:Handler):void{}
		public function get id():Number{};
		public var layer:Number;
		public function get url():String{};
		public function get isStatic():Boolean{};
		public function get transform():Transform3D{};

		public function Sprite3D(name:String = null,isStatic:Boolean = null){}
		public function _setCreateURL(url:String):void{}
		protected function _onAdded():void{}
		protected function _onRemoved():void{}
		public function _parse(data:*,spriteMap:*):void{}
		public function _cloneTo(destObject:*,srcRoot:Node,dstRoot:Node):void{}
		public function clone():Node{}
		public function destroy(destroyChild:Boolean = null):void{}
	}

}
