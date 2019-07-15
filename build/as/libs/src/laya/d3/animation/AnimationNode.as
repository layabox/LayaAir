/*[IF-FLASH]*/
package laya.d3.animation {
	improt laya.d3.core.IClone;
	public class AnimationNode implements laya.d3.core.IClone {
		private var _children:*;
		public var name:String;

		public function AnimationNode(localPosition:Float32Array = null,localRotation:Float32Array = null,localScale:Float32Array = null,worldMatrix:Float32Array = null){}
		public function addChild(child:AnimationNode):void{}
		public function removeChild(child:AnimationNode):void{}
		public function getChildByName(name:String):AnimationNode{}
		public function getChildByIndex(index:Number):AnimationNode{}
		public function getChildCount():Number{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
