import { Templet } from "./Templet";
import { SlotData } from "./SlotData";
import { SkinSlotDisplayData } from "./SkinSlotDisplayData";
import { GraphicsAni } from "../GraphicsAni";
import { Matrix } from "../../maths/Matrix";
import { Graphics } from "../../display/Graphics";
import { Texture } from "../../resource/Texture";
export declare class BoneSlot {
    /** 插槽名称 */
    name: string;
    /** 插槽绑定的骨骼名称 */
    parent: string;
    /** 插糟显示数据数据的名称 */
    attachmentName: string;
    /** 原始数据的索引 */
    srcDisplayIndex: number;
    /** 判断对象是否是原对象 */
    type: string;
    /** 模板的指针 */
    templet: Templet;
    /** 当前插槽对应的数据 */
    currSlotData: SlotData;
    /** 当前插槽显示的纹理 */
    currTexture: Texture;
    /** 显示对象对应的数据 */
    currDisplayData: SkinSlotDisplayData;
    /** 显示皮肤的索引 */
    displayIndex: number;
    /** @private */
    originalIndex: number;
    /** 用户自定义的皮肤 */
    private _diyTexture;
    private _parentMatrix;
    private _resultMatrix;
    /** 索引替换表 */
    private _replaceDic;
    /** 当前diyTexture的动画纹理 */
    private _curDiyUV;
    /** 实时模式下，复用使用 */
    private _skinSprite;
    /** @private 变形动画数据 */
    deformData: any[];
    /**
     * 设置要显示的插槽数据
     * @param	slotData
     * @param	disIndex
     * @param	freshIndex 是否重置纹理
     */
    showSlotData(slotData: SlotData, freshIndex?: boolean): void;
    /**
     * 通过名字显示指定对象
     * @param	name
     */
    showDisplayByName(name: string): void;
    /**
     * 替换贴图名
     * @param	tarName 要替换的贴图名
     * @param	newName 替换后的贴图名
     */
    replaceDisplayByName(tarName: string, newName: string): void;
    /**
     * 替换贴图索引
     * @param	tarIndex 要替换的索引
     * @param	newIndex 替换后的索引
     */
    replaceDisplayByIndex(tarIndex: number, newIndex: number): void;
    /**
     * 指定显示对象
     * @param	index
     */
    showDisplayByIndex(index: number): void;
    /**
     * 替换皮肤
     * @param	_texture
     */
    replaceSkin(_texture: Texture): void;
    /**
     * 保存父矩阵的索引
     * @param	parentMatrix
     */
    setParentMatrix(parentMatrix: Matrix): void;
    private _mVerticleArr;
    private static _tempMatrix;
    static createSkinMesh(): any;
    private static isSameArr;
    private static _tempResultMatrix;
    private _preGraphicVerticle;
    private getSaveVerticle;
    static isSameMatrix(mtA: Matrix, mtB: Matrix): boolean;
    private _preGraphicMatrix;
    private static useSameMatrixAndVerticle;
    private getSaveMatrix;
    /**
     * 把纹理画到Graphics上
     * @param	graphics
     * @param	noUseSave   不使用共享的矩阵对象 _tempResultMatrix，只有实时计算的时候才设置为true
     */
    draw(graphics: GraphicsAni, boneMatrixArray: any[], noUseSave?: boolean, alpha?: number): void;
    private static _tempVerticleArr;
    /**
     * 显示蒙皮动画
     * @param	boneMatrixArray 当前帧的骨骼矩阵
     */
    private skinMesh;
    /**
     * 画骨骼的起始点，方便调试
     * @param	graphics
     */
    drawBonePoint(graphics: Graphics): void;
    /**
     * 得到显示对象的矩阵
     * @return
     */
    private getDisplayMatrix;
    /**
     * 得到插糟的矩阵
     * @return
     */
    getMatrix(): Matrix;
    /**
     * 用原始数据拷贝出一个
     * @return
     */
    copy(): BoneSlot;
}
