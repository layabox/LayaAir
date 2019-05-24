package laya.ani.bone {
	import laya.ani.AnimationContent;
	import laya.ani.AnimationTemplet;
	import laya.ani.bone.BoneSlot;
	import laya.ani.bone.SkinData;
	import laya.ani.bone.SkinSlotDisplayData;
	import laya.ani.bone.SlotData;
	import laya.ani.bone.Transform;
	import laya.display.Graphics;
	import laya.events.Event;
	import laya.maths.Matrix;
	import laya.net.Loader;
	import laya.renders.Render;
	import laya.resource.Texture;
	import laya.utils.Byte;
	import laya.utils.Handler;
	import laya.ani.bone.IkConstraintData;
	
	/**数据解析完成后的调度。
	 * @eventType Event.COMPLETE
	 * */
	[Event(name = "complete", type = "laya.events.Event.COMPLETE", desc = "数据解析完成后的调度")]
	/**数据解析错误后的调度。
	 * @eventType Event.ERROR
	 * */
	[Event(name = "error", type = "laya.events.Event.ERROR", desc = "数据解析错误后的调度")]
	/**
	 * 动画模板类
	 */
	public class Templet extends AnimationTemplet {
		/**@private */
		public static var LAYA_ANIMATION_160_VISION:String = "LAYAANIMATION:1.6.0";
		public static var LAYA_ANIMATION_VISION:String = "LAYAANIMATION:1.7.0";
		public static var TEMPLET_DICTIONARY:Object;
		
		private var _mainTexture:Texture;
		private var _textureJson:*;
		private var _graphicsCache:Array = [];
		
		/** 存放原始骨骼信息 */
		public var srcBoneMatrixArr:Array = [];
		/** IK数据 */
		public var ikArr:Array = [];
		/** transform数据 */
		public var tfArr:Array = [];
		/** path数据 */
		public var pathArr:Array = [];
		/** 存放插槽数据的字典 */
		public var boneSlotDic:Object = {};
		/** 绑定插槽数据的字典 */
		public var bindBoneBoneSlotDic:Object = {};
		/** 存放插糟数据的数组 */
		public var boneSlotArray:Array = [];
		/** 皮肤数据 */
		public var skinDataArray:Array = [];
		/** 皮肤的字典数据 */
		public var skinDic:Object = {};
		/** 存放纹理数据 */
		public var subTextureDic:Object = {};
		/** 是否解析失败 */
		public var isParseFail:Boolean = false;
		/** 反转矩阵，有些骨骼动画要反转才能显示 */
		public var yReverseMatrix:Matrix;
		/** 渲染顺序动画数据 */
		public var drawOrderAniArr:Array = [];
		/** 事件动画数据 */
		public var eventAniArr:Array = [];
		/** @private 索引对应的名称 */
		public var attachmentNames:Array = null;
		/** 顶点动画数据 */
		public var deformAniArr:Array = [];
		/** 实际显示对象列表，用于销毁用 */
		public var skinSlotDisplayDataArr:Vector.<SkinSlotDisplayData> = new Vector.<SkinSlotDisplayData>();
		
		/** 是否需要解析audio数据 */
		private var _isParseAudio:Boolean = false;
		private var _isDestroyed:Boolean = false;
		private var _rate:int = 30;
		public var isParserComplete:Boolean = false;
		public var aniSectionDic:Object = {};
		private var _skBufferUrl:String;
		private var _textureDic:Object = {};
		private var _loadList:Array;
		private var _path:String;
		private var _relativeUrl:String;
		/**@private */
		public var tMatrixDataLen:int;
		
		public var mRootBone:Bone;
		public var mBoneArr:Vector.<Bone> = new Vector.<Bone>();
		
		public function loadAni(url:String):void {
			_skBufferUrl = url;
			Laya.loader.load(url, Handler.create(this, onComplete), null, Loader.BUFFER);
		}
		
		private function onComplete(content:* = null):void {
			if (_isDestroyed)
			{
				destroy();
				return;
			}
			
			var tSkBuffer:ArrayBuffer = Loader.getRes(_skBufferUrl);
			if (!tSkBuffer)
			{
				event(Event.ERROR, "load failed:"+_skBufferUrl);
				return;
			}
			_path = _skBufferUrl.slice(0, _skBufferUrl.lastIndexOf("/")) + "/";
			parseData(null, tSkBuffer);
		}
		
		/**
		 * 解析骨骼动画数据
		 * @param	texture			骨骼动画用到的纹理
		 * @param	skeletonData	骨骼动画信息及纹理分块信息
		 * @param	playbackRate	缓冲的帧率数据（会根据帧率去分帧）
		 */
		public function parseData(texture:Texture, skeletonData:ArrayBuffer, playbackRate:int = 30):void {
			if (!_path) {
				var s1:String = (_relativeUrl || url);
				
				if (s1)
				{
					var p1:int = s1.lastIndexOf('/');
					if (p1 > 0) {
						_path = s1.slice(0, s1) + "/";	
					}else {
						_path = '';
					}
				}			
			}
			
			_mainTexture = texture;
			_rate = playbackRate;
			parse(skeletonData);
		}
		
		/**
		 * 创建动画
		 * 0,使用模板缓冲的数据，模板缓冲的数据，不允许修改					（内存开销小，计算开销小，不支持换装）
		 * 1,使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存	（内存开销大，计算开销小，支持换装）
		 * 2,使用动态方式，去实时去画										（内存开销小，计算开销大，支持换装,不建议使用）
		 * @param	aniMode 0	动画模式，0:不支持换装,1,2支持换装
		 * @return
		 */
		public function buildArmature(aniMode:int = 0):Skeleton {
			return new Skeleton(this, aniMode);
		}
		
		/**
		 * @private
		 * 解析动画
		 * @param	data			解析的二进制数据
		 * @param	playbackRate	帧率
		 */
		override public function parse(data:ArrayBuffer):void {
			super.parse(data);
			//_loaded = true;
			event(Event.LOADED, this);
			if (this._aniVersion === LAYA_ANIMATION_VISION) {
				_isParseAudio = true;
			} else if (this._aniVersion != LAYA_ANIMATION_160_VISION) {
				//trace("[Error] Version " + _aniVersion + " The engine is inconsistent, update to the version " + KeyframesAniTemplet.LAYA_ANIMATION_VISION + " please.");
				trace("[Error] 版本不一致，请使用IDE版本配套的重新导出"+this._aniVersion+"->"+LAYA_ANIMATION_VISION);
				//_loaded = false;
			}
			//解析公共数据
			//if (loaded) {
				//这里后面要改成一个状态，直接确认是不是要不要加载外部图片
				if (_mainTexture) {
					_parsePublicExtData();
				} else {
					_parseTexturePath();
				}
			//} else {
				//this.event(Event.ERROR, this);
				//isParseFail = true;
			//}
		}
		
		private function _parseTexturePath():void {
			if (_isDestroyed)
			{
				destroy();
				return;
			}
			var i:int = 0;
			_loadList = [];
			var tByte:Byte = new Byte(getPublicExtData());
			var tX:Number = 0, tY:Number = 0, tWidth:Number = 0, tHeight:Number = 0;
			var tFrameX:Number = 0, tFrameY:Number = 0, tFrameWidth:Number = 0, tFrameHeight:Number = 0;
			var tTempleData:Number = 0;
			var tTextureLen:int = tByte.getInt32();
			var tTextureName:String = tByte.readUTFString();
			var tTextureNameArr:Array = tTextureName.split("\n");
			var tTexture:Texture;
			var tSrcTexturePath:String;
			for (i = 0; i < tTextureLen; i++) {
				tSrcTexturePath = _path + tTextureNameArr[i * 2];
				tTextureName = tTextureNameArr[i * 2 + 1];
				
				tX = tByte.getFloat32();
				tY = tByte.getFloat32();
				tWidth = tByte.getFloat32();
				tHeight = tByte.getFloat32();
				
				tTempleData = tByte.getFloat32();
				tFrameX = isNaN(tTempleData) ? 0 : tTempleData;
				tTempleData = tByte.getFloat32();
				tFrameY = isNaN(tTempleData) ? 0 : tTempleData;
				tTempleData = tByte.getFloat32();
				tFrameWidth = isNaN(tTempleData) ? tWidth : tTempleData;
				tTempleData = tByte.getFloat32();
				tFrameHeight = isNaN(tTempleData) ? tHeight : tTempleData;
				if (_loadList.indexOf(tSrcTexturePath) == -1) {
					_loadList.push(tSrcTexturePath);
				}
			}
			Laya.loader.load(_loadList, Handler.create(this, _textureComplete));
		}
		
		/**
		 * 纹理加载完成
		 */
		private function _textureComplete():void {
			var tTexture:Texture;
			var tTextureName:String;
			for (var i:int = 0, n:int = _loadList.length; i < n; i++) {
				tTextureName = _loadList[i];
				tTexture = _textureDic[tTextureName] = Loader.getRes(tTextureName);
			}
			_parsePublicExtData();
		}
		
		/**
		 * 解析自定义数据
		 */
		private function _parsePublicExtData():void {
			var i:int = 0, j:int = 0, k:int = 0, l:int = 0, n:int = 0;
			for (i = 0, n = getAnimationCount(); i < n; i++) {
				_graphicsCache.push([]);
			}
			var isSpine:Boolean;
			isSpine = _aniClassName != "Dragon";
			var tByte:Byte = new Byte(getPublicExtData());
			var tX:Number = 0, tY:Number = 0, tWidth:Number = 0, tHeight:Number = 0;
			var tFrameX:Number = 0, tFrameY:Number = 0, tFrameWidth:Number = 0, tFrameHeight:Number = 0;
			var tTempleData:Number = 0;
			//var tTextureLen:int = tByte.getUint8();
			var tTextureLen:int = tByte.getInt32();
			var tTextureName:String = tByte.readUTFString();
			var tTextureNameArr:Array = tTextureName.split("\n");
			var tTexture:Texture;
			var tSrcTexturePath:String;
			for (i = 0; i < tTextureLen; i++) {
				tTexture = _mainTexture;
				tSrcTexturePath = _path + tTextureNameArr[i * 2];
				tTextureName = tTextureNameArr[i * 2 + 1];
				if (_mainTexture == null) {
					tTexture = _textureDic[tSrcTexturePath];
				}
				if (!tTexture)
				{
					this.event(Event.ERROR, this);
					this.isParseFail = true;
					return;
				}
				tX = tByte.getFloat32();
				tY = tByte.getFloat32();
				tWidth = tByte.getFloat32();
				tHeight = tByte.getFloat32();
				
				tTempleData = tByte.getFloat32();
				tFrameX = isNaN(tTempleData) ? 0 : tTempleData;
				tTempleData = tByte.getFloat32();
				tFrameY = isNaN(tTempleData) ? 0 : tTempleData;
				tTempleData = tByte.getFloat32();
				tFrameWidth = isNaN(tTempleData) ? tWidth : tTempleData;
				tTempleData = tByte.getFloat32();
				tFrameHeight = isNaN(tTempleData) ? tHeight : tTempleData;
				subTextureDic[tTextureName] = Texture.create(tTexture, tX, tY, tWidth, tHeight, -tFrameX, -tFrameY, tFrameWidth, tFrameHeight);
			}
			_mainTexture = tTexture;
			
			var tAniCount:int = tByte.getUint16();
			var tSectionArr:Array;
			for (i = 0; i < tAniCount; i++) {
				tSectionArr = [];
				tSectionArr.push(tByte.getUint16());
				tSectionArr.push(tByte.getUint16());
				tSectionArr.push(tByte.getUint16());
				tSectionArr.push(tByte.getUint16());
				aniSectionDic[i] = tSectionArr;
			}
			
			var tBone:Bone;
			var tParentBone:Bone;
			var tName:String;
			var tParentName:String;
			var tBoneLen:int = tByte.getInt16();
			var tBoneDic:Object = {};
			var tRootBone:Bone;
			for (i = 0; i < tBoneLen; i++) {
				tBone = new Bone();
				if (i == 0) {
					tRootBone = tBone;
				} else {
					tBone.root = tRootBone;
				}
				tBone.d = isSpine? -1:1;
				tName = tByte.readUTFString();
				tParentName = tByte.readUTFString();
				tBone.length = tByte.getFloat32();
				if (tByte.getByte() == 1) {
					tBone.inheritRotation = false;
				}
				if (tByte.getByte() == 1) {
					tBone.inheritScale = false;
				}
				tBone.name = tName;
				if (tParentName) {
					tParentBone = tBoneDic[tParentName];
					if (tParentBone) {
						tParentBone.addChild(tBone);
					} else {
						mRootBone = tBone;
					}
				}
				tBoneDic[tName] = tBone;
				mBoneArr.push(tBone);
			}
			
			tMatrixDataLen = tByte.getUint16();
			var tLen:int = tByte.getUint16();
			var parentIndex:int;
			var boneLength:int = Math.floor(tLen / tMatrixDataLen);
			var tResultTransform:Transform;
			var tMatrixArray:Array = srcBoneMatrixArr;
			for (i = 0; i < boneLength; i++) {
				tResultTransform = new Transform();
				tResultTransform.scX = tByte.getFloat32();
				tResultTransform.skX = tByte.getFloat32();
				tResultTransform.skY = tByte.getFloat32();
				tResultTransform.scY = tByte.getFloat32();
				tResultTransform.x = tByte.getFloat32();
				tResultTransform.y = tByte.getFloat32();
				if (tMatrixDataLen === 8) {
					tResultTransform.skewX = tByte.getFloat32();
					tResultTransform.skewY = tByte.getFloat32();
				}
				tMatrixArray.push(tResultTransform);
				tBone = mBoneArr[i];
				tBone.transform = tResultTransform;
			}
			
			var tIkConstraintData:IkConstraintData;
			var tIkLen:int = tByte.getUint16();
			var tIkBoneLen:int;
			for (i = 0; i < tIkLen; i++) {
				tIkConstraintData = new IkConstraintData();
				tIkBoneLen = tByte.getUint16();
				for (j = 0; j < tIkBoneLen; j++) {
					tIkConstraintData.boneNames.push(tByte.readUTFString());
					tIkConstraintData.boneIndexs.push(tByte.getInt16());
				}
				tIkConstraintData.name = tByte.readUTFString();
				tIkConstraintData.targetBoneName = tByte.readUTFString();
				tIkConstraintData.targetBoneIndex = tByte.getInt16();
				tIkConstraintData.bendDirection = tByte.getFloat32();
				tIkConstraintData.mix = tByte.getFloat32();
				tIkConstraintData.isSpine = isSpine;
				ikArr.push(tIkConstraintData);
			}
			
			var tTfConstraintData:TfConstraintData;
			var tTfLen:int = tByte.getUint16();
			var tTfBoneLen:int;
			for (i = 0; i < tTfLen; i++) {
				tTfConstraintData = new TfConstraintData();
				tTfBoneLen = tByte.getUint16();
				for (j = 0; j < tTfBoneLen; j++) {
					tTfConstraintData.boneIndexs.push(tByte.getInt16());
				}
				tTfConstraintData.name = tByte.getUTFString();
				tTfConstraintData.targetIndex = tByte.getInt16();
				tTfConstraintData.rotateMix = tByte.getFloat32();
				tTfConstraintData.translateMix = tByte.getFloat32();
				tTfConstraintData.scaleMix = tByte.getFloat32();
				tTfConstraintData.shearMix = tByte.getFloat32();
				tTfConstraintData.offsetRotation = tByte.getFloat32();
				tTfConstraintData.offsetX = tByte.getFloat32();
				tTfConstraintData.offsetY = tByte.getFloat32();
				tTfConstraintData.offsetScaleX = tByte.getFloat32();
				tTfConstraintData.offsetScaleY = tByte.getFloat32();
				tTfConstraintData.offsetShearY = tByte.getFloat32();
				tfArr.push(tTfConstraintData);
			}
			
			var tPathConstraintData:PathConstraintData;
			var tPathLen:int = tByte.getUint16();
			var tPathBoneLen:int;
			for (i = 0; i < tPathLen; i++) {
				tPathConstraintData = new PathConstraintData();
				tPathConstraintData.name = tByte.readUTFString();
				tPathBoneLen = tByte.getUint16();
				for (j = 0; j < tPathBoneLen; j++) {
					tPathConstraintData.bones.push(tByte.getInt16());
				}
				tPathConstraintData.target = tByte.readUTFString();
				tPathConstraintData.positionMode = tByte.readUTFString();
				tPathConstraintData.spacingMode = tByte.readUTFString();
				tPathConstraintData.rotateMode = tByte.readUTFString();
				tPathConstraintData.offsetRotation = tByte.getFloat32();
				tPathConstraintData.position = tByte.getFloat32();
				tPathConstraintData.spacing = tByte.getFloat32();
				tPathConstraintData.rotateMix = tByte.getFloat32();
				tPathConstraintData.translateMix = tByte.getFloat32();
				pathArr.push(tPathConstraintData);
			}
			
			var tDeformSlotLen:int;
			var tDeformSlotDisplayLen:int;
			var tDSlotIndex:int;
			var tDAttachment:String;
			var tDeformTimeLen:int;
			var tDTime:Number;
			var tDeformVecticesLen:int;
			var tDeformAniData:DeformAniData;
			var tDeformSlotData:DeformSlotData;
			var tDeformSlotDisplayData:DeformSlotDisplayData;
			var tDeformVectices:Array;
			var tDeformAniLen:int = tByte.getInt16();
			for (i = 0; i < tDeformAniLen; i++) {
				var tDeformSkinLen:int = tByte.getUint8();
				var tSkinDic:Object = { };
				deformAniArr.push(tSkinDic);
				for (var f:int = 0; f < tDeformSkinLen; f++)
				{
					tDeformAniData = new DeformAniData();
					tDeformAniData.skinName = tByte.getUTFString();
					tSkinDic[tDeformAniData.skinName] = tDeformAniData;
					tDeformSlotLen = tByte.getInt16();
					for (j = 0; j < tDeformSlotLen; j++) {
						tDeformSlotData = new DeformSlotData();
						tDeformAniData.deformSlotDataList.push(tDeformSlotData);
						
						tDeformSlotDisplayLen = tByte.getInt16();
						for (k = 0; k < tDeformSlotDisplayLen; k++) {
							tDeformSlotDisplayData = new DeformSlotDisplayData();
							tDeformSlotData.deformSlotDisplayList.push(tDeformSlotDisplayData);
							tDeformSlotDisplayData.slotIndex = tDSlotIndex = tByte.getInt16();
							tDeformSlotDisplayData.attachment = tDAttachment = tByte.getUTFString();
							tDeformTimeLen = tByte.getInt16();
							for (l = 0; l < tDeformTimeLen; l++) {
								if (tByte.getByte() == 1)
								{
									tDeformSlotDisplayData.tweenKeyList.push(true);
								}else {
									tDeformSlotDisplayData.tweenKeyList.push(false);
								}
								tDTime = tByte.getFloat32();
								tDeformSlotDisplayData.timeList.push(tDTime);
								tDeformVectices = [];
								tDeformSlotDisplayData.vectices.push(tDeformVectices);
								tDeformVecticesLen = tByte.getInt16();
								for (n = 0; n < tDeformVecticesLen; n++) {
									tDeformVectices.push(tByte.getFloat32());
								}
							}
						}
					}
				}
			}
			
			var tDrawOrderArr:Vector.<DrawOrderData>;
			var tDrawOrderAniLen:int = tByte.getInt16();
			var tDrawOrderLen:int;
			var tDrawOrderData:DrawOrderData;
			var tDoLen:int;
			for (i = 0; i < tDrawOrderAniLen; i++) {
				tDrawOrderLen = tByte.getInt16();
				tDrawOrderArr = new Vector.<DrawOrderData>();
				for (j = 0; j < tDrawOrderLen; j++) {
					tDrawOrderData = new DrawOrderData();
					tDrawOrderData.time = tByte.getFloat32();
					tDoLen = tByte.getInt16();
					for (k = 0; k < tDoLen; k++) {
						tDrawOrderData.drawOrder.push(tByte.getInt16());
					}
					tDrawOrderArr.push(tDrawOrderData);
				}
				drawOrderAniArr.push(tDrawOrderArr);
			}
			
			var tEventArr:Vector.<EventData>;
			var tEventAniLen:int = tByte.getInt16();
			var tEventLen:int;
			var tEventData:EventData;
			for (i = 0; i < tEventAniLen; i++) {
				tEventLen = tByte.getInt16();
				tEventArr = new Vector.<EventData>();
				for (j = 0; j < tEventLen; j++) {
					tEventData = new EventData();
					tEventData.name = tByte.getUTFString();
					if (_isParseAudio) tEventData.audioValue = tByte.getUTFString();
					tEventData.intValue = tByte.getInt32();
					tEventData.floatValue = tByte.getFloat32();
					tEventData.stringValue = tByte.getUTFString();
					tEventData.time = tByte.getFloat32();
					tEventArr.push(tEventData);
				}
				eventAniArr.push(tEventArr);
			}
			
			var tAttachmentLen:int = tByte.getInt16();
			if (tAttachmentLen > 0) {	
				attachmentNames = [];
				for (i = 0; i < tAttachmentLen; i++) {	
					attachmentNames.push(tByte.getUTFString());
				}
			}
			
			//创建插槽并绑定到骨骼上
			var tBoneSlotLen:int = tByte.getInt16();
			var tDBBoneSlot:BoneSlot;
			var tDBBoneSlotArr:Array;
			for (i = 0; i < tBoneSlotLen; i++) {
				tDBBoneSlot = new BoneSlot();
				tDBBoneSlot.name = tByte.readUTFString();
				tDBBoneSlot.parent = tByte.readUTFString();
				tDBBoneSlot.attachmentName = tByte.readUTFString();
				tDBBoneSlot.srcDisplayIndex = tDBBoneSlot.displayIndex = tByte.getInt16();
				tDBBoneSlot.templet = this;
				boneSlotDic[tDBBoneSlot.name] = tDBBoneSlot;
				tDBBoneSlotArr = bindBoneBoneSlotDic[tDBBoneSlot.parent];
				if (tDBBoneSlotArr == null) {
					bindBoneBoneSlotDic[tDBBoneSlot.parent] = tDBBoneSlotArr = [];
				}
				tDBBoneSlotArr.push(tDBBoneSlot);
				boneSlotArray.push(tDBBoneSlot);
			}
			
			var tNameString:String = tByte.readUTFString();
			var tNameArray:Array = tNameString.split("\n");
			var tNameStartIndex:int = 0;
			
			var tSkinDataLen:int = tByte.getUint8();
			var tSkinData:SkinData, tSlotData:SlotData, tDisplayData:SkinSlotDisplayData;
			var tSlotDataLen:int, tDisplayDataLen:int;
			var tUvLen:uint, tWeightLen:uint, tTriangleLen:uint, tVerticeLen:uint, tLengthLen:uint;
			for (i = 0; i < tSkinDataLen; i++) {
				tSkinData = new SkinData();
				tSkinData.name = tNameArray[tNameStartIndex++];
				tSlotDataLen = tByte.getUint8();
				for (j = 0; j < tSlotDataLen; j++) {
					tSlotData = new SlotData();
					tSlotData.name = tNameArray[tNameStartIndex++];
					tDBBoneSlot = boneSlotDic[tSlotData.name];
					tDisplayDataLen = tByte.getUint8();
					for (k = 0; k < tDisplayDataLen; k++) {
						tDisplayData = new SkinSlotDisplayData();
						skinSlotDisplayDataArr.push(tDisplayData);
						tDisplayData.name = tNameArray[tNameStartIndex++];
						tDisplayData.attachmentName = tNameArray[tNameStartIndex++];
						tDisplayData.transform = new Transform();
						tDisplayData.transform.scX = tByte.getFloat32();
						tDisplayData.transform.skX = tByte.getFloat32();
						tDisplayData.transform.skY = tByte.getFloat32();
						tDisplayData.transform.scY = tByte.getFloat32();
						tDisplayData.transform.x = tByte.getFloat32();
						tDisplayData.transform.y = tByte.getFloat32();
						
						tSlotData.displayArr.push(tDisplayData);
						tDisplayData.width = tByte.getFloat32();
						tDisplayData.height = tByte.getFloat32();
						tDisplayData.type = tByte.getUint8();
						tDisplayData.verLen = tByte.getUint16();
						
						tBoneLen = tByte.getUint16();
						if (tBoneLen > 0) {
							tDisplayData.bones = [];
							for (l = 0; l < tBoneLen; l++) {
								var tBoneId:uint = tByte.getUint16();
								tDisplayData.bones.push(tBoneId);
							}
						}
						tUvLen = tByte.getUint16();
						if (tUvLen > 0) {
							tDisplayData.uvs = [];
							for (l = 0; l < tUvLen; l++) {
								tDisplayData.uvs.push(tByte.getFloat32());
							}
						}
						tWeightLen = tByte.getUint16();
						if (tWeightLen > 0) {
							tDisplayData.weights = [];
							for (l = 0; l < tWeightLen; l++) {
								tDisplayData.weights.push(tByte.getFloat32());
							}
						}
						tTriangleLen = tByte.getUint16();
						if (tTriangleLen > 0) {
							tDisplayData.triangles = [];
							for (l = 0; l < tTriangleLen; l++) {
								tDisplayData.triangles.push(tByte.getUint16());
							}
						}
						tVerticeLen = tByte.getUint16();
						if (tVerticeLen > 0) {
							tDisplayData.vertices = [];
							for (l = 0; l < tVerticeLen; l++) {
								tDisplayData.vertices.push(tByte.getFloat32());
							}
						}
							
						tLengthLen = tByte.getUint16();
						if (tLengthLen > 0) {
							tDisplayData.lengths = [];
							for (l = 0; l < tLengthLen; l++) {
								tDisplayData.lengths.push(tByte.getFloat32());
							}
						}
					}
					tSkinData.slotArr.push(tSlotData);
				}
				skinDic[tSkinData.name] = tSkinData;
				skinDataArray.push(tSkinData);
			}
			var tReverse:uint = tByte.getUint8();
			if (tReverse == 1) {
				yReverseMatrix = new Matrix(1, 0, 0, -1, 0, 0);
				if (tRootBone) {
					tRootBone.setTempMatrix(yReverseMatrix);
				}
			} else {
				if (tRootBone) {
					tRootBone.setTempMatrix(new Matrix());
				}
			}
			showSkinByIndex(boneSlotDic, 0);
			this.isParserComplete = true;
			this.event(Event.COMPLETE, this);
		}
		
		/**
		 * 得到指定的纹理
		 * @param	name	纹理的名字
		 * @return
		 */
		public function getTexture(name:String):Texture {
			var tTexture:Texture = subTextureDic[name];
			if (!tTexture)
			{
				tTexture = subTextureDic[name.substr(0,name.length-1)];
			}
			if (tTexture == null) {
				return _mainTexture;
			}
			return tTexture;
		}
		
		/**
		 * @private
		 * 显示指定的皮肤
		 * @param	boneSlotDic	插糟字典的引用
		 * @param	skinIndex	皮肤的索引
		 * @param	freshDisplayIndex	是否重置插槽纹理
		 */
		public function showSkinByIndex(boneSlotDic:Object, skinIndex:int,freshDisplayIndex:Boolean=true):Boolean {
			if (skinIndex < 0 && skinIndex >= skinDataArray.length) return false;
			var i:int, n:int;
			var tBoneSlot:BoneSlot;
			var tSlotData:SlotData;
			var tSkinData:SkinData = skinDataArray[skinIndex];
			if (tSkinData) {
				for (i = 0, n = tSkinData.slotArr.length; i < n; i++) {
					tSlotData = tSkinData.slotArr[i];
					if (tSlotData) {
						tBoneSlot = boneSlotDic[tSlotData.name];
						if (tBoneSlot) {
							tBoneSlot.showSlotData(tSlotData,freshDisplayIndex);
							if (freshDisplayIndex&&tBoneSlot.attachmentName != "undefined" && tBoneSlot.attachmentName != "null") {
								tBoneSlot.showDisplayByName(tBoneSlot.attachmentName);
							} else {
								tBoneSlot.showDisplayByIndex(tBoneSlot.displayIndex);
							}
						}
					}
				}
				return true;
			}
			return false;
		}
		
		/**
		 * 通过皮肤名字得到皮肤索引
		 * @param	skinName 皮肤名称
		 * @return
		 */
		public function getSkinIndexByName(skinName:String):int {
			var tSkinData:SkinData;
			for (var i:int = 0, n:int = skinDataArray.length; i < n; i++) {
				tSkinData = skinDataArray[i];
				if (tSkinData.name == skinName) {
					return i;
				}
			}
			return -1;
		}
		
		/**
		 * @private
		 * 得到缓冲数据
		 * @param	aniIndex	动画索引
		 * @param	frameIndex	帧索引
		 * @return
		 */
		public function getGrahicsDataWithCache(aniIndex:int, frameIndex:Number):Graphics {
			if (_graphicsCache[aniIndex] && _graphicsCache[aniIndex][frameIndex])
			{
				return _graphicsCache[aniIndex][frameIndex];
			}
			//trace("getGrahicsDataWithCache fail:",aniIndex,frameIndex,this._path);
			return null;
		}
		

		override public function _setCreateURL(url:String):void 
		{
			_relativeUrl = url;
			super._setCreateURL(url);
		}
		
		/**
		 * @private
		 * 保存缓冲grahpics
		 * @param	aniIndex	动画索引
		 * @param	frameIndex	帧索引
		 * @param	graphics	要保存的数据
		 */
		public function setGrahicsDataWithCache(aniIndex:int, frameIndex:int, graphics:Graphics):void {
			_graphicsCache[aniIndex][frameIndex] = graphics;
		}
		
		public function deleteAniData(aniIndex:int):void
		{
			if (_anis[aniIndex])
			{
				var tAniDataO:AnimationContent = _anis[aniIndex];
				tAniDataO.bone3DMap = null;
				tAniDataO.nodes = null;
			}
		}
		/**
		 * 释放纹理
		 */
		override public function destroy():void {
			_isDestroyed = true;
			var tTexture:Texture;
			for each (tTexture in subTextureDic) {
				if(tTexture)
				tTexture.destroy();
			}
			for each (tTexture in _textureDic) {
				if(tTexture)
				tTexture.destroy();
			}
			var tSkinSlotDisplayData:SkinSlotDisplayData;
			for (var i:int = 0, n:int = skinSlotDisplayDataArr.length; i < n; i++) {
				tSkinSlotDisplayData = skinSlotDisplayDataArr[i];
				tSkinSlotDisplayData.destory();
			}
			skinSlotDisplayDataArr.length = 0;
			if (url) {
				delete TEMPLET_DICTIONARY[url];
			}
			super.destroy();
		}
		
		/***********************************下面为一些儿访问接口*****************************************/
		/**
		 * 通过索引得动画名称
		 * @param	index
		 * @return
		 */
		public function getAniNameByIndex(index:int):String {
			var tAni:* = getAnimation(index);
			if (tAni) return tAni.name;
			return null;
		}
		
		public function get rate():Number {
			return _rate;
		}
		
		public function set rate(v:Number):void {
			_rate = v;
		}
	}
}