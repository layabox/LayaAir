/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.d3.core.IClone;
	improt laya.d3.component.Animator;
	improt laya.resource.Resource;
	improt laya.utils.Handler;
	public class Avatar extends laya.resource.Resource implements laya.d3.core.IClone {
		public static var AVATAR:String;
		public static function _parse(data:*,propertyParams:* = null,constructParams:Array = null):Avatar{}
		public static function load(url:String,complete:Handler):void{}
		private var _nativeNodeCount:*;

		public function Avatar(){}
		private var _initCloneToAnimator:*;
		private var _parseNode:*;
		public function _cloneDatasToAnimator(destAnimator:Animator):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
