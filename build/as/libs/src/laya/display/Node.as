/*[IF-FLASH]*/
package laya.display {
	improt laya.components.Component;
	improt laya.events.EventDispatcher;
	improt laya.utils.Timer;
	public class Node extends laya.events.EventDispatcher {
		protected static var ARRAY_EMPTY:Array;
		private var _bits:*;
		public var name:String;
		public var destroyed:Boolean;

		public function Node(){}
		public function on(type:String,caller:*,listener:Function,args:Array = null):EventDispatcher{}
		public function once(type:String,caller:*,listener:Function,args:Array = null):EventDispatcher{}
		public function destroy(destroyChild:Boolean = null):void{}
		public function onDestroy():void{}
		public function destroyChildren():void{}
		public function addChild(node:Node):Node{}
		public function addInputChild(node:Node):Node{}
		public function removeInputChild(node:Node):void{}
		public function addChildren(...args):void{}
		public function addChildAt(node:Node,index:Number):Node{}
		public function getChildIndex(node:Node):Number{}
		public function getChildByName(name:String):Node{}
		public function getChildAt(index:Number):Node{}
		public function setChildIndex(node:Node,index:Number):Node{}
		protected function _childChanged(child:Node = null):void{}
		public function removeChild(node:Node):Node{}
		public function removeSelf():Node{}
		public function removeChildByName(name:String):Node{}
		public function removeChildAt(index:Number):Node{}
		public function removeChildren(beginIndex:Number = null,endIndex:Number = null):Node{}
		public function get numChildren():Number{};
		public function get parent():Node{};
		protected function _setParent(value:Node):void{}
		public function get displayedInStage():Boolean{};
		private var _updateDisplayedInstage:*;
		private var _displayChild:*;
		public function contains(node:Node):Boolean{}
		public function timerLoop(delay:Number,caller:*,method:Function,args:Array = null,coverBefore:Boolean = null,jumpFrame:Boolean = null):void{}
		public function timerOnce(delay:Number,caller:*,method:Function,args:Array = null,coverBefore:Boolean = null):void{}
		public function frameLoop(delay:Number,caller:*,method:Function,args:Array = null,coverBefore:Boolean = null):void{}
		public function frameOnce(delay:Number,caller:*,method:Function,args:Array = null,coverBefore:Boolean = null):void{}
		public function clearTimer(caller:*,method:Function):void{}
		public function callLater(method:Function,args:Array = null):void{}
		public function runCallLater(method:Function):void{}
		private var _components:*;
		private var _activeChangeScripts:*;
		public function get scene():*{};
		public var active:Boolean;
		public function get activeInHierarchy():Boolean{};
		protected function _onActive():void{}
		protected function _onInActive():void{}
		protected function _onActiveInScene():void{}
		protected function _onInActiveInScene():void{}
		public function onAwake():void{}
		public function onEnable():void{}
		private var _activeScripts:*;
		private var _processInActive:*;
		private var _inActiveScripts:*;
		public function onDisable():void{}
		protected function _onAdded():void{}
		protected function _onRemoved():void{}
		public function addComponentIntance(comp:Component):*{}
		public function addComponent(type:Class):*{}
		public function getComponent(clas:*):*{}
		public function getComponents(clas:*):Array{}
		public function get timer():Timer{};
	}

}
