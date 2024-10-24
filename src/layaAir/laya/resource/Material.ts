import { Config } from "../../Config";
import { Config3D } from "../../Config3D";
import { ILaya } from "../../ILaya";
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { UniformBufferObject } from "../RenderEngine/UniformBufferObject";
import { LayaGL } from "../layagl/LayaGL";
import { Color } from "../maths/Color";
import { Matrix3x3 } from "../maths/Matrix3x3";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { Loader } from "../net/Loader";
import { Handler } from "../utils/Handler";
import { IClone } from "../utils/IClone";
import { BaseTexture } from "./BaseTexture";
import { Resource } from "./Resource";
import { Event } from "../events/Event";
import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { ShaderData, ShaderDataDefaultValue, ShaderDataItem, ShaderDataType } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../RenderDriver/RenderModuleData/Design/RenderState";
import { IDefineDatas } from "../RenderDriver/RenderModuleData/Design/IDefineDatas";
import { IRenderElement3D } from "../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";


/**
 * @en The material render mode.
 * @zh 材质渲染模式。
 */
export enum MaterialRenderMode {
    /**
     * @en RenderMode: Opaque
     * @zh 渲染状态：不透明。
     */
    RENDERMODE_OPAQUE,
    /**
     * @en RenderMode: Alpha Testing
     * @zh 渲染状态：阿尔法测试。
     */
    RENDERMODE_CUTOUT,
    /**
     * @en RenderMode: Transparent
     * @zh 渲染状态：透明。
     */
    RENDERMODE_TRANSPARENT,
    /**
     * @en RenderMode: additive mixing
     * @zh 渲染状态：加色法混合。
     */
    RENDERMODE_ADDTIVE,
    /**
     * @en RenderMode: Alpha Blending mixture
     * @zh 渲染状态：透明混合。
     */
    RENDERMODE_ALPHABLENDED,
    /**
     * @en RenderMode: Custom
     * @zh 渲染状态：自定义 
     */
    RENDERMODE_CUSTOME
}

/**
 * @en The Material class is used to create materials.
 * @zh Material 类用于创建材质。
 */
export class Material extends Resource implements IClone {
    /** 
     * @en RenderQueue: Opaque
     * @zh 渲染队列：不透明。
     */
    static RENDERQUEUE_OPAQUE: number = 2000;
    /** 
     * @en RenderQueue: Alpha Testing
     * @zh 渲染队列：阿尔法测试。
     */
    static RENDERQUEUE_ALPHATEST: number = 2450;
    /** 
     * @en RenderQueue: Transparent
     * @zh 渲染队列：透明。
     */
    static RENDERQUEUE_TRANSPARENT: number = 3000;

    /**
     * @en Shader variables, transparent test values.
     * @zh 着色器变量,透明测试值。
     */
    static ALPHATESTVALUE: number;

    /**
     * @en Material grade shader macro definition, transparency testing.
     * @zh 材质级着色器宏定义,透明测试。
     */
    static SHADERDEFINE_ALPHATEST: ShaderDefine;
    /**
     * @en Material grade shader macro definition, main texture.
     * @zh 材质级着色器宏定义,主贴图。
     */
    static SHADERDEFINE_MAINTEXTURE: ShaderDefine;
    /**
     * @en Material grade shader macro definition, additive fog.
     * @zh 材质级着色器宏定义,叠加雾效。
     */
    static SHADERDEFINE_ADDTIVEFOG: ShaderDefine;

    /**
     * @en Loads a material from a URL.
     * @param url The URL from which to load the material.
     * @param complete A callback function that is called when the material has been loaded.
     * @zh 从URL加载材质。
     * @param url 材质的URL。
     * @param complete 加载完成后的回调函数。
     */
    static load(url: string, complete: Handler): void {
        ILaya.loader.load(url, complete, null, Loader.MATERIAL);
    }

    /**
     * @internal
     */
    static __initDefine__(): void {
        Material.SHADERDEFINE_ALPHATEST = Shader3D.getDefineByName("ALPHATEST");
        Material.SHADERDEFINE_MAINTEXTURE = Shader3D.getDefineByName("MAINTEXTURE");
        Material.SHADERDEFINE_ADDTIVEFOG = Shader3D.getDefineByName("ADDTIVEFOG");
        Material.ALPHATESTVALUE = Shader3D.propertyNameToID("u_AlphaTestValue");
        Shader3D.CULL = Shader3D.propertyNameToID("s_Cull");
        Shader3D.BLEND = Shader3D.propertyNameToID("s_Blend");
        Shader3D.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
        Shader3D.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
        Shader3D.BLEND_SRC_RGB = Shader3D.propertyNameToID("s_BlendSrcRGB");
        Shader3D.BLEND_DST_RGB = Shader3D.propertyNameToID("s_BlendDstRGB");
        Shader3D.BLEND_SRC_ALPHA = Shader3D.propertyNameToID("s_BlendSrcAlpha");
        Shader3D.BLEND_DST_ALPHA = Shader3D.propertyNameToID("s_BlendDstAlpha");
        Shader3D.BLEND_EQUATION = Shader3D.propertyNameToID("s_BlendEquation");
        Shader3D.BLEND_EQUATION_RGB = Shader3D.propertyNameToID("s_BlendEquationRGB");
        Shader3D.BLEND_EQUATION_ALPHA = Shader3D.propertyNameToID("s_BlendEquationAlpha");
        Shader3D.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
        Shader3D.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
        Shader3D.STENCIL_Ref = Shader3D.propertyNameToID("s_StencilRef");
        Shader3D.STENCIL_TEST = Shader3D.propertyNameToID("s_StencilTest");
        Shader3D.STENCIL_WRITE = Shader3D.propertyNameToID("s_StencilWrite");
        Shader3D.STENCIL_Op = Shader3D.propertyNameToID("s_StencilOp");
    }

