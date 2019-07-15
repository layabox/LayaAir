/*[IF-FLASH]*/
package laya.d3.component {
	improt laya.components.Component;
	improt laya.d3.core.Avatar;
	improt laya.d3.core.Sprite3D;
	improt laya.d3.component.AnimatorControllerLayer;
	improt laya.d3.component.AnimatorPlayState;
	improt laya.d3.component.AnimatorState;
	public class Animator extends laya.components.Component {
		private static var _tempVector30:*;
		private static var _tempVector31:*;
		private static var _tempQuaternion0:*;
		private static var _tempQuaternion1:*;
		private static var _tempVector3Array0:*;
		private static var _tempVector3Array1:*;
		private static var _tempQuaternionArray0:*;
		private static var _tempQuaternionArray1:*;
		public static var CULLINGMODE_ALWAYSANIMATE:Number;
		public static var CULLINGMODE_CULLCOMPLETELY:Number;
		private var _speed:*;
		private var _keyframeNodeOwnerMap:*;
		private var _keyframeNodeOwners:*;
		private var _updateMark:*;
		private var _controllerLayers:*;
		public var cullingMode:Number;
		public var speed:Number;

		public function Animator(){}
		private var _linkToSprites:*;
		private var _addKeyframeNodeOwner:*;
		private var _updatePlayer:*;
		private var _eventScript:*;
		private var _updateEventScript:*;
		private var _updateClipDatas:*;
		private var _applyFloat:*;
		private var _applyPositionAndRotationEuler:*;
		private var _applyRotation:*;
		private var _applyScale:*;
		private var _applyCrossData:*;
		private var _setClipDatasToNode:*;
		private var _setCrossClipDatasToNode:*;
		private var _setFixedCrossClipDatasToNode:*;
		private var _revertDefaultKeyframeNodes:*;
		public function _onAdded():void{}
		protected function _onDestroy():void{}
		protected function _onEnable():void{}
		protected function _onDisable():void{}
		public function _parse(data:*):void{}
		public function getDefaultState(layerIndex:Number = null):AnimatorState{}
		public function addState(state:AnimatorState,layerIndex:Number = null):void{}
		public function removeState(state:AnimatorState,layerIndex:Number = null):void{}
		public function addControllerLayer(controllderLayer:AnimatorControllerLayer):void{}
		public function getControllerLayer(layerInex:Number = null):AnimatorControllerLayer{}
		public function getCurrentAnimatorPlayState(layerInex:Number = null):AnimatorPlayState{}
		public function play(name:String = null,layerIndex:Number = null,normalizedTime:Number = null):void{}
		public function crossFade(name:String,transitionDuration:Number,layerIndex:Number = null,normalizedTime:Number = null):void{}
		private var _avatar:*;
		public var avatar:Avatar;
		private var _getAvatarOwnersAndInitDatasAsync:*;
		private var _isLinkSpriteToAnimationNode:*;
		private var _isLinkSpriteToAnimationNodeData:*;
		public function linkSprite3DToAvatarNode(nodeName:String,sprite3D:Sprite3D):Boolean{}
		public function unLinkSprite3DToAvatarNode(sprite3D:Sprite3D):Boolean{}
	}

}
