import { Bone } from "./Bone";
import { TfConstraintData } from "./TfConstraintData";
import { PathConstraintData } from "./PathConstraintData";
import { DeformAniData } from "./DeformAniData";
import { DeformSlotData } from "./DeformSlotData";
import { DeformSlotDisplayData } from "./DeformSlotDisplayData";
import { DrawOrderData } from "./DrawOrderData";
import { EventData } from "./EventData";
import { AnimationContent } from "../AnimationContent"
import { AnimationTemplet } from "../AnimationTemplet"
import { BoneSlot } from "./BoneSlot"
import { SkinData } from "./SkinData"
import { SkinSlotDisplayData } from "./SkinSlotDisplayData"
import { SlotData } from "./SlotData"
import { Transform } from "./Transform"
import { IkConstraintData } from "./IkConstraintData"
import { Texture } from "../../resource/Texture";
import { Matrix } from "../../maths/Matrix";
import { Handler } from "../../utils/Handler";
import { Event } from "../../events/Event";
import { Byte } from "../../utils/Byte";
import { Graphics } from "../../display/Graphics";
import { IAniLib } from "../AniLibPack";
import { Skeleton } from "./Skeleton";
import { ILaya } from "../../../ILaya";

/**数据解析完成后的调度。
 * @eventType Event.COMPLETE
 * */
/*[Event(name = "complete", type = "laya.events.Event.COMPLETE", desc = "数据解析完成后的调度")]*/
/**数据解析错误后的调度。
 * @eventType Event.ERROR
 * */
/*[Event(name = "error", type = "laya.events.Event.ERROR", desc = "数据解析错误后的调度")]*/
/**
 * 动画模板类
 */
export class Templet extends AnimationTemplet {
	/**@internal */
	static LAYA_ANIMATION_160_VISION: string = "LAYAANIMATION:1.6.0";
	/**@internal */
	static LAYA_ANIMATION_VISION: string = "LAYAANIMATION:1.7.0";
	/**@internal */
	static TEMPLET_DICTIONARY: any;
	/**@internal */
	private _mainTexture: Texture;
	/**@internal */
	private _graphicsCache: any[] = [];

	/** 存放原始骨骼信息 */
	srcBoneMatrixArr: any[] = [];
	/** IK数据 */
	ikArr: any[] = [];
	/** transform数据 */
	tfArr: any[] = [];
	/** path数据 */
	pathArr: any[] = [];
	/** 存放插槽数据的字典 */
	boneSlotDic: any = {};
	/** 绑定插槽数据的字典 */
	bindBoneBoneSlotDic: any = {};
	/** 存放插糟数据的数组 */
	boneSlotArray: any[] = [];
	/** 皮肤数据 */
	skinDataArray: any[] = [];
	/** 皮肤的字典数据 */
	skinDic: any = {};
	/** 存放纹理数据 */
	subTextureDic: any = {};
	/** 是否解析失败 */
	isParseFail: boolean = false;
	/** 反转矩阵，有些骨骼动画要反转才能显示 */
	yReverseMatrix: Matrix;
	/** 渲染顺序动画数据 */
	drawOrderAniArr: any[] = [];
	/** 事件动画数据 */
	eventAniArr: any[] = [];
	/** @private 索引对应的名称 */
	attachmentNames: any[] = null;
	/** 顶点动画数据 */
	deformAniArr: any[] = [];
	/** 实际显示对象列表，用于销毁用 */
	skinSlotDisplayDataArr: SkinSlotDisplayData[] = [];

	/** @internal 是否需要解析audio数据 */
	private _isParseAudio: boolean = false;
	/**@internal */
	private _isDestroyed: boolean = false;
	/**@internal */
	private _rate: number = 30;
	isParserComplete: boolean = false;
	aniSectionDic: any = {};
	/**@internal */
	private _skBufferUrl: string;
	/**@internal */
	private _textureDic: any = {};
	/**@internal */
	private _loadList: any[];
	/**@internal */
	private _path: string;
	/**@internal */
	private _relativeUrl: string;
	/**@private */
	tMatrixDataLen: number;

