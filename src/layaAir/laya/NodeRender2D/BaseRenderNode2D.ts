import { IRenderContext2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData, ShaderDataType } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { Component } from "../components/Component";
import { Scene } from "../display/Scene";
import { Sprite } from "../display/Sprite";
import { LayaGL } from "../layagl/LayaGL";
import { Vector2 } from "../maths/Vector2";
import { Vector4 } from "../maths/Vector4";
import { Context } from "../renders/Context";
import { Material } from "../resource/Material";

export enum BaseRender2DType {
    baseRenderNode = 0,
    spine = 1,
    particle = 2,
    spineSimple = 3
}

export enum Render2DOrderMode {
    elementIndex,
    ysort
}

/**
 * 2D 渲染基类
 */
export class BaseRenderNode2D extends Component {
    /**@internal */
    private static _uniqueIDCounter: number = 0;

    /**
     * 渲染矩阵第一个vector3属性ID
     */
    static NMATRIX_0: number;
    /**
     * 渲染矩阵第二个vector3属性ID
     */
    static NMATRIX_1: number;
    /**
     * 渲染节点颜色ID
     */
    static BASERENDER2DCOLOR: number;
    /**
     * 渲染节点纹理ID
     */
    static BASERENDER2DTEXTURE: number;
    /**
     * 渲染节点size ID
     */
    static BASERENDERSIZE: number;

    /**
     * 2D渲染节点宏
     */
    static SHADERDEFINE_BASERENDER2D: ShaderDefine;

    /**
     * 2D灯光宏
     */
    static SHADERDEFINE_LIGHTANDSHADOW: ShaderDefine;

    /**
     * @internal
     */
    static initBaseRender2DCommandEncoder() {
        BaseRenderNode2D.NMATRIX_0 = Shader3D.propertyNameToID("u_NMatrix_0");
        BaseRenderNode2D.NMATRIX_1 = Shader3D.propertyNameToID("u_NMatrix_1");
        BaseRenderNode2D.BASERENDER2DCOLOR = Shader3D.propertyNameToID("u_baseRenderColor");
        BaseRenderNode2D.BASERENDER2DTEXTURE = Shader3D.propertyNameToID("u_baseRender2DTexture")
        BaseRenderNode2D.BASERENDERSIZE = Shader3D.propertyNameToID("u_baseRenderSize2D");

        BaseRenderNode2D.SHADERDEFINE_BASERENDER2D = Shader3D.getDefineByName("BASERENDER2D");
        BaseRenderNode2D.SHADERDEFINE_LIGHTANDSHADOW = Shader3D.getDefineByName("LIGHT_AND_SHADOW");

        const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("BaseRender2D");
        commandUniform.addShaderUniform(BaseRenderNode2D.NMATRIX_0, "u_NMatrix_0", ShaderDataType.Vector3);
        commandUniform.addShaderUniform(BaseRenderNode2D.NMATRIX_1, "u_NMatrix_1", ShaderDataType.Vector3);
        commandUniform.addShaderUniform(BaseRenderNode2D.BASERENDER2DCOLOR, "u_baseRenderColor", ShaderDataType.Color);
        commandUniform.addShaderUniform(BaseRenderNode2D.BASERENDER2DTEXTURE, "u_baseRender2DTexture", ShaderDataType.Texture2D);
        commandUniform.addShaderUniform(BaseRenderNode2D.BASERENDERSIZE, "u_baseRenderSize2D", ShaderDataType.Vector2);
    }

    /**
    * @internal
    */
    static _setRenderElement2DMaterial(element: IRenderElement2D, material: Material) {
        element.subShader = material._shader.getSubShaderAt(0);
        //element.materialId = material.id;
        element.materialShaderData = material._shaderValues;
    }

    /**
     * @internal
     * 渲染节点 
     */
    _renderElements: IRenderElement2D[];

    /**
     * @internal
     * 材质集
     */
    _materials: Material[];

    /**
     * @internal
     * 渲染类型
     */
    _renderType: BaseRender2DType = BaseRender2DType.baseRenderNode;

