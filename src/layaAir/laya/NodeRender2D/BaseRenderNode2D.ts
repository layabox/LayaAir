import { Const } from "../Const";
import { IRenderContext2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData, ShaderDataType } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { Component } from "../components/Component";
import { Sprite } from "../display/Sprite";
import { LayaGL } from "../layagl/LayaGL";
import { Vector2 } from "../maths/Vector2";
import { Vector4 } from "../maths/Vector4";
import { Context } from "../renders/Context";
import { Material } from "../resource/Material";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";

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
     * 渲染节点纹理范围ID
     */
    static BASERENDER2DTEXTURERANGE: number;
    /**
     * 渲染节点size ID
     */
    static BASERENDERSIZE: number;

    /**
     * 渲染节点纹理ID
     */
    static NORMAL2DTEXTURE: number;
    static NORMAL2DSTRENGTH: number;

    /**
     * 2D渲染节点宏
     */
    static SHADERDEFINE_BASERENDER2D: ShaderDefine;

    /**
     * 2D灯光宏
     */
    static SHADERDEFINE_LIGHT2D_ENABLE: ShaderDefine;
    static SHADERDEFINE_LIGHT2D_EMPTY: ShaderDefine;
    static SHADERDEFINE_LIGHT2D_ADDMODE: ShaderDefine;
    static SHADERDEFINE_LIGHT2D_SUBMODE: ShaderDefine;
    static SHADERDEFINE_LIGHT2D_NORMAL_PARAM: ShaderDefine;
    static SHADERDEFINE_CLIPMODE: ShaderDefine;

    /**
     * @internal
     */
    static initBaseRender2DCommandEncoder() {
        BaseRenderNode2D.NMATRIX_0 = Shader3D.propertyNameToID("u_NMatrix_0");
        BaseRenderNode2D.NMATRIX_1 = Shader3D.propertyNameToID("u_NMatrix_1");
        BaseRenderNode2D.BASERENDER2DCOLOR = Shader3D.propertyNameToID("u_baseRenderColor");
        BaseRenderNode2D.BASERENDER2DTEXTURE = Shader3D.propertyNameToID("u_baseRender2DTexture");
        BaseRenderNode2D.BASERENDER2DTEXTURERANGE = Shader3D.propertyNameToID("u_baseRender2DTextureRange");
        BaseRenderNode2D.BASERENDERSIZE = Shader3D.propertyNameToID("u_baseRenderSize2D");

        BaseRenderNode2D.NORMAL2DTEXTURE = Shader3D.propertyNameToID("u_normal2DTexture");
        BaseRenderNode2D.NORMAL2DSTRENGTH = Shader3D.propertyNameToID("u_normal2DStrength");

        BaseRenderNode2D.SHADERDEFINE_BASERENDER2D = Shader3D.getDefineByName("BASERENDER2D");
        BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE = Shader3D.getDefineByName("LIGHT2D_ENABLE");
        BaseRenderNode2D.SHADERDEFINE_LIGHT2D_EMPTY = Shader3D.getDefineByName("LIGHT2D_EMPTY");
        BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ADDMODE = Shader3D.getDefineByName("LIGHT2D_SCENEMODE_ADD");
        BaseRenderNode2D.SHADERDEFINE_LIGHT2D_SUBMODE = Shader3D.getDefineByName("LIGHT2D_SCENEMODE_SUB");
        BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM = Shader3D.getDefineByName("LIGHT2D_NORMAL_PARAM");
        BaseRenderNode2D.SHADERDEFINE_CLIPMODE = Shader3D.getDefineByName("CLIPMODE");
        const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("BaseRender2D");
        commandUniform.addShaderUniform(BaseRenderNode2D.NMATRIX_0, "u_NMatrix_0", ShaderDataType.Vector3);
        commandUniform.addShaderUniform(BaseRenderNode2D.NMATRIX_1, "u_NMatrix_1", ShaderDataType.Vector3);
        commandUniform.addShaderUniform(BaseRenderNode2D.BASERENDER2DCOLOR, "u_baseRenderColor", ShaderDataType.Color);
        commandUniform.addShaderUniform(BaseRenderNode2D.BASERENDER2DTEXTURE, "u_baseRender2DTexture", ShaderDataType.Texture2D);
        commandUniform.addShaderUniform(BaseRenderNode2D.BASERENDER2DTEXTURERANGE, "u_baseRender2DTextureRange", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(BaseRenderNode2D.BASERENDERSIZE, "u_baseRenderSize2D", ShaderDataType.Vector2);
        commandUniform.addShaderUniform(BaseRenderNode2D.NORMAL2DTEXTURE, "u_normal2DTexture", ShaderDataType.Texture2D);
        commandUniform.addShaderUniform(BaseRenderNode2D.NORMAL2DSTRENGTH, "u_normal2DStrength", ShaderDataType.Float);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_CLIPMATDIR, "u_clipMatDir", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_CLIPMATPOS, "u_clipMatPos", ShaderDataType.Vector2);
        //兼容 COlOLR FILTER
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_COLORALPHA, "u_colorAlpha", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_COLORMAT, "u_colorMat", ShaderDataType.Matrix4x4);
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
     * 唯一ID
     */
    private _renderid: number;

    /**
     * 渲染标签位,用于渲染分层
     */
    private _layer: number = 0;

    /**
     * 节点内的渲染排序模式
     */
    private _ordingMode: Render2DOrderMode;

    /**
     * 渲染目标大小
     */
    private _rtsize: Vector2 = new Vector2();

    protected _lightReceive: boolean = false;

    /**
     * @internal Light params
     */
    _lightUpdateMark: number = 0;
    /**
     *@internal Light params 
     *render是否已经记录在manager中，避免重复记录
     */
    _lightRecord: boolean = false;

    declare owner: Sprite;

    /**
     * 基于不同BaseRender的uniform集合
     */
    protected _getcommonUniformMap(): Array<string> {
        return ["BaseRender2D"];
    }
    protected _getRect(): Vector4 {
        return null;//get sprite ?
    }

    protected _transformChange() {
        //TODO
    }

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

    /**@ignore */
    constructor() {
        super();
        this._renderid = BaseRenderNode2D._uniqueIDCounter++;
        this._spriteShaderData = LayaGL.renderDeviceFactory.createShaderData(null);
        this._spriteShaderData.setVector(ShaderDefines2D.UNIFORM_CLIPMATDIR, new Vector4(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE));
        this._renderType = BaseRender2DType.baseRenderNode;
        this._ordingMode = Render2DOrderMode.elementIndex;
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

    protected _onEnable(): void {
        super._onEnable();

        this.owner.renderNode2D = this;
        if (this._lightReceive)
            this._addRenderToLightManager();
    }

    protected _onDisable(): void {
        this.owner.renderNode2D = null;
        if (this._lightReceive)
            this._removeRenderFromLightManager();

        super._onDisable();
    }

    /**
     * override it
     */
    protected _onDestroy() {
        for (var i = 0, n = this._materials.length; i < n; i++) {
            let m = this._materials[i];
            m && !m.destroyed && m._removeReference();
        }
        this._spriteShaderData.destroy();
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
                this._removeRenderFromLightManager();
                this._layer = value;
                this._addRenderToLightManager();
                this._resetUpdateMark();
            } else {
                throw new Error("Layer value must be 0-30.");
            }
        }
    }

    set lightReceive(value: boolean) {
        if (value === this._lightReceive)
            return;
        this._lightReceive = value;
        if (value) {
            this._addRenderToLightManager();
            this._spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        } else {
            this._removeRenderFromLightManager();
            this._spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        }
        this._resetUpdateMark();
    }

    get lightReceive() {
        return this._lightReceive;
    }

    _resetUpdateMark() {
        this._lightUpdateMark = 0;
    }

    _updateLight() {
        if (!this.lightReceive || !this.owner.scene || !this.owner.scene._light2DManager) return;
        const light2DManager = this.owner.scene._light2DManager;
        const updateMark = light2DManager._getLayerUpdateMark(this.layer);
        if (this._lightUpdateMark !== updateMark) {
            this._lightUpdateMark = updateMark;
            light2DManager._updateShaderDataByLayer(this.layer, this._spriteShaderData);
        }
    }

    /**
     * light Manager
     */
    private _addRenderToLightManager() {
        if (this.owner.scene) {
            let light2DManager = this.owner.scene._light2DManager;
            if (light2DManager && !this._lightRecord) {
                light2DManager.addRender(this);
                this._lightRecord = true;
            }
        }
    }

    /**
     * lightManager
     */
    private _removeRenderFromLightManager() {
        if (this.owner.scene) {
            const light2DManager = this.owner.scene._light2DManager;
            if (light2DManager && this._lightRecord) {
                light2DManager.removeRender(this);
                this._lightRecord = false;
            }
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