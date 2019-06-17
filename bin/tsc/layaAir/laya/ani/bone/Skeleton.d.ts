import { Bone } from "././Bone";
import { BoneSlot } from "././BoneSlot";
import { AnimationPlayer } from "../AnimationPlayer";
import { GraphicsAni } from "../GraphicsAni";
import { Sprite } from "../../display/Sprite";
import { Handler } from "../../utils/Handler";
import { Texture } from "../../resource/Texture";
import { Templet } from "../../ani/bone/Templet";
/**动画开始播放调度
 * @eventType Event.PLAYED
 * */
/**动画停止播放调度
 * @eventType Event.STOPPED
 * */
/**动画暂停播放调度
 * @eventType Event.PAUSED
 * */
/**自定义事件。
 * @eventType Event.LABEL
 */
/**
 * 骨骼动画由<code>Templet</code>，<code>AnimationPlayer</code>，<code>Skeleton</code>三部分组成。
 */
export declare class Skeleton extends Sprite {
    /**
     * 在canvas模式是否使用简化版的mesh绘制，简化版的mesh将不进行三角形绘制，而改为矩形绘制，能极大提高性能，但是可能某些mesh动画效果会不太正常
     */
    static useSimpleMeshInCanvas: boolean;
    protected _templet: Templet;
    /** @private */
    protected _player: AnimationPlayer;
    /** @private */
    protected _curOriginalData: Float32Array;
    private _boneMatrixArray;
    private _lastTime;
    private _currAniName;
    private _currAniIndex;
    private _pause;
    /** @private */
    protected _aniClipIndex: number;
    /** @private */
    protected _clipIndex: number;
    private _skinIndex;
    private _skinName;
    private _aniMode;
    private _graphicsCache;
    private _boneSlotDic;
    private _bindBoneBoneSlotDic;
    private _boneSlotArray;
    private _index;
    private _total;
    private _indexControl;
    private _aniPath;
    private _texturePath;
    private _complete;
    private _loadAniMode;
    private _yReverseMatrix;
    private _ikArr;
    private _tfArr;
    private _pathDic;
    private _rootBone;
    /** @private */
    protected _boneList: Bone[];
    /** @private */
    protected _aniSectionDic: any;
    private _eventIndex;
    private _drawOrderIndex;
    private _drawOrder;
    private _lastAniClipIndex;
    private _lastUpdateAniClipIndex;
    private _playAudio;
    private _soundChannelArr;
    /**
     * 创建一个Skeleton对象
     *
     * @param	templet	骨骼动画模板
     * @param	aniMode	动画模式，0不支持换装，1、2支持换装
     */
    constructor(templet?: Templet, aniMode?: number);
    /**
     * 初始化动画
     * @param	templet		模板
     * @param	aniMode		动画模式
     * <table>
     * 	<tr><th>模式</th><th>描述</th></tr>
     * 	<tr>
     * 		<td>0</td> <td>使用模板缓冲的数据，模板缓冲的数据，不允许修改（内存开销小，计算开销小，不支持换装）</td>
     * 	</tr>
     * 	<tr>
     * 		<td>1</td> <td>使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存	（内存开销大，计算开销小，支持换装）</td>
     * 	</tr>
     * 	<tr>
     * 		<td>2</td> <td>使用动态方式，去实时去画（内存开销小，计算开销大，支持换装,不建议使用）</td>
     * </tr>
     * </table>
     */
    init(templet: Templet, aniMode?: number): void;
    /**
     * 得到资源的URL
     */
    /**
    * 设置动画路径
    */
    url: string;
    /**
     * 通过加载直接创建动画
     * @param	path		要加载的动画文件路径
     * @param	complete	加载完成的回调函数
     * @param	aniMode		与<code>Skeleton.init</code>的<code>aniMode</code>作用一致
     */
    load(path: string, complete?: Handler, aniMode?: number): void;
    /**
     * 加载完成
     */
    private _onLoaded;
    /**
     * 解析完成
     */
    private _parseComplete;
    /**
     * 解析失败
     */
    private _parseFail;
    /**
     * 传递PLAY事件
     */
    private _onPlay;
    /**
     * 传递STOP事件
     */
    private _onStop;
    /**
     * 传递PAUSE事件
     */
    private _onPause;
    /**
     * 创建骨骼的矩阵，保存每次计算的最终结果
     */
    private _parseSrcBoneMatrix;
    private _emitMissedEvents;
    /**
     * 更新动画
     * @param	autoKey true为正常更新，false为index手动更新
     */
    private _update;
    /**
     * @private
     * 清掉播放完成的音频
     * @param force 是否强制删掉所有的声音channel
     */
    private _onAniSoundStoped;
    /**
     * @private
     * 创建grahics图像. 并且保存到cache中
     * @param	_clipIndex 第几帧
     */
    protected _createGraphics(_clipIndex?: number): GraphicsAni;
    private _checkIsAllParsed;
    /**
     * 设置deform数据
     * @param	tDeformAniData
     * @param	tDeformDic
     * @param	_boneSlotArray
     * @param	curTime
     */
    private _setDeform;
    /*******************************************定义接口*************************************************/
    /**
     * 得到当前动画的数量
     * @return 当前动画的数量
     */
    getAnimNum(): number;
    /**
     * 得到指定动画的名字
     * @param	index	动画的索引
     */
    getAniNameByIndex(index: number): string;
    /**
     * 通过名字得到插槽的引用
     * @param	name	动画的名字
     * @return 插槽的引用
     */
    getSlotByName(name: string): BoneSlot;
    /**
     * 通过名字显示一套皮肤
     * @param	name	皮肤的名字
     * @param	freshSlotIndex	是否将插槽纹理重置到初始化状态
     */
    showSkinByName(name: string, freshSlotIndex?: boolean): void;
    /**
     * 通过索引显示一套皮肤
     * @param	skinIndex	皮肤索引
     * @param	freshSlotIndex	是否将插槽纹理重置到初始化状态
     */
    showSkinByIndex(skinIndex: number, freshSlotIndex?: boolean): void;
    /**
     * 设置某插槽的皮肤
     * @param	slotName	插槽名称
     * @param	index	插糟皮肤的索引
     */
    showSlotSkinByIndex(slotName: string, index: number): void;
    /**
     * 设置某插槽的皮肤
     * @param	slotName	插槽名称
     * @param	name	皮肤名称
     */
    showSlotSkinByName(slotName: string, name: string): void;
    /**
     * 替换插槽贴图名
     * @param	slotName 插槽名称
     * @param	oldName 要替换的贴图名
     * @param	newName 替换后的贴图名
     */
    replaceSlotSkinName(slotName: string, oldName: string, newName: string): void;
    /**
     * 替换插槽的贴图索引
     * @param	slotName 插槽名称
     * @param	oldIndex 要替换的索引
     * @param	newIndex 替换后的索引
     */
    replaceSlotSkinByIndex(slotName: string, oldIndex: number, newIndex: number): void;
    /**
     * 设置自定义皮肤
     * @param	name		插糟的名字
     * @param	texture		自定义的纹理
     */
    setSlotSkin(slotName: string, texture: Texture): void;
    /**
     * 换装的时候，需要清一下缓冲区
     */
    private _clearCache;
    /**
     * 播放动画
     *
     * @param	nameOrIndex	动画名字或者索引
     * @param	loop		是否循环播放
     * @param	force		false,如果要播的动画跟上一个相同就不生效,true,强制生效
     * @param	start		起始时间
     * @param	end			结束时间
     * @param	freshSkin	是否刷新皮肤数据
     * @param	playAudio	是否播放音频
     */
    play(nameOrIndex: any, loop: boolean, force?: boolean, start?: number, end?: number, freshSkin?: boolean, playAudio?: boolean): void;
    /**
     * 停止动画
     */
    stop(): void;
    /**
     * 设置动画播放速率
     * @param	value	1为标准速率
     */
    playbackRate(value: number): void;
    /**
     * 暂停动画的播放
     */
    paused(): void;
    /**
     * 恢复动画的播放
     */
    resume(): void;
    /**
     * @private
     * 得到缓冲数据
     * @param	aniIndex
     * @param	frameIndex
     * @return
     */
    private _getGrahicsDataWithCache;
    /**
     * @private
     * 保存缓冲grahpics
     * @param	aniIndex
     * @param	frameIndex
     * @param	graphics
     */
    private _setGrahicsDataWithCache;
    /**
     * 销毁当前动画
     */
    destroy(destroyChild?: boolean): void;
    /**
     * @private
     * 得到帧索引
     */
    /**
    * @private
    * 设置帧索引
    */
    index: number;
    /**
     * 得到总帧数据
     */
    readonly total: number;
    /**
     * 得到播放器的引用
     */
    readonly player: AnimationPlayer;
    /**
     * 得到动画模板的引用
     * @return templet.
     */
    readonly templet: Templet;
}