    /**
     * @internal
     * 帧循环标记
     */
    _renderUpdateMask: number = 0;

    /**
     * @internal
     * sprite ShaderData,可以为null
     */
    _spriteShaderData: ShaderData;

    /**
     * @internal
     * 唯一ID
     */
    private _renderid: number;

    /**
     * @internal
     * 渲染标签位,用于渲染分层
     * render flag layer bit
     */
    private _layer: number = 0;

    /**
     * @internal
     * 节点内的渲染排序模式
     */
    private _ordingMode: Render2DOrderMode;

    /**
     * @internal
     * 渲染目标大小
     */
    private _rtsize: Vector2 = new Vector2();

    protected _lightReceive: boolean = false;

    /**
     * 基于不同BaseRender的uniform集合
     * @internal
     */
    protected _getcommonUniformMap(): Array<string> {
        return ["BaseRender2D"];
    }

    /**
     * @internal
     * @returns 
     */
    protected _getRect(): Vector4 {
        return null;//get sprite ?
    }

    protected _transformChange() {
        //TODO
    }

    /**
     * @internal
     */
    private _changeMaterialReference(lastValue: Material, value: Material): void {
        (lastValue) && (lastValue._removeReference());
        (value) && (value._addReference());//TODO:value可以为空
    }

    /**
     * @override
     */
    _setRenderSize(x: number, y: number) {
        if (x == this._rtsize.x && y == this._rtsize.y)
            return;
        this._rtsize.setValue(x, y);
        this._spriteShaderData.setVector2(BaseRenderNode2D.BASERENDERSIZE, this._rtsize);
    }

    constructor() {
        super();
        this._renderid = BaseRenderNode2D._uniqueIDCounter++;
        this._spriteShaderData = LayaGL.renderDeviceFactory.createShaderData(null);
        this._renderType = BaseRender2DType.baseRenderNode;
        this._ordingMode = Render2DOrderMode.elementIndex;
        //this._layer = 1; ?
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
            (this.owner as Sprite).renderNode2D = this;
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
        super._onDisable();
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

    /**
     * @en render layer
     * @zh 渲染层。
     */
    get layer(): number {
        return this._layer;
    }

    set layer(value: number) {
        if (this._layer !== value) {
            if (value >= 0 && value <= 30) {
                if (this._layer != value) {
                    this._layer = value;
                    this._changeLayer();
                }
            } else {
                throw new Error("Layer value must be 0-30.");
            }
        }
    }

    set lightReceive(value: boolean) {
        if (value === this._lightReceive)
            return;
        this._lightReceive = value;
        if (value)
            this._spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHTANDSHADOW);
        else this._spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHTANDSHADOW);
    }

    get lightReceive() {
        return this._lightReceive;
    }

    _lightUpdateMask: number;
    _changeLayer() {
        this._lightUpdateMask = 0;
    }

    _updateLight() {
        if (!this.lightReceive || !this.owner.scene) return;
        const lightRP = (this.owner.scene as Scene)._light2DManager;
        const updateMask = lightRP._getLayerUpdateMask(this._layer);
        if (this._lightUpdateMask != lightRP._getLayerUpdateMask(this._layer)) {
            lightRP._updateShaderDataByLayer(this._layer, this._spriteShaderData);
            this._lightUpdateMask = updateMask;
        }
    }

    /**
     * @en get first Material
     * @zh 第一个材质。
     */
    get sharedMaterial(): Material {
        return this._materials[0];
    }

    set sharedMaterial(value: Material) {
        const lastValue: Material = this._materials[0];
        if (lastValue !== value) {
            this._materials[0] = value;
            this._changeMaterialReference(lastValue, value);
            this._renderElements[0] && BaseRenderNode2D._setRenderElement2DMaterial(this._renderElements[0], value);
        }
    }

    /**
     * @en Get 2D render component ID
     * @zh 获得2D渲染组件标识ID
     * @returns 获得ID
     */
    getRenderID() {
        return this._renderid;
    }

    /**
     * @internal
     */
    clear(): void {
        this._renderElements.length = 0;
    }
}