	mRootBone: Bone;
	mBoneArr: Bone[] = [];

	loadAni(url: string): void {
		this._skBufferUrl = url;
		ILaya.loader.load(url, Handler.create(this, this.onComplete), null, ILaya.Loader.BUFFER);
	}

	private onComplete(content: any = null): void {
		if (this._isDestroyed) {
			this.destroy();
			return;
		}

		var tSkBuffer: ArrayBuffer = ILaya.Loader.getRes(this._skBufferUrl);
		if (!tSkBuffer) {
			this.event(Event.ERROR, "load failed:" + this._skBufferUrl);
			return;
		}
		this._path = this._skBufferUrl.slice(0, this._skBufferUrl.lastIndexOf("/")) + "/";
		this.parseData(null, tSkBuffer);
	}

	/**
	 * 解析骨骼动画数据
	 * @param	texture			骨骼动画用到的纹理
	 * @param	skeletonData	骨骼动画信息及纹理分块信息
	 * @param	playbackRate	缓冲的帧率数据（会根据帧率去分帧）
	 */
	parseData(texture: Texture, skeletonData: ArrayBuffer, playbackRate: number = 30): void {
		if (!this._path) {
			var s1: string = (this._relativeUrl || this.url);

			if (s1) {
				var p1: number = s1.lastIndexOf('/');
				if (p1 > 0) {
					this._path = s1.slice(0, p1) + "/";
				} else {
					this._path = '';
				}
			}
		}

		this._mainTexture = texture;
		this._rate = playbackRate;
		this.parse(skeletonData);
	}

	/**
	 * 创建动画
	 * 0,使用模板缓冲的数据，模板缓冲的数据，不允许修改					（内存开销小，计算开销小，不支持换装）
	 * 1,使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存	（内存开销大，计算开销小，支持换装）
	 * 2,使用动态方式，去实时去画										（内存开销小，计算开销大，支持换装,不建议使用）
	 * @param	aniMode 0	动画模式，0:不支持换装,1,2支持换装
	 * @return
	 */
	buildArmature(aniMode: number = 0): Skeleton {
		return new Skeleton(this, aniMode);
	}

		/**
		 * @private
		 * 解析动画
		 * @param	data			解析的二进制数据
		 * @param	playbackRate	帧率
		 * @override
		 */
		parse(data: ArrayBuffer): void {
		super.parse(data);
		//_loaded = true;
		this.event(Event.LOADED, this);
		if (this._aniVersion === Templet.LAYA_ANIMATION_VISION) {
			this._isParseAudio = true;
		} else if (this._aniVersion != Templet.LAYA_ANIMATION_160_VISION) {
			//trace("[Error] Version " + _aniVersion + " The engine is inconsistent, update to the version " + KeyframesAniTemplet.LAYA_ANIMATION_VISION + " please.");
			console.log("[Error] 版本不一致，请使用IDE版本配套的重新导出" + this._aniVersion + "->" + Templet.LAYA_ANIMATION_VISION);
			//_loaded = false;
		}
		//解析公共数据
		//if (loaded) {
		//这里后面要改成一个状态，直接确认是不是要不要加载外部图片
		if (this._mainTexture) {
			this._parsePublicExtData();
		} else {
			this._parseTexturePath();
		}
		//} else {
		//this.event(Event.ERROR, this);
		//isParseFail = true;
		//}
	}

