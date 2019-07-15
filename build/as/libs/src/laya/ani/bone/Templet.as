/*[IF-FLASH]*/
package laya.ani.bone {
	improt laya.ani.bone.Bone;
	improt laya.ani.AnimationTemplet;
	improt laya.ani.bone.SkinSlotDisplayData;
	improt laya.resource.Texture;
	improt laya.maths.Matrix;
	improt laya.display.Graphics;
	improt laya.ani.bone.Skeleton;
	public class Templet extends laya.ani.AnimationTemplet {
		private var _mainTexture:*;
		private var _graphicsCache:*;
		public var srcBoneMatrixArr:Array;
		public var ikArr:Array;
		public var tfArr:Array;
		public var pathArr:Array;
		public var boneSlotDic:*;
		public var bindBoneBoneSlotDic:*;
		public var boneSlotArray:Array;
		public var skinDataArray:Array;
		public var skinDic:*;
		public var subTextureDic:*;
		public var isParseFail:Boolean;
		public var yReverseMatrix:Matrix;
		public var drawOrderAniArr:Array;
		public var eventAniArr:Array;
		public var attachmentNames:Array;
		public var deformAniArr:Array;
		public var skinSlotDisplayDataArr:Array;
		private var _isParseAudio:*;
		private var _isDestroyed:*;
		private var _rate:*;
		public var isParserComplete:Boolean;
		public var aniSectionDic:*;
		private var _skBufferUrl:*;
		private var _textureDic:*;
		private var _loadList:*;
		private var _path:*;
		private var _relativeUrl:*;
		public var tMatrixDataLen:Number;
		public var mRootBone:Bone;
		public var mBoneArr:Array;
		public function loadAni(url:String):void{}
		private var onComplete:*;
		public function parseData(texture:Texture,skeletonData:ArrayBuffer,playbackRate:Number = null):void{}
		public function buildArmature(aniMode:Number = null):Skeleton{}
		public function parse(data:ArrayBuffer):void{}
		private var _parseTexturePath:*;
		private var _textureComplete:*;
		private var _parsePublicExtData:*;
		public function getTexture(name:String):Texture{}
		public function showSkinByIndex(boneSlotDic:*,skinIndex:Number,freshDisplayIndex:Boolean = null):Boolean{}
		public function getSkinIndexByName(skinName:String):Number{}
		public function getGrahicsDataWithCache(aniIndex:Number,frameIndex:Number):Graphics{}
		public function setGrahicsDataWithCache(aniIndex:Number,frameIndex:Number,graphics:Graphics):void{}
		public function deleteAniData(aniIndex:Number):void{}
		public function destroy():void{}
		public function getAniNameByIndex(index:Number):String{}
		public var rate:Number;
	}

}
