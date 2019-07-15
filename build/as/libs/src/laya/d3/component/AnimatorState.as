/*[IF-FLASH]*/
package laya.d3.component {
	improt laya.d3.animation.AnimationClip;
	improt laya.d3.animation.AnimatorStateScript;
	improt laya.d3.core.IClone;
	improt laya.d3.resource.IReferenceCounter;
	public class AnimatorState implements laya.d3.resource.IReferenceCounter,laya.d3.core.IClone {
		private var _referenceCount:*;
		public var name:String;
		public var speed:Number;
		public var clipStart:Number;
		public var clipEnd:Number;
		public var clip:AnimationClip;

		public function AnimatorState(){}
		public function _getReferenceCount():Number{}
		public function _addReference(count:Number = null):void{}
		public function _removeReference(count:Number = null):void{}
		public function _clearReference():void{}
		public function addScript(type:Class):AnimatorStateScript{}
		public function getScript(type:Class):AnimatorStateScript{}
		public function getScripts(type:Class):Array{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
