import { Bone } from "././Bone";
import { AnimationTemplet } from "../AnimationTemplet";
import { SkinSlotDisplayData } from "./SkinSlotDisplayData";
import { Texture } from "../../resource/Texture";
import { Matrix } from "../../maths/Matrix";
import { Graphics } from "../../display/Graphics";
import { Skeleton } from "./Skeleton";
/**数据解析完成后的调度。
 * @eventType Event.COMPLETE
 * */
/**数据解析错误后的调度。
 * @eventType Event.ERROR
 * */
/**
 * 动画模板类
 */
export declare class Templet extends AnimationTemplet {
    /**@private */
    static LAYA_ANIMATION_160_VISION: string;
    static LAYA_ANIMATION_VISION: string;
    static TEMPLET_DICTIONARY: any;
    private _mainTexture;
    private _textureJson;
    private _graphicsCache;
    /** 存放原始骨骼信息 */
    srcBoneMatrixArr: any[];
    /** IK数据 */
    ikArr: any[];
    /** transform数据 */
    tfArr: any[];
    /** path数据 */
    pathArr: any[];
    /** 存放插槽数据的字典 */
    boneSlotDic: any;
    /** 绑定插槽数据的字典 */
    bindBoneBoneSlotDic: any;
    /** 存放插糟数据的数组 */
    boneSlotArray: any[];
    /** 皮肤数据 */
    skinDataArray: any[];
    /** 皮肤的字典数据 */
    skinDic: any;
    /** 存放纹理数据 */
    subTextureDic: any;
    /** 是否解析失败 */
    isParseFail: boolean;
    /** 反转矩阵，有些骨骼动画要反转才能显示 */
    yReverseMatrix: Matrix;
    /** 渲染顺序动画数据 */
    drawOrderAniArr: any[];
    /** 事件动画数据 */
    eventAniArr: any[];
    /** @private 索引对应的名称 */
    attachmentNames: any[];
    /** 顶点动画数据 */
    deformAniArr: any[];
    /** 实际显示对象列表，用于销毁用 */
    skinSlotDisplayDataArr: SkinSlotDisplayData[];
    /** 是否需要解析audio数据 */
    private _isParseAudio;
    private _isDestroyed;
    private _rate;
    isParserComplete: boolean;
    aniSectionDic: any;
    private _skBufferUrl;
    private _textureDic;
    private _loadList;
    private _path;
    private _relativeUrl;
    /**@private */
    tMatrixDataLen: number;
    mRootBone: Bone;
    mBoneArr: Bone[];
    loadAni(url: string): void;
    private onComplete;
    /**
     * 解析骨骼动画数据
     * @param	texture			骨骼动画用到的纹理
     * @param	skeletonData	骨骼动画信息及纹理分块信息
     * @param	playbackRate	缓冲的帧率数据（会根据帧率去分帧）
     */
    parseData(texture: Texture, skeletonData: ArrayBuffer, playbackRate?: number): void;
    /**
     * 创建动画
     * 0,使用模板缓冲的数据，模板缓冲的数据，不允许修改					（内存开销小，计算开销小，不支持换装）
     * 1,使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存	（内存开销大，计算开销小，支持换装）
     * 2,使用动态方式，去实时去画										（内存开销小，计算开销大，支持换装,不建议使用）
     * @param	aniMode 0	动画模式，0:不支持换装,1,2支持换装
     * @return
     */
    buildArmature(aniMode?: number): Skeleton;
    /**
     * @private
     * 解析动画
     * @param	data			解析的二进制数据
     * @param	playbackRate	帧率
     */
    parse(data: ArrayBuffer): void;
    private _parseTexturePath;
    /**
     * 纹理加载完成
     */
    private _textureComplete;
    /**
     * 解析自定义数据
     */
    private _parsePublicExtData;
    /**
     * 得到指定的纹理
     * @param	name	纹理的名字
     * @return
     */
    getTexture(name: string): Texture;
    /**
     * @private
     * 显示指定的皮肤
     * @param	boneSlotDic	插糟字典的引用
     * @param	skinIndex	皮肤的索引
     * @param	freshDisplayIndex	是否重置插槽纹理
     */
    showSkinByIndex(boneSlotDic: any, skinIndex: number, freshDisplayIndex?: boolean): boolean;
    /**
     * 通过皮肤名字得到皮肤索引
     * @param	skinName 皮肤名称
     * @return
     */
    getSkinIndexByName(skinName: string): number;
    /**
     * @private
     * 得到缓冲数据
     * @param	aniIndex	动画索引
     * @param	frameIndex	帧索引
     * @return
     */
    getGrahicsDataWithCache(aniIndex: number, frameIndex: number): Graphics;
    _setCreateURL(url: string): void;
    /**
     * @private
     * 保存缓冲grahpics
     * @param	aniIndex	动画索引
     * @param	frameIndex	帧索引
     * @param	graphics	要保存的数据
     */
    setGrahicsDataWithCache(aniIndex: number, frameIndex: number, graphics: Graphics): void;
    deleteAniData(aniIndex: number): void;
    /**
     * 释放纹理
     */
    destroy(): void;
    /***********************************下面为一些儿访问接口*****************************************/
    /**
     * 通过索引得动画名称
     * @param	index
     * @return
     */
    getAniNameByIndex(index: number): string;
    rate: number;
}