    private _matRenderNode: MaterialRenderMode;
    /** @internal */
    _shader: Shader3D;
    /** @internal */
    _shaderValues: ShaderData | null;//TODO:剥离贴图ShaderValue
    private _renderQueue: number;
    /** 
     * @en The rendering queue of the material.
     * @zh 所属渲染队列.
     */
    public get renderQueue(): number {
        return this._renderQueue;
    }
    public set renderQueue(value: number) {
        this._renderQueue = value;
        this._notifyOwnerElements();
    }

    /**
     * @en Owner element.
     * @zh 所属元素
     */
    ownerElements: Set<IRenderElement3D> = new Set();

    /**
     * @internal
     * @param element 
     */
    _setOwnerElement(element: IRenderElement3D) {
        this.ownerElements.add(element);
        element.materialShaderData = this.shaderData;
        element.materialRenderQueue = this.renderQueue;
        element.subShader = this._shader.getSubShaderAt(0);
        element.materialId = this.id;
    }

    /**
     * @internal
     * @param element 
     */
    _removeOwnerElement(element: IRenderElement3D) {
        this.ownerElements.delete(element);
    }

    /**
     * @internal
     * 通知 owner element 材质数据发生改变
     */
    _notifyOwnerElements() {
        this.ownerElements.forEach(element => {
            this._setOwnerElement(element);
        });
    }

    /**
     * @en The shader data.
     * @zh 着色器数据。
     */
    get shaderData(): ShaderData {
        return this._shaderValues;
    }

    /**
     * @en The alpha test value used for the alpha test mode of the material.
     * @zh 材质用于透明测试模式的透明测试值。
     */
    get alphaTestValue(): number {
        return this._shaderValues.getNumber(Material.ALPHATESTVALUE);
    }

    set alphaTestValue(value: number) {
        this._shaderValues.setNumber(Material.ALPHATESTVALUE, value);
    }

    /**
     * @en Whether the material uses alpha cut mode.
     * @zh 材质是否使用透明裁剪模式。
     */
    get alphaTest(): boolean {
        return this.shaderData.hasDefine(Material.SHADERDEFINE_ALPHATEST);
    }

    set alphaTest(value: boolean) {
        if (value)
            this._shaderValues.addDefine(Material.SHADERDEFINE_ALPHATEST);
        else
            this._shaderValues.removeDefine(Material.SHADERDEFINE_ALPHATEST);
    }

    /**
     * @en Adds a shader define to the material's shader data.
     * @param define The shader define to add.
     * @zh 向材质的着色器数据添加着色器宏定义。
     * @param define 要添加的着色器宏定义。
     */
    addDefine(define: ShaderDefine): void {
        this._shaderValues.addDefine(define);
    }

    /**
     * @en Removes a shader define from the material's shader data.
     * @param define The shader define to remove.
     * @zh 从材质的着色器数据移除着色器宏定义。
     * @param define 要移除的着色器宏定义。
     */
    removeDefine(define: ShaderDefine): void {
        this._shaderValues.removeDefine(define);
    }

    /**
     * @en Enables or disables a shader define.
     * @param define The shader define to enable or disable.
     * @param value true to add the define, false to remove it.
     * @zh 开启或关闭着色器宏定义。
     * @param define 要开启或关闭的着色器宏定义。
     * @param value true 表示添加宏定义，false 表示移除宏定义。
     */
    setDefine(define: ShaderDefine, value: boolean) {
        if (value) {
            this._shaderValues.addDefine(define);
        }
        else {
            this._shaderValues.removeDefine(define);
        }
    }

    /**
     * @en Checks if a shader define is present.
     * @param define The shader define to check for.
     * @returns true if the define is present, false otherwise.
     * @zh 检查是否包含特定的着色器宏定义。
     * @param define 要检查的着色器宏定义。
     * @returns 如果存在宏定义返回 true，否则返回 false。
     */
    hasDefine(define: ShaderDefine): boolean {
        return this._shaderValues.hasDefine(define);
    }

    /**
     * @en Whether depth writing is enabled for this material.
     * @zh 此材质是否启用深度写入。
     */
    get depthWrite(): boolean {
        return this._shaderValues.getBool(Shader3D.DEPTH_WRITE);
    }

    set depthWrite(value: boolean) {
        this._shaderValues.setBool(Shader3D.DEPTH_WRITE, value);
    }


    /**
     * @en The culling mode for this material.
     * @zh 此材质的剔除方式。
     */
    get cull(): number {
        return this._shaderValues.getInt(Shader3D.CULL);
    }

    set cull(value: number) {
        this._shaderValues.setInt(Shader3D.CULL, value);
    }

