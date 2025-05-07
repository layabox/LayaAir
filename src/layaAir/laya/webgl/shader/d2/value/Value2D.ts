import { Const } from "../../../../Const"
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData"
import { IDefineDatas } from "../../../../RenderDriver/RenderModuleData/Design/IDefineDatas"
import { RenderState } from "../../../../RenderDriver/RenderModuleData/Design/RenderState"
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D"
import { ColorFilter } from "../../../../filters/ColorFilter"
import { LayaGL } from "../../../../layagl/LayaGL"
import { Matrix4x4 } from "../../../../maths/Matrix4x4"
import { Vector2 } from "../../../../maths/Vector2"
import { Vector4 } from "../../../../maths/Vector4"
import { BaseTexture } from "../../../../resource/BaseTexture"
import { Material } from "../../../../resource/Material"
import { Texture } from "../../../../resource/Texture"
import { ShaderDefines2D } from "../ShaderDefines2D"

export enum RenderSpriteData {
    Zero,
    Texture2D,
    Primitive
}

//系统自带渲染数据，不可忽视，如果不设置自定义Shader，将调用引擎本身的Shader
export class Value2D {
    protected static _cache: any[] = [];
    protected static _typeClass: any = [];
    static _compileDefine: IDefineDatas;

    //释放的时候用来去重的，
    _needRelease = false;

    shaderData: ShaderData;

    _defaultShader: Shader3D;

    private mainID = RenderSpriteData.Zero;
    private ref = 1;

    private _cacheID = 0;

    filters: any[];
    private _textureHost: Texture | BaseTexture

    constructor(mainID: RenderSpriteData) {
        this.mainID = mainID;
        //这个prototype是为了防止调用到子的initialize
        Value2D.prototype.initialize.call(this);
    }

    //为了方便复用
    protected initialize() {
        let mainID = this.mainID;
        this.shaderData = this.shaderData || LayaGL.renderDeviceFactory.createShaderData(null);
        if (this.mainID == RenderSpriteData.Texture2D) {
            this.shaderData.addDefine(ShaderDefines2D.TEXTURESHADER);
        }
        if (this.mainID == RenderSpriteData.Primitive) {
            this.shaderData.addDefine(ShaderDefines2D.PRIMITIVESHADER);
        }
        this.textureHost = null;

        this.clipMatDir = new Vector4(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE);
        this.clipMatPos = new Vector2();
        this._cacheID = mainID;
        let cache = Value2D._cache[this._cacheID];
        if (mainID > 0 && !cache) {
            cache = Value2D._cache[this._cacheID] = [];
            cache._length = 0;
        }

        //
        this.shaderData.setBool(Shader3D.DEPTH_WRITE, false);
        this.shaderData.setInt(Shader3D.DEPTH_TEST, RenderState.DEPTHTEST_OFF);
        this.shaderData.setInt(Shader3D.BLEND, RenderState.BLEND_ENABLE_ALL);
        this.shaderData.setInt(Shader3D.BLEND_EQUATION, RenderState.BLENDEQUATION_ADD);
        this.shaderData.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
        this.shaderData.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
        this.shaderData.setNumber(ShaderDefines2D.UNIFORM_VERTALPHA, 1.0);
        this.shaderData.setInt(Shader3D.CULL, RenderState.CULL_NONE);
    }

    reinit() {
        this.initialize();
    }

    public static _initone(type: number, classT: any): void {
        Value2D._compileDefine = LayaGL.unitRenderModuleDataFactory.createDefineDatas();
        Value2D._typeClass[type] = classT;
        Value2D._cache[type] = [];
        Value2D._cache[type]._length = 0;
    }

    /**
     * 对象池概念
     * @param mainType 
     * @returns 
     */
    static create(mainType: RenderSpriteData): Value2D {
        var types: any = Value2D._cache[mainType] ? Value2D._cache[mainType] : [];
        if (types._length) {
            let sv = types[--types._length];
            sv.reinit();
            return sv;
        }
        else
            return new Value2D._typeClass[mainType]();
    }

    /**@internal */
    set size(value: Vector2) {
        this.shaderData.setVector2(ShaderDefines2D.UNIFORM_SIZE, value);
    }

