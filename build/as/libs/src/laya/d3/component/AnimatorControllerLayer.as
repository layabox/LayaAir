/*[IF-FLASH]*/
package laya.d3.component {
	improt laya.d3.component.AnimatorState;
	improt laya.d3.core.IClone;
	improt laya.d3.resource.IReferenceCounter;
	public class AnimatorControllerLayer implements laya.d3.resource.IReferenceCounter,laya.d3.core.IClone {
		private var _defaultState:*;
		private var _referenceCount:*;
		public var name:String;
		public var blendingMode:Number;
		public var defaultWeight:Number;
		public var playOnWake:Boolean;
		public var defaultState:AnimatorState;

		public function AnimatorControllerLayer(name:String){}
		private var _removeClip:*;
		public function _getReferenceCount():Number{}
		public function _addReference(count:Number = null):void{}
		public function _removeReference(count:Number = null):void{}
		public function _clearReference():void{}
		public function addState(state:AnimatorState):void{}
		public function removeState(state:AnimatorState):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