	/**@internal */
	private _parseTexturePath(): void {
		if (this._isDestroyed) {
			this.destroy();
			return;
		}
		var i: number = 0;
		this._loadList = [];
		var tByte: Byte = new Byte(this.getPublicExtData());
		var tX = 0, tY = 0, tWidth = 0, tHeight = 0;
		var tFrameX = 0, tFrameY = 0, tFrameWidth = 0, tFrameHeight = 0;
		var tTempleData: number = 0;
		var tTextureLen: number = tByte.getInt32();
		var tTextureName: string = tByte.readUTFString();
		var tTextureNameArr: any[] = tTextureName.split("\n");
		var tSrcTexturePath: string;
		for (i = 0; i < tTextureLen; i++) {
			tSrcTexturePath = this._path + tTextureNameArr[i * 2];
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
			if (this._loadList.indexOf(tSrcTexturePath) == -1) {
				this._loadList.push(tSrcTexturePath);
			}
		}
		ILaya.loader.load(this._loadList, Handler.create(this, this._textureComplete));
	}

	/**
	 * @internal
	 * 纹理加载完成
	 */
	private _textureComplete(): void {
		var tTextureName: string;
		for (var i: number = 0, n: number = this._loadList.length; i < n; i++) {
			tTextureName = this._loadList[i];
			this._textureDic[tTextureName] = ILaya.Loader.getRes(tTextureName);
		}
		this._parsePublicExtData();
	}

	/**
	 * @internal
	 * 解析自定义数据
	 */
	private _parsePublicExtData(): void {
		var i: number = 0, j: number = 0, k: number = 0, l: number = 0, n: number = 0;
		for (i = 0, n = this.getAnimationCount(); i < n; i++) {
			this._graphicsCache.push([]);
		}
		var isSpine: boolean;
		isSpine = this._aniClassName != "Dragon";
		var tByte: Byte = new Byte(this.getPublicExtData());
		var tX: number = 0, tY: number = 0, tWidth: number = 0, tHeight: number = 0;
		var tFrameX: number = 0, tFrameY: number = 0, tFrameWidth: number = 0, tFrameHeight: number = 0;
		var tTempleData: number = 0;
		//var tTextureLen:int = tByte.getUint8();
		var tTextureLen: number = tByte.getInt32();
		var tTextureName: string = tByte.readUTFString();
		var tTextureNameArr: any[] = tTextureName.split("\n");
		var tTexture: Texture;
		var tSrcTexturePath: string;
		for (i = 0; i < tTextureLen; i++) {
			tTexture = this._mainTexture;
			tSrcTexturePath = this._path + tTextureNameArr[i * 2];
			tTextureName = tTextureNameArr[i * 2 + 1];
			if (this._mainTexture == null) {
				tTexture = this._textureDic[tSrcTexturePath];
			}
			if (!tTexture) {
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
			this.subTextureDic[tTextureName] = Texture.create(tTexture, tX, tY, tWidth, tHeight, -tFrameX, -tFrameY, tFrameWidth, tFrameHeight);
		}
		this._mainTexture = tTexture;

		var tAniCount: number = tByte.getUint16();
		var tSectionArr: any[];
		for (i = 0; i < tAniCount; i++) {
			tSectionArr = [];
			tSectionArr.push(tByte.getUint16());
			tSectionArr.push(tByte.getUint16());
			tSectionArr.push(tByte.getUint16());
			tSectionArr.push(tByte.getUint16());
			this.aniSectionDic[i] = tSectionArr;
		}

		var tBone: Bone;
		var tParentBone: Bone;
		var tName: string;
		var tParentName: string;
		var tBoneLen: number = tByte.getInt16();
		var tBoneDic: any = {};
		var tRootBone: Bone;
		for (i = 0; i < tBoneLen; i++) {
			tBone = new Bone();
			if (i == 0) {
				tRootBone = tBone;
			} else {
				tBone.root = tRootBone;
			}
			tBone.d = isSpine ? -1 : 1;
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
					this.mRootBone = tBone;
				}
			}
			tBoneDic[tName] = tBone;
			this.mBoneArr.push(tBone);
		}