    /**
     * @en The blend mode for this material.
     * @zh 此材质的混合方式。
     */
    get blend(): number {
        return this._shaderValues.getInt(Shader3D.BLEND);
    }

    set blend(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND, value);
    }


    /**
     * @en The blend source for this material.
     * @zh 此材质的混合源。
     */
    get blendSrc(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_SRC);
    }

    set blendSrc(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_SRC, value);
    }



    /**
     * @en The blend destination for this material.
     * @zh 此材质的混合目标。
     */
    get blendDst(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_DST);
    }

    set blendDst(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_DST, value);
    }

    /**
     * @en The Alpha value of the blend source for this material.
     * @zh 此材质的混合源的 Alpha 值。
     */
    public get blendSrcAlpha(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_SRC_ALPHA);
    }
    public set blendSrcAlpha(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_SRC_ALPHA, value);
    }

    /**
     * @en The RGB value of the blend source for this material.
     * @zh 此材质的混合源的 RGB 值。
     */
    public get blendSrcRGB(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_SRC_RGB);
    }
    public set blendSrcRGB(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_SRC_RGB, value);
    }

    /**
     * @en The RGB value of the blend destination for this material.
     * @zh 此材质的混合目标的 RGB 值。
     */
    public get blendDstRGB(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_DST_RGB);
    }
    public set blendDstRGB(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_DST_RGB, value);
    }

    /**
     * @en The Alpha value of the blend destination for this material.
     * @zh 此材质的混合目标的 Alpha 值。
     */
    public get blendDstAlpha(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_DST_ALPHA);
    }
    public set blendDstAlpha(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_DST_ALPHA, value);
    }

    /**
     * @en The blend equation for this material.
     * @zh 此材质的混合方程。
     */
    public get blendEquation(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_EQUATION);
    }
    public set blendEquation(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_EQUATION, value);
    }

    /**
     * @en The RGB value of the blend equation for this material.
     * @zh 此材质的混合方程的 RGB 值。
     */
    public get blendEquationRGB(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_EQUATION_RGB);
    }
    public set blendEquationRGB(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_EQUATION_RGB, value);
    }

    /**
     * @en The Alpha value of the blend equation for this material.
     * @zh 此材质的混合方程的 Alpha 值。
     */
    public get blendEquationAlpha(): number {
        return this._shaderValues.getInt(Shader3D.BLEND_EQUATION_ALPHA);
    }
    public set blendEquationAlpha(value: number) {
        this._shaderValues.setInt(Shader3D.BLEND_EQUATION_ALPHA, value);
    }

    /**
     * @en The depth test mode.
     * @zh 深度测试方式。
     */
    get depthTest(): number {
        return this._shaderValues.getInt(Shader3D.DEPTH_TEST);
    }

    set depthTest(value: number) {
        this._shaderValues.setInt(Shader3D.DEPTH_TEST, value);
    }

    /**
     * @en The stencil test mode.
     * @zh 模板测试方式
     */
    get stencilTest(): number {
        return this._shaderValues.getInt(Shader3D.STENCIL_TEST);
    }

    set stencilTest(value: number) {
        this._shaderValues.setInt(Shader3D.STENCIL_TEST, value);
    }

    /**
     * @en Whether to write it into the stencil
     * @zh 是否写入模板。
     */
    get stencilWrite(): boolean {
        return this._shaderValues.getBool(Shader3D.STENCIL_WRITE);
    }

    set stencilWrite(value: boolean) {
        this._shaderValues.setBool(Shader3D.STENCIL_WRITE, value);
    }

    /**
     * @en Stencil values
     * @zh 模板值
     */
    get stencilRef(): number {
        return this._shaderValues.getInt(Shader3D.STENCIL_Ref);
    }

    set stencilRef(value: number) {
        this._shaderValues.setInt(Shader3D.STENCIL_Ref, value);
    }

    /**
     * @en The stencil operation settings for testing. The vector contains (fail, zfail, zpass) .
     * @zh 模板测试设置，向量包含（fail，zfail，zpass）。
     */
    get stencilOp(): Vector3 {
        return this._shaderValues.getVector3(Shader3D.STENCIL_Op);
    }

    set stencilOp(value: Vector3) {
        this._shaderValues.setVector3(Shader3D.STENCIL_Op, value);
    }

    /**
     * @en The material properties.
     * @zh 材质属性。
     */
    get MaterialProperty(): any {
        let propertyMap: any = {};
        var shaderValues = this._shaderValues.getData();
        for (let key in shaderValues) {
            propertyMap[LayaGL.renderEngine.propertyIDToName(parseInt(key))] = shaderValues[key];
        }
        return propertyMap;
    }

    /**
     * @en The material defines.
     * @zh 材质宏定义。
     */
    get MaterialDefine(): Array<string> {
        let shaderDefineArray = new Array<string>();
        let defineData = this._shaderValues.getDefineData();
        Shader3D._getNamesByDefineData(defineData, shaderDefineArray);
        return shaderDefineArray;
    }

    /**
     * @en Material rendering mode
     * @zh 材质渲染模式
     */
    get materialRenderMode() {
        return this._matRenderNode;
    }

    set materialRenderMode(value: MaterialRenderMode) {
        this._matRenderNode = value;
        switch (value) {
            case MaterialRenderMode.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = Material.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                //this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case MaterialRenderMode.RENDERMODE_CUTOUT:
                this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                //this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case MaterialRenderMode.RENDERMODE_TRANSPARENT:
                this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                //this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case MaterialRenderMode.RENDERMODE_ADDTIVE:
                this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                //this.cull = RenderState.CULL_NONE;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.addDefine(Material.SHADERDEFINE_ADDTIVEFOG);
                break;
            case MaterialRenderMode.RENDERMODE_ALPHABLENDED:
                this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                //this.cull = RenderState.CULL_NONE;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(Material.SHADERDEFINE_ADDTIVEFOG);
                break;
            case MaterialRenderMode.RENDERMODE_CUSTOME:
                //TODO IDE
                break;
            default:
                console.warn(`Material : renderMode value error - (${value}).`);
                break;
        }
    }

    /**
     * @ignore
     * @en Creates an instance of the Material.
     * @zh 创建一个Material实例。
     */
    constructor() {
        super();
        this._shaderValues = LayaGL.renderDeviceFactory.createShaderData(this);
        this.renderQueue = Material.RENDERQUEUE_OPAQUE;
        this._matRenderNode = 0;
        this.alphaTest = false;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_DISABLE;
        this.blendSrc = RenderState.BLENDPARAM_ONE;
        this.blendDst = RenderState.BLENDPARAM_ZERO;
        this.blendSrcRGB = RenderState.BLENDPARAM_ONE;
        this.blendDstRGB = RenderState.BLENDPARAM_ZERO;
        this.blendSrcAlpha = RenderState.BLENDPARAM_ONE;
        this.blendDstAlpha = RenderState.BLENDPARAM_ZERO;
        this.blendEquation = RenderState.BLENDEQUATION_ADD;
        this.blendEquationRGB = RenderState.BLENDEQUATION_ADD;
        this.blendEquationAlpha = RenderState.BLENDEQUATION_ADD;
        this.depthTest = RenderState.DEPTHTEST_LEQUAL;
        this.depthWrite = true;
        this.stencilRef = 1;
        this.stencilTest = RenderState.STENCILTEST_OFF;
        this.stencilWrite = false;
        this.stencilOp = new Vector3(RenderState.STENCILOP_KEEP, RenderState.STENCILOP_KEEP, RenderState.STENCILOP_REPLACE);
        this.destroyedImmediately = Config.destroyResourceImmediatelyDefault;
    }

    private _bindShaderInfo(shader: Shader3D) {
        //update UBOData by Shader
        let subShader = shader.getSubShaderAt(0);//TODO	
        // ubo
        let shaderUBODatas = subShader._uniformBufferDataMap;
        if (!shaderUBODatas)
            return;
        for (let key of shaderUBODatas.keys()) {
            //create data
            let uboData = shaderUBODatas.get(key).clone();
            //create UBO
            let ubo = UniformBufferObject.create(key, BufferUsage.Dynamic, uboData.getbyteLength(), false);
            this._shaderValues.setUniformBuffer(Shader3D.propertyNameToID(key), ubo);
            this._shaderValues._addCheckUBO(key, ubo, uboData);
        }
    }

    private _releaseUBOData() {
        this._shaderValues._releaseUBOData();
    }

    /**
     * @en Destroys the resources.
     * @zh 销毁资源。
     */
    protected _disposeResource(): void {
        this._releaseUBOData();
        this._shaderValues.destroy();
        this._shaderValues = null;
        this.ownerElements.clear();
    }

    /**
     * @en The shader of the material.
     * @zh 材质的着色器。
     */
    get shader() {
        return this._shader;
    }

    /**
     * @en Gets all uniform properties of the material.
     * @returns The map of uniform properties. 
     * @zh 获取材质的所有uniform属性。
     * @returns uniform属性的映射表。
     */
    effectiveProperty() {
        return this._shader.getSubShaderAt(0)._uniformTypeMap;
    }

    /**
     * @en Sets the shader by its name.
     * @param name The name of the shader to set. 
     * @zh 通过名称设置使用Shader。
     * @param name 要设置的着色器名称。
     */
    setShaderName(name: string): void {
        this._shader = Shader3D.find(name);
        if (!this._shader) {
            //throw new Error("Material: unknown shader name.");
            console.warn(`Material: unknown shader name '${name}'`);
            this._shader = Shader3D.find("BLINNPHONG");
        }

        if (Config3D._uniformBlock) {
            this._releaseUBOData();
            //bind shader info
            // todo 清理残留 shader data
            this._bindShaderInfo(this._shader);
        }

        // set default value
        // todo subShader 选择
        let subShader = this._shader.getSubShaderAt(0);
        let defaultValue = subShader._uniformDefaultValue;
        let typeMap = subShader._uniformTypeMap;
        this.applyUniformDefaultValue(typeMap, defaultValue);
        this._notifyOwnerElements();
    }

    /**
     * @internal
     */
    applyUniformDefaultValue(typeMap: Map<string, ShaderDataType>, defaultValue: Record<string, ShaderDataItem>) {
        typeMap.forEach((type, key) => {
            if (defaultValue && defaultValue[key] != undefined) {
                let value = defaultValue[key];
                this.setShaderData(key, type, value);
            }
            else {
                let value = ShaderDataDefaultValue(type);
                if (value) {
                    this.setShaderData(key, type, value);
                }
            }
        });
    }

    /**
     * @en Gets the boolean uniform value by index.
     * @param uniformIndex The index of the uniform.
     * @returns The boolean value of the property. 
     * @zh 通过uniform索引获取布尔值。
     * @param uniformIndex uniform索引。
     * @returns uniform索引的布尔值。
     */
    getBoolByIndex(uniformIndex: number): boolean {
        return this.shaderData.getBool(uniformIndex);
    }

    /**
     * @en Sets the boolean value by uniform index.
     * @param uniformIndex The index of the uniform. 
     * @param value The bool value to set. 
     * @zh 通过uniform索引设置布尔值。
     * @param uniformIndex uniform索引。
     * @param value 要设置的布尔值。
     */
    setBoolByIndex(uniformIndex: number, value: boolean) {
        this.shaderData.setBool(uniformIndex, value);
    }

    /**
     * @en Gets a boolean value of uniformIndex by property name.
     * @param name The name of the property.
     * @returns The boolean value.
     * @zh 根据属性名称获得uniform索引的布尔值。
     * @param name 属性名称。
     * @returns uniform索引的布尔值。
     */
    getBool(name: string): boolean {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getBoolByIndex(uniformIndex);
    }

    /**
     * @en Sets a boolean value by property name.
     * @param name The name of the property.
     * @param value The value to set.
     * @zh 设置属性名称对应的布尔值。
     * @param name 属性名称。
     * @param value 要设置的值。
     */
    setBool(name: string, value: boolean) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setBoolByIndex(uniformIndex, value);
    }

    /**
     * @en Gets a float value by uniform index.
     * @param uniformIndex The index of the property.
     * @returns The float value.
     * @zh 通过属性索引获得浮点值。
     * @param uniformIndex 属性索引。
     * @returns 浮点值。
     */
    getFloatByIndex(uniformIndex: number): number {
        return this.shaderData.getNumber(uniformIndex);
    }

    /**
     * @en Sets a float value by uniform index.
     * @param uniformIndex The index of the property.
     * @param value The value to set.
     * @zh 通过属性索引设置浮点值。
     * @param uniformIndex 属性索引。
     * @param value 要设置的值。
     */
    setFloatByIndex(uniformIndex: number, value: number) {
        this.shaderData.setNumber(uniformIndex, value);
    }

    /**
     * @en Gets a float value by property name.
     * @param name The name of the property.
     * @returns The float value.
     * @zh 根据属性名称获得浮点值。
     * @param name 属性名称。
     * @returns 浮点值。
     */
    getFloat(name: string): number {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getFloatByIndex(uniformIndex);
    }

    /**
     * @en Sets a float value by property name.
     * @param name The name of the property.
     * @param value The value to set.
     * @zh 设置属性名称对应的浮点值。
     * @param name 属性名称。
     * @param value 要设置的值。
     */
    setFloat(name: string, value: number) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setFloatByIndex(uniformIndex, value);
    }

    /**
     * @en Gets an integer value by uniform index.
     * @param uniformIndex The index of the property.
     * @returns The integer value.
     * @zh 通过属性索引获得整数值。
     * @param uniformIndex 属性索引。
     * @returns 整数值。
     */
    getIntByIndex(uniformIndex: number): number {
        return this.shaderData.getInt(uniformIndex);
    }

    /**
     * @en Sets an integer value by uniform index.
     * @param uniformIndex The index of the property.
     * @param value The value to set.
     * @zh 通过属性索引设置整数值。
     * @param uniformIndex 属性索引。
     * @param value 要设置的值。
     */
    setIntByIndex(uniformIndex: number, value: number) {
        this.shaderData.setInt(uniformIndex, value);
    }

    /**
     * @en Gets an integer value by property name.
     * @param name The name of the property.
     * @returns The integer value.
     * @zh 根据属性名称获得整数值。
     * @param name 属性名称。
     * @returns 整数值。
     */
    getInt(name: string): number {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getIntByIndex(uniformIndex);
    }

    /**
     * @en Sets an integer value by property name.
     * @param name The name of the property.
     * @param value The value to set.
     * @zh 设置属性名称对应的整数值。
     * @param name 属性名称。
     * @param value 要设置的值。
     */
    setInt(name: string, value: number) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setIntByIndex(uniformIndex, value);
    }

    /**
     * @en Gets a Vector2 value by uniform index.
     * @param uniformIndex The index of the property.
     * @returns The Vector2 value.
     * @zh 通过属性索引获得Vector2值。
     * @param uniformIndex 属性索引。
     * @returns Vector2值。
     */
    getVector2ByIndex(uniformIndex: number): Vector2 {
        return this.shaderData.getVector2(uniformIndex);
    }

    /**
     * @en Sets a Vector2 value by uniform index.
     * @param uniformIndex The index of the property.
     * @param value The Vector2 value to set.
     * @zh 通过属性索引设置Vector2值。
     * @param uniformIndex 属性索引。
     * @param value 要设置的Vector2值。
     */
    setVector2ByIndex(uniformIndex: number, value: Vector2) {
        this.shaderData.setVector2(uniformIndex, value);
    }

    /**
     * @en Gets a Vector2 value by property name.
     * @param name The name of the property.
     * @returns The Vector2 value.
     * @zh 根据属性名称获得Vector2值。
     * @param name 属性名称。
     * @returns Vector2值。
     */
    getVector2(name: string): Vector2 {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getVector2ByIndex(uniformIndex);
    }

    /**
     * @en Sets a Vector2 value by property name.
     * @param name The name of the property.
     * @param value The Vector2 value to set.
     * @zh 设置属性名称对应的Vector2值。
     * @param name 属性名称。
     * @param value 要设置的Vector2值。
     */
    setVector2(name: string, value: Vector2) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setVector2ByIndex(uniformIndex, value);
    }

    /**
     * @en Retrieves a Vector3 value by its uniform index.
     * @param uniformIndex The index of the property.
     * @returns The retrieved Vector3 value.
     * @zh 通过属性索引获得Vector3值。
     * @param uniformIndex 属性索引。
     * @returns 检索到的Vector3值。
     */
    getVector3ByIndex(uniformIndex: number): Vector3 {
        return this.shaderData.getVector3(uniformIndex);
    }

    /**
     * @en Sets a Vector3 value by its uniform index.
     * @param uniformIndex The index of the property.
     * @param value The Vector3 value to set.
     * @zh 通过属性索引设置Vector3值。
     * @param uniformIndex 属性索引。
     * @param value 要设置的Vector3值。
     */
    setVector3ByIndex(uniformIndex: number, value: Vector3) {
        this.shaderData.setVector3(uniformIndex, value);
    }

    /**
     * @en Retrieves a Vector3 value by its property name.
     * @param name The name of the property as defined in the shader.
     * @returns The retrieved Vector3 value.
     * @zh 根据属性名称获得Vector3值。
     * @param name 着色器中定义的属性名称。
     * @returns 检索到的Vector3值。
     */
    getVector3(name: string) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getVector3ByIndex(uniformIndex);
    }

    /**
     * @en Sets a Vector3 value by its property name.
     * @param name The name of the property as defined in the shader.
     * @param value The Vector3 value to set.
     * @zh 设置属性名称对应的Vector3值。
     * @param name 着色器中定义的属性名称。
     * @param value 要设置的Vector3值。
     */
    setVector3(name: string, value: Vector3) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setVector3ByIndex(uniformIndex, value);
    }

    /**
     * @en Sets a Vector4 value by uniform index.
     * @param uniformIndex The index of the property.
     * @param value The Vector4 value to set.
     * @zh 通过属性索引设置Vector4值。
     * @param uniformIndex 属性索引。
     * @param value 要设置的Vector4值。
     */
    setVector4ByIndex(uniformIndex: number, value: Vector4) {
        this.shaderData.setVector(uniformIndex, value);
    }

    /**
     * @en Retrieves a Vector4 value by uniform index.
     * @param uniformIndex The index of the property.
     * @returns The retrieved Vector4 value.
     * @zh 通过属性索引获取Vector4值。
     * @param uniformIndex 属性索引。
     * @returns 检索到的Vector4值。
     */
    getVector4ByIndex(uniformIndex: number): Vector4 {
        return this.shaderData.getVector(uniformIndex);
    }

    /**
     * @en Sets a Vector4 value by property name.
     * @param name The name of the property.
     * @param value The Vector4 value to set.
     * @zh 设置属性名称对应的Vector4值。
     * @param name 属性名称。
     * @param value 要设置的Vector4值。
     */
    setVector4(name: string, value: Vector4) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setVector4ByIndex(uniformIndex, value);
    }

    /**
     * @en Retrieves a Vector4 value by property name.
     * @param name The name of the property.
     * @returns The retrieved Vector4 value.
     * @zh 根据属性名称获得Vector4值。
     * @param name 属性名称。
     * @returns 检索到的Vector4值。
     */
    getVector4(name: string) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getVector4ByIndex(uniformIndex);
    }

    /**
     * @en Retrieves a Color value by its uniform index.
     * @param uniformIndex The index of the property.
     * @returns The retrieved Color value.
     * @zh 通过属性索引获得颜色值。
     * @param uniformIndex 属性索引。
     * @returns 检索到的颜色值。
     */
    getColorByIndex(uniformIndex: number): Color {
        return this.shaderData.getColor(uniformIndex);
    }

    /**
     * @en Sets a Color value by its uniform index.
     * @param uniformIndex The index of the property.
     * @param value The Color value to set.
     * @zh 通过属性索引设置颜色值。
     * @param uniformIndex 属性索引。
     * @param value 要设置的颜色值。
     */
    setColorByIndex(uniformIndex: number, value: Color) {
        this.shaderData.setColor(uniformIndex, value);
    }

    /**
     * @en Retrieves a Color value by property name.
     * @param name The name of the property.
     * @returns The retrieved Color value.
     * @zh 根据属性名称获得颜色值。
     * @param name 属性名称。
     * @returns 检索到的颜色值。
     */
    getColor(name: string): Color {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.shaderData.getColor(uniformIndex);
    }

    /**
     * @en Sets a Color value by property name.
     * @param name The name of the property.
     * @param value The Color value to set.
     * @zh 设置属性名称对应的颜色值。
     * @param name 属性名称。
     * @param value 要设置的颜色值。
     */
    setColor(name: string, value: Color) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setColorByIndex(uniformIndex, value);
    }

    /**
     * @en Retrieves a Matrix4x4 value by its uniform index.
     * @param uniformIndex The index of the property.
     * @returns The retrieved Matrix4x4 value.
     * @zh 通过属性索引获得4x4矩阵值。
     * @param uniformIndex 属性索引。
     * @returns 检索到的4x4矩阵值。
     */
    getMatrix4x4ByIndex(uniformIndex: number): Matrix4x4 {
        return this.shaderData.getMatrix4x4(uniformIndex);
    }

    /**
     * @en Sets a Matrix4x4 value by its uniform index.
     * @param uniformIndex The index of the property.
     * @param value The Matrix4x4 value to set.
     * @zh 通过属性索引设置4x4矩阵值。
     * @param uniformIndex 属性索引。
     * @param value 要设置的4x4矩阵值。
     */
    setMatrix4x4ByIndex(uniformIndex: number, value: Matrix4x4) {
        this.shaderData.setMatrix4x4(uniformIndex, value);
    }

    /**
     * @en Retrieves a Matrix4x4 value by property name.
     * @param name The name of the property.
     * @returns The retrieved Matrix4x4 value.
     * @zh 根据属性名称获得4x4矩阵值。
     * @param name 属性名称。
     * @returns 检索到的4x4矩阵值。
     */
    getMatrix4x4(name: string): Matrix4x4 {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getMatrix4x4ByIndex(uniformIndex);
    }

    /**
     * @en Sets a Matrix4x4 value by property name.
     * @param name The name of the property.
     * @param value The Matrix4x4 value to set.
     * @zh 设置属性名称对应的4x4矩阵值。
     * @param name 属性名称。
     * @param value 要设置的4x4矩阵值。
     */
    setMatrix4x4(name: string, value: Matrix4x4) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setMatrix4x4ByIndex(uniformIndex, value);
    }

    /**
     * @en Retrieves a 3x3 matrix value by its index.
     * @param index The index of the matrix within the shader data.
     * @returns The retrieved 3x3 matrix value.
     * @zh 通过索引获取3x3矩阵值。
     * @param index 着色器数据中矩阵的索引。
     * @returns 检索到的3x3矩阵值。
     */
    getMatrix3x3ByIndex(index: number) {
        return this.shaderData.getMatrix3x3(index);
    }

    /**
     * @en Sets a 3x3 matrix value by its index.
     * @param index The index of the matrix within the shader data.
     * @param value The 3x3 matrix value to set.
     * @zh 通过索引设置3x3矩阵值。
     * @param index 着色器数据中矩阵的索引。
     * @param value 要设置的3x3矩阵值。
     */
    setMatrix3x3ByIndex(index: number, value: Matrix3x3) {
        this.shaderData.setMatrix3x3(index, value);
    }

    /**
     * @en Retrieves a 3x3 matrix value by its property name.
     * @param name The name of the property.
     * @returns The retrieved 3x3 matrix value.
     * @zh 根据属性名称获取3x3矩阵值。
     * @param name 属性名称。
     * @returns 检索到的3x3矩阵值。
     */
    getMatrix3x3(name: string): Matrix3x3 {
        let index = Shader3D.propertyNameToID(name);
        return this.getMatrix3x3ByIndex(index);
    }

    /**
     * @en Sets a 3x3 matrix value by its property name.
     * @param name The name of the property.
     * @param value The 3x3 matrix value to set.
     * @zh 设置属性名称对应的3x3矩阵值。
     * @param name 属性名称。
     * @param value 要设置的3x3矩阵值。
     */
    setMatrix3x3(name: string, value: Matrix3x3) {
        let index = Shader3D.propertyNameToID(name);
        this.setMatrix3x3ByIndex(index, value);
    }

    /**
     * @en Sets a texture by its uniform index.
     * @param uniformIndex The index of the property.
     * @param texture The texture to set.
     * @zh 通过属性索引设置纹理。
     * @param uniformIndex 属性索引。
     * @param texture 要设置的纹理。
     */
    setTextureByIndex(uniformIndex: number, texture: BaseTexture) {
        this.shaderData.setTexture(uniformIndex, texture);
        if (texture && !texture._texture)//贴图为加载完，需要重设
            texture.once(Event.READY, this, this.reSetTexture, [uniformIndex, texture]);
    }

    private reSetTexture(uniformIndex: number, texture: BaseTexture) {
        this.setTextureByIndex(uniformIndex, texture);
    }

    /**
     * @en Retrieves a texture by its uniform index.
     * @param uniformIndex The index of the property.
     * @returns The retrieved texture.
     * @zh 通过属性索引获得纹理。
     * @param uniformIndex 属性索引。
     * @returns 检索到的纹理。
     */
    getTextureByIndex(uniformIndex: number) {
        return this.shaderData.getTexture(uniformIndex);
    }

    /**
     * @en Sets a texture by property name.
     * @param name The name of the property.
     * @param texture The texture to set.
     * @zh 根据属性名称设置纹理。
     * @param name 属性名称。
     * @param texture 要设置的纹理。
     */
    setTexture(name: string, texture: BaseTexture) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setTextureByIndex(uniformIndex, texture);
    }

    /**
     * @en Retrieves a texture by property name.
     * @param name The name of the property.
     * @returns The retrieved texture.
     * @zh 根据属性名称获得纹理。
     * @param name 属性名称。
     * @returns 检索到的纹理。
     */
    getTexture(name: string): BaseTexture {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getTextureByIndex(uniformIndex);
    }

    /**
     * @en Retrieves a buffer by its uniform index.
     * @param uniformIndex The index of the property.
     * @returns The retrieved buffer.
     * @zh 通过属性索引获得Buffer。
     * @param uniformIndex 属性索引。
     * @returns 检索到的Buffer。
     */
    getBufferByIndex(uniformIndex: number): Float32Array {
        return this.shaderData.getBuffer(uniformIndex);
    }

    /**
     * @en Sets a buffer by its uniform index.
     * @param uniformIndex The index of the property.
     * @param value The buffer to set.
     * @zh 通过属性索引设置Buffer。
     * @param uniformIndex 属性索引。
     * @param value 要设置的Buffer值。
     */
    setBufferByIndex(uniformIndex: number, value: Float32Array) {
        this.shaderData.setBuffer(uniformIndex, value);
    }

    /**
     * @en Retrieves a buffer by property name.
     * @param name The name of the property.
     * @returns The retrieved buffer.
     * @zh 根据属性名称获得Buffer。
     * @param name 属性名称。
     * @returns 检索到的Buffer。
     */
    getBuffer(name: string): Float32Array {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getBufferByIndex(uniformIndex);
    }

    /**
     * @en Sets a buffer by property name.
     * @param name The name of the property.
     * @param value The buffer to set.
     * @zh 根据属性名称设置Buffer。
     * @param name 属性名称。
     * @param value 要设置的Buffer值。
     */
    setBuffer(name: string, value: Float32Array) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setBufferByIndex(uniformIndex, value);
    }

    /**
     * @en Sets the attribute value of ShaderData by uniform index.
     * @param uniformIndex The index of the attribute.
     * @param type The type of the value to be set.
     * @param value The value to be set.
     * @zh 通过属性索引设置ShaderData的属性值。
     * @param uniformIndex 属性索引。
     * @param type 要设置的值的类型。
     * @param value 要设置的值。
     */
    setShaderDataByIndex(uniformIndex: number, type: ShaderDataType, value: ShaderDataItem) {
        this.shaderData.setShaderData(uniformIndex, type, value);
    }

    /**
     * @en Sets the attribute value of ShaderData by property name.
     * @param name The name of the property.
     * @param type The type of the value to be set.
     * @param value The value to be set.
     * @zh 根据属性名称设置ShaderData的属性值。
     * @param name 属性名称。
     * @param type 要设置的值的类型。
     * @param value 要设置的值。
     */
    setShaderData(name: string, type: ShaderDataType, value: ShaderDataItem) {
        let uniformIndex = Shader3D.propertyNameToID(name);
        this.setShaderDataByIndex(uniformIndex, type, value);
    }

    /**
     * @en Retrieves the attribute value of ShaderData by property name.
     * @param name The name of the property.
     * @param type The type of the value to be retrieved.
     * @returns The retrieved ShaderData attribute value.
     * @zh 根据属性名称获得ShaderData的属性值。
     * @param name 属性名称。
     * @param type 要检索的值的类型。
     * @returns 检索到的ShaderData属性值。
     */
    getShaderData(name: string, type: ShaderDataType): ShaderDataItem {
        let uniformIndex = Shader3D.propertyNameToID(name);
        return this.getShaderDataByIndex(uniformIndex, type);
    }

    /**
     * @en Retrieves the attribute value of ShaderData by uniform index.
     * @param uniformIndex The index of the attribute.
     * @param type The type of the value to be retrieved.
     * @returns The retrieved ShaderData attribute value.
     * @zh 通过属性索引获得ShaderData的属性值。
     * @param uniformIndex 属性索引。
     * @param type 要检索的值的类型。
     * @returns 检索到的ShaderData属性值。
     */
    getShaderDataByIndex(uniformIndex: number, type: ShaderDataType): ShaderDataItem {
        return this._shaderValues.getShaderData(uniformIndex, type);
    }

    /**
     * @en Clones the current material to destination material object.
     * @param destObject The destination material object.
     * @zh 克隆当前材质到目标材质对象。
     * @param destObject 目标材质对象。
     */
    cloneTo(destObject: Material): void {
        destObject.name = this.name;
        destObject.renderQueue = this.renderQueue;
        destObject.setShaderName(this._shader._name);
        this._shaderValues.cloneTo(destObject._shaderValues);
    }

    /**
     * @en Creates a clone of the current material.
     * @returns A new material instance that is a clone of the current material.
     * @zh 创建当前材质的克隆副本。
     * @returns 一个克隆自当前材质的新材质实例。
     */
    clone(): any {
        var dest: Material = new Material();
        this.cloneTo(dest);
        return dest;
    }

    //--------------------------------------------兼容-------------------------------------------------

    /**
     * @en The material define.
     * @zh 材质宏
     */
    get _defineDatas(): IDefineDatas {
        return this._shaderValues.getDefineData();
    }

    /**
     * @en Compatible with old parsing end events
     * @zh 兼容老的解析结束事件
     */
    oldparseEndEvent() {
        //TODO
    }
}