    get size() {    
        return this.shaderData.getVector2(ShaderDefines2D.UNIFORM_SIZE);
    }

    set vertAlpha(value: number) {
        this.shaderData.setNumber(ShaderDefines2D.UNIFORM_VERTALPHA, value);
    }

    get vertAlpha() {
        return this.shaderData.getNumber(ShaderDefines2D.UNIFORM_VERTALPHA);
    }

    /**@internal */
    set mmat(value: Matrix4x4) {
        this.shaderData.setMatrix4x4(ShaderDefines2D.UNIFORM_MMAT, value);
    }

    /**@internal */
    get mmat() {
        return this.shaderData.getMatrix4x4(ShaderDefines2D.UNIFORM_MMAT);
    }

    /**@internal */
    set u_MvpMatrix(value: Matrix4x4) {
        this.shaderData.setMatrix4x4(ShaderDefines2D.UNIFORM_MVPMatrix, value);
    }

    get u_MvpMatrix() {
        return this.shaderData.getMatrix4x4(ShaderDefines2D.UNIFORM_MVPMatrix);
    }

    public get textureHost(): Texture | BaseTexture {
        return this._textureHost
    }
    public set textureHost(value: Texture | BaseTexture) {
        this._textureHost = value;
        let textrueReadGamma: boolean = false;
        if (this.textureHost) {
            if (this.textureHost instanceof BaseTexture) {
                textrueReadGamma = (this.textureHost as BaseTexture).gammaCorrection != 1;
            } else if (this.textureHost instanceof Texture && (this.textureHost as Texture).bitmap) {
                textrueReadGamma = (this.textureHost as Texture).bitmap.gammaCorrection != 1;
            }
        }

        if (textrueReadGamma) {
            this.shaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
        } else {
            this.shaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
        }
        let tex;
        if (value instanceof Texture) {
            tex = value.bitmap;
        } else {
            tex = value;
        }
        this.shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, tex);

    }

    set color(value: Vector4) {
        value && this.shaderData.setVector(ShaderDefines2D.UNIFORM_COLOR, value);
    }

    get color() {
        return this.shaderData.getVector(ShaderDefines2D.UNIFORM_COLOR);
    }

    set colorAdd(value: Vector4) {
        this.shaderData.setVector(ShaderDefines2D.UNIFORM_COLORADD, value);
    }

    get colorAdd() {
        return this.shaderData.getVector(ShaderDefines2D.UNIFORM_COLORADD);
    }

    set clipMatDir(value: Vector4) {
        this.shaderData.setVector(ShaderDefines2D.UNIFORM_CLIPMATDIR, value);
    }

    get clipMatDir() {
        return this.shaderData.getVector(ShaderDefines2D.UNIFORM_CLIPMATDIR);
    }

    set clipMatPos(value: Vector2) {
        this.shaderData.setVector2(ShaderDefines2D.UNIFORM_CLIPMATPOS, value);
    }

    get clipMatPos() {
        return this.shaderData.getVector2(ShaderDefines2D.UNIFORM_CLIPMATPOS);
    }

    upload(material: Material | null, shaderData: ShaderData): void {
    }

    //TODO:coverage
    setFilter(value: ColorFilter): void {
        if (!value)
            return;

        this.shaderData.addDefine(value.typeDefine);//搬到setValue中
    }

    clear(): void {
        if (this.shaderData) {
            this.shaderData.clearDefine();
            //this.shaderData.destroy();
        }
        this.textureHost = null;
    }

    //
    blendNormal() {
        this.shaderData.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_SRC_ALPHA);
        this.shaderData.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
    }

    blendPremulAlpha() {
        this.shaderData.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
        this.shaderData.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
    }

    blendAdd() {
        this.shaderData.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
        this.shaderData.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE);
    }

    blendMask() {
        this.shaderData.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ZERO);
        this.shaderData.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_SRC_ALPHA);
    }

    release(): void {
        if ((--this.ref) < 1) {
            let cache = Value2D._cache[this._cacheID];
            cache && (cache[cache._length++] = this);
            this.clear();
            this.filters = null;
            this.ref = 1;
        }
    }
}


export class Value2DManager {

}