		this.tMatrixDataLen = tByte.getUint16();
		var tLen: number = tByte.getUint16();
		var boneLength: number = Math.floor(tLen / this.tMatrixDataLen);
		var tResultTransform: Transform;
		var tMatrixArray: any[] = this.srcBoneMatrixArr;
		for (i = 0; i < boneLength; i++) {
			tResultTransform = new Transform();
			tResultTransform.scX = tByte.getFloat32();
			tResultTransform.skX = tByte.getFloat32();
			tResultTransform.skY = tByte.getFloat32();
			tResultTransform.scY = tByte.getFloat32();
			tResultTransform.x = tByte.getFloat32();
			tResultTransform.y = tByte.getFloat32();
			if (this.tMatrixDataLen === 8) {
				tResultTransform.skewX = tByte.getFloat32();
				tResultTransform.skewY = tByte.getFloat32();
			}
			tMatrixArray.push(tResultTransform);
			tBone = this.mBoneArr[i];
			tBone.transform = tResultTransform;
		}

		var tIkConstraintData: IkConstraintData;
		var tIkLen: number = tByte.getUint16();
		var tIkBoneLen: number;
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
			this.ikArr.push(tIkConstraintData);
		}

		var tTfConstraintData: TfConstraintData;
		var tTfLen: number = tByte.getUint16();
		var tTfBoneLen: number;
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
			this.tfArr.push(tTfConstraintData);
		}

		var tPathConstraintData: PathConstraintData;
		var tPathLen: number = tByte.getUint16();
		var tPathBoneLen: number;
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
			this.pathArr.push(tPathConstraintData);
		}

		var tDeformSlotLen: number;
		var tDeformSlotDisplayLen: number;
		var tDSlotIndex: number;
		var tDAttachment: string;
		var tDeformTimeLen: number;
		var tDTime: number;
		var tDeformVecticesLen: number;
		var tDeformAniData: DeformAniData;
		var tDeformSlotData: DeformSlotData;
		var tDeformSlotDisplayData: DeformSlotDisplayData;
		var tDeformVectices: any[];
		var tDeformAniLen: number = tByte.getInt16();
		for (i = 0; i < tDeformAniLen; i++) {
			var tDeformSkinLen: number = tByte.getUint8();
			var tSkinDic: any = {};
			this.deformAniArr.push(tSkinDic);
			for (var f: number = 0; f < tDeformSkinLen; f++) {
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
							if (tByte.getByte() == 1) {
								tDeformSlotDisplayData.tweenKeyList.push(true);
							} else {
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

		var tDrawOrderArr: DrawOrderData[];
		var tDrawOrderAniLen: number = tByte.getInt16();
		var tDrawOrderLen: number;
		var tDrawOrderData: DrawOrderData;
		var tDoLen: number;
		for (i = 0; i < tDrawOrderAniLen; i++) {
			tDrawOrderLen = tByte.getInt16();
			tDrawOrderArr = [];
			for (j = 0; j < tDrawOrderLen; j++) {
				tDrawOrderData = new DrawOrderData();
				tDrawOrderData.time = tByte.getFloat32();
				tDoLen = tByte.getInt16();
				for (k = 0; k < tDoLen; k++) {
					tDrawOrderData.drawOrder.push(tByte.getInt16());
				}
				tDrawOrderArr.push(tDrawOrderData);
			}
			this.drawOrderAniArr.push(tDrawOrderArr);
		}

		var tEventArr: EventData[];
		var tEventAniLen: number = tByte.getInt16();
		var tEventLen: number;
		var tEventData: EventData;
		for (i = 0; i < tEventAniLen; i++) {
			tEventLen = tByte.getInt16();
			tEventArr = [];
			for (j = 0; j < tEventLen; j++) {
				tEventData = new EventData();
				tEventData.name = tByte.getUTFString();
				if (this._isParseAudio) tEventData.audioValue = tByte.getUTFString();
				tEventData.intValue = tByte.getInt32();
				tEventData.floatValue = tByte.getFloat32();
				tEventData.stringValue = tByte.getUTFString();
				tEventData.time = tByte.getFloat32();
				tEventArr.push(tEventData);
			}
			this.eventAniArr.push(tEventArr);
		}

		var tAttachmentLen: number = tByte.getInt16();
		if (tAttachmentLen > 0) {
			this.attachmentNames = [];
			for (i = 0; i < tAttachmentLen; i++) {
				this.attachmentNames.push(tByte.getUTFString());
			}
		}

		//创建插槽并绑定到骨骼上
		var tBoneSlotLen: number = tByte.getInt16();
		var tDBBoneSlot: BoneSlot;
		var tDBBoneSlotArr: any[];
		for (i = 0; i < tBoneSlotLen; i++) {
			tDBBoneSlot = new BoneSlot();
			tDBBoneSlot.name = tByte.readUTFString();
			tDBBoneSlot.parent = tByte.readUTFString();
			tDBBoneSlot.attachmentName = tByte.readUTFString();
			tDBBoneSlot.srcDisplayIndex = tDBBoneSlot.displayIndex = tByte.getInt16();
			tDBBoneSlot.templet = this;
			this.boneSlotDic[tDBBoneSlot.name] = tDBBoneSlot;
			tDBBoneSlotArr = this.bindBoneBoneSlotDic[tDBBoneSlot.parent];
			if (tDBBoneSlotArr == null) {
				this.bindBoneBoneSlotDic[tDBBoneSlot.parent] = tDBBoneSlotArr = [];
			}
			tDBBoneSlotArr.push(tDBBoneSlot);
			this.boneSlotArray.push(tDBBoneSlot);
		}

		var tNameString: string = tByte.readUTFString();
		var tNameArray: any[] = tNameString.split("\n");
		var tNameStartIndex: number = 0;

		var tSkinDataLen: number = tByte.getUint8();
		var tSkinData: SkinData, tSlotData: SlotData, tDisplayData: SkinSlotDisplayData;
		var tSlotDataLen: number, tDisplayDataLen: number;
		var tUvLen: number, tWeightLen: number, tTriangleLen: number, tVerticeLen: number, tLengthLen: number;
		for (i = 0; i < tSkinDataLen; i++) {
			tSkinData = new SkinData();
			tSkinData.name = tNameArray[tNameStartIndex++];
			tSlotDataLen = tByte.getUint8();
			for (j = 0; j < tSlotDataLen; j++) {
				tSlotData = new SlotData();
				tSlotData.name = tNameArray[tNameStartIndex++];
				tDBBoneSlot = this.boneSlotDic[tSlotData.name];
				tDisplayDataLen = tByte.getUint8();
				for (k = 0; k < tDisplayDataLen; k++) {
					tDisplayData = new SkinSlotDisplayData();
					this.skinSlotDisplayDataArr.push(tDisplayData);
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
							var tBoneId: number = tByte.getUint16();
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
			this.skinDic[tSkinData.name] = tSkinData;
			this.skinDataArray.push(tSkinData);
		}
		var tReverse: number = tByte.getUint8();
		if (tReverse == 1) {
			this.yReverseMatrix = new Matrix(1, 0, 0, -1, 0, 0);
			if (tRootBone) {
				tRootBone.setTempMatrix(this.yReverseMatrix);
			}
		} else {
			if (tRootBone) {
				tRootBone.setTempMatrix(new Matrix());
			}
		}
		this.showSkinByIndex(this.boneSlotDic, 0);
		this.isParserComplete = true;
		this.event(Event.COMPLETE, this);
	}

	/**
	 * 得到指定的纹理
	 * @param	name	纹理的名字
	 * @return
	 */
	getTexture(name: string): Texture {
		var tTexture: Texture = this.subTextureDic[name];
		if (!tTexture) {
			tTexture = this.subTextureDic[name.substr(0, name.length - 1)];
		}
		if (tTexture == null) {
			return this._mainTexture;
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
	showSkinByIndex(boneSlotDic: any, skinIndex: number, freshDisplayIndex: boolean = true): boolean {
		if (skinIndex < 0 && skinIndex >= this.skinDataArray.length) return false;
		var i: number, n: number;
		var tBoneSlot: BoneSlot;
		var tSlotData: SlotData;
		var tSkinData: SkinData = this.skinDataArray[skinIndex];
		if (tSkinData) {
			for (i = 0, n = tSkinData.slotArr.length; i < n; i++) {
				tSlotData = tSkinData.slotArr[i];
				if (tSlotData) {
					tBoneSlot = boneSlotDic[tSlotData.name];
					if (tBoneSlot) {
						tBoneSlot.showSlotData(tSlotData, freshDisplayIndex);
						if (freshDisplayIndex && tBoneSlot.attachmentName != "undefined" && tBoneSlot.attachmentName != "null") {
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
	getSkinIndexByName(skinName: string): number {
		var tSkinData: SkinData;
		for (var i: number = 0, n: number = this.skinDataArray.length; i < n; i++) {
			tSkinData = this.skinDataArray[i];
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
	getGrahicsDataWithCache(aniIndex: number, frameIndex: number): Graphics {
		if (this._graphicsCache[aniIndex] && this._graphicsCache[aniIndex][frameIndex]) {
			return this._graphicsCache[aniIndex][frameIndex];
		}
		//trace("getGrahicsDataWithCache fail:",aniIndex,frameIndex,this._path);
		return null;
	}

	/**
	 * @internal
	 * @override
	 */
	_setCreateURL(url: string): void {
		this._skBufferUrl =	this._relativeUrl = url;
		super._setCreateURL(url);
	}

	/**
	 * @private
	 * 保存缓冲grahpics
	 * @param	aniIndex	动画索引
	 * @param	frameIndex	帧索引
	 * @param	graphics	要保存的数据
	 */
	setGrahicsDataWithCache(aniIndex: number, frameIndex: number, graphics: Graphics): void {
		this._graphicsCache[aniIndex][frameIndex] = graphics;
	}

	deleteAniData(aniIndex: number): void {
		if (this._anis[aniIndex]) {
			var tAniDataO: AnimationContent = this._anis[aniIndex];
			tAniDataO.bone3DMap = null;
			tAniDataO.nodes = null;
		}
	}
	/**
	 * 释放纹理
	 * @override
	 */
	destroy(): void {
		this._isDestroyed = true;
		var tTexture: any;
		for (tTexture in this.subTextureDic) {
			if (tTexture) {
				this.subTextureDic[tTexture].destroy();
			}
		}
		for (tTexture in this._textureDic) {
			if (tTexture) {
				this._textureDic[tTexture].destroy();
			}
		}
		var tSkinSlotDisplayData: SkinSlotDisplayData;
		for (var i: number = 0, n: number = this.skinSlotDisplayDataArr.length; i < n; i++) {
			tSkinSlotDisplayData = this.skinSlotDisplayDataArr[i];
			tSkinSlotDisplayData.destory();
		}
		this.skinSlotDisplayDataArr.length = 0;
		if (this._relativeUrl) {
			delete Templet.TEMPLET_DICTIONARY[this._relativeUrl];
		}
		super.destroy();
		ILaya.loader.clearRes(this._skBufferUrl);
	}

	/***********************************下面为一些儿访问接口*****************************************/
	/**
	 * 通过索引得动画名称
	 * @param	index
	 * @return
	 */
	getAniNameByIndex(index: number): string {
		var tAni: any = this.getAnimation(index);
		if (tAni) return tAni.name;
		return null;
	}

	get rate(): number {
		return this._rate;
	}

	set rate(v: number) {
		this._rate = v;
	}
}

IAniLib.Templet = Templet;