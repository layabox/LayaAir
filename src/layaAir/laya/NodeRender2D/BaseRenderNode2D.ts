import { IRenderContext2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Component } from "../components/Component";
import { Sprite } from "../display/Sprite";
import { LayaGL } from "../layagl/LayaGL";
import { Vector4 } from "../maths/Vector4";
import { Context } from "../renders/Context";
import { Material } from "../resource/Material";

export enum BaseRender2DType {
    baseRenderNode = 0,
    spine = 1,
    particle = 2
}

export enum Render2DOrderMode {
    elementIndex,
    ysort
}

export class BaseRenderNode2D extends Component {
    /**@internal */
    private static _uniqueIDCounter: number = 0;
    /**
     * @internal
     * 渲染节点 
     */
    _renderElements: IRenderElement2D[];

    /**
     * 材质集
     */
    _materials: Material[];

    /**
     * 渲染类型
     */
    _renderType: BaseRender2DType = BaseRender2DType.baseRenderNode;

    /**
     * 帧循环标记
     */
    _renderUpdateMask: number = 0;

    /**
     * sprite ShaderData,可以为null
     */
    _spriteShaderData: ShaderData;



    /**
     * 唯一ID
     */
    private _renderid: number;

    /**
     * @internal
     * 渲染标签位
     * render flag layer bit
     */
    private _layer: number = 0;


    /**
     * 节点内的渲染排序模式
     */
    private _ordingMode: Render2DOrderMode;

    /**
     * 基于不同BaseRender的uniform集合
     * @internal
     */
    protected _getcommonUniformMap(): Array<string> {
        return ["sprite2D"];
    }

    /**
     * @internal
     * @returns 
     */
    protected _getRect(): Vector4 {
        return null;//get sprite ?
    }

    protected _transformChange() {

    }

    /**
   * 返回第一个材质。
   */
    get sharedMaterial(): Material {
        return this._materials[0];
    }

    set sharedMaterial(value: Material) {
        var lastValue: Material = this._materials[0];
        if (lastValue !== value) {
            this._materials[0] = value;
            this._changeMaterialReference(lastValue, value);
            this._renderElements[0] && this._setRenderElement2DMaterial(this._renderElements[0], value);
        }
    }

    private _setRenderElement2DMaterial(element: IRenderElement2D, material: Material) {
        element.subShader = material._shader.getSubShaderAt(0);
        //element.materialId = material.id;
        element.materialShaderData = material._shaderValues;
    }

    /**
     * @internal
     */
    private _changeMaterialReference(lastValue: Material, value: Material): void {
        (lastValue) && (lastValue._removeReference());
        (value) && (value._addReference());//TODO:value可以为空
    }

    constructor() {
        super();
        this._renderid = BaseRenderNode2D._uniqueIDCounter++;
        this._spriteShaderData = LayaGL.renderDeviceFactory.createShaderData(null);
        this._renderType = BaseRender2DType.baseRenderNode;
        this._ordingMode = Render2DOrderMode.elementIndex;
        this._layer = 1;
    }

    /**
     * cmd run时调用，可以用来计算matrix等获得即时context属性
     * @param context 
     * @param px 
     * @param py 
     */
    addCMDCall?(context: Context, px: number, py: number): void;

    /**
     * 帧更新，可以放一些顶点更新，数据计算等
     * @protected
     * @param context 
     */
    renderUpdate?(context: IRenderContext2D): void;

    /**
     * 渲染前更新，准备所需的渲染数据
     * @param context 
     */
    preRenderUpdate?(context: IRenderContext2D): void;

    /**
     * @internal
     * @protected
     */
    protected _onEnable(): void {
        super._onEnable();
        if (this.owner) {
            (this.owner as Sprite).renderNode2D = this;;
        }
    }

    /**
     * @internal
     * @protected
     */
    protected _onDisable(): void {
        if (this.owner) {
            (this.owner as Sprite).renderNode2D = null;
        }
    }

    /**
     * override it
     * @internal
     */
    protected _onDestroy() {
        for (var i = 0, n = this._materials.length; i < n; i++) {
            let m = this._materials[i];
            m && !m.destroyed && m._removeReference();
        }
        this._spriteShaderData.destroy();
        this.owner = null;
    }

    clear(): void {
        this._renderElements.length = 0;

    }


}