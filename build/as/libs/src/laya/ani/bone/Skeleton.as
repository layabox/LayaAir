/*[IF-FLASH]*/
package laya.ani.bone {
	improt laya.ani.bone.Bone;
	improt laya.ani.bone.BoneSlot;
	improt laya.ani.AnimationPlayer;
	improt laya.ani.GraphicsAni;
	improt laya.display.Sprite;
	improt laya.utils.Handler;
	improt laya.resource.Texture;
	improt laya.ani.bone.Templet;
	public class Skeleton extends laya.display.Sprite {
		public static var useSimpleMeshInCanvas:Boolean;
		protected var _templet:Templet;
		protected var _player:AnimationPlayer;
		protected var _curOriginalData:Float32Array;
		private var _boneMatrixArray:*;
		private var _lastTime:*;
		private var _currAniIndex:*;
		private var _pause:*;
		protected var _aniClipIndex:Number;
		protected var _clipIndex:Number;
		private var _skinIndex:*;
		private var _skinName:*;
		private var _aniMode:*;
		private var _graphicsCache:*;
		private var _boneSlotDic:*;
		private var _bindBoneBoneSlotDic:*;
		private var _boneSlotArray:*;
		private var _index:*;
		private var _total:*;
		private var _indexControl:*;
		private var _aniPath:*;
		private var _complete:*;
		private var _loadAniMode:*;
		private var _yReverseMatrix:*;
		private var _ikArr:*;
		private var _tfArr:*;
		private var _pathDic:*;
		private var _rootBone:*;
		protected var _boneList:Array;
		protected var _aniSectionDic:*;
		private var _eventIndex:*;
		private var _drawOrderIndex:*;
		private var _drawOrder:*;
		private var _lastAniClipIndex:*;
		private var _lastUpdateAniClipIndex:*;
		private var _playAudio:*;
		private var _soundChannelArr:*;

		public function Skeleton(templet:Templet = null,aniMode:Number = null){}
		public function init(templet:Templet,aniMode:Number = null):void{}
		public var url:String;
		public function load(path:String,complete:Handler = null,aniMode:Number = null):void{}
		private var _onLoaded:*;
		private var _parseComplete:*;
		private var _parseFail:*;
		private var _onPlay:*;
		private var _onStop:*;
		private var _onPause:*;
		private var _parseSrcBoneMatrix:*;
		private var _emitMissedEvents:*;
		private var _update:*;
		private var _onAniSoundStoped:*;
		protected function _createGraphics(_clipIndex:Number = null):GraphicsAni{}
		private var _checkIsAllParsed:*;
		private var _setDeform:*;
		public function getAnimNum():Number{}
		public function getAniNameByIndex(index:Number):String{}
		public function getSlotByName(name:String):BoneSlot{}
		public function showSkinByName(name:String,freshSlotIndex:Boolean = null):void{}
		public function showSkinByIndex(skinIndex:Number,freshSlotIndex:Boolean = null):void{}
		public function showSlotSkinByIndex(slotName:String,index:Number):void{}
		public function showSlotSkinByName(slotName:String,name:String):void{}
		public function replaceSlotSkinName(slotName:String,oldName:String,newName:String):void{}
		public function replaceSlotSkinByIndex(slotName:String,oldIndex:Number,newIndex:Number):void{}
		public function setSlotSkin(slotName:String,texture:Texture):void{}
		private var _clearCache:*;
		public function play(nameOrIndex:*,loop:Boolean,force:Boolean = null,start:Number = null,end:Number = null,freshSkin:Boolean = null,playAudio:Boolean = null):void{}
		public function stop():void{}
		public function playbackRate(value:Number):void{}
		public function paused():void{}
		public function resume():void{}
		private var _getGrahicsDataWithCache:*;
		private var _setGrahicsDataWithCache:*;
		public function destroy(destroyChild:Boolean = null):void{}
		public var index:Number;
		public function get total():Number{};
		public function get player():AnimationPlayer{};
		public function get templet():Templet{};
	}

}
