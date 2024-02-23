import { Texture } from "../../../../resource/Texture"
import { ShaderDefines2D } from "../ShaderDefines2D"
import { RenderState2D } from "../../../utils/RenderState2D"
import { RenderTexture2D } from "../../../../resource/RenderTexture2D"
import { Const } from "../../../../Const"
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D"
import { Material } from "../../../../resource/Material"
import { Vector2 } from "../../../../maths/Vector2"
import { Matrix4x4 } from "../../../../maths/Matrix4x4"
import { Vector4 } from "../../../../maths/Vector4"
import { TextTexture } from "../../../text/TextTexture"
import { LayaGL } from "../../../../layagl/LayaGL"
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData"
import { IDefineDatas } from "../../../../RenderDriver/RenderModuleData/Design/IDefineDatas"
import { WebGLShaderInstance } from "../../../../RenderDriver/WebGLDriver/RenderDevice/WebGLShaderInstance"
import { RenderState } from "../../../../RenderDriver/RenderModuleData/Design/RenderState"
import { ColorFilter } from "../../../../filters/ColorFilter"

export enum RenderSpriteData {
    Zero,
    Texture2D,
    Primitive
}

//系统自带渲染数据，不可忽视，如果不设置自定义Shader，将调用引擎本身的Shader
export class Value2D {
    static globalShaderData: ShaderData;
    protected static _cache: any[] = [];
    protected static _typeClass: any = [];
    static _compileDefine: IDefineDatas;

    private _color: Vector4;
    private _colorAdd: Vector4;

    shaderData: ShaderData;

    _defaultShader: Shader3D;
    //TODO
    alpha = 1.0;	//这个目前只给setIBVB用。其他的都放到attribute的color中了

    private mainID = RenderSpriteData.Zero;
    private ref = 1;
    private _inClassCache: any;

    private _cacheID = 0;

    /**@internal */
    private _size = new Vector2();

    /**@internal */
    private _mmat = new Matrix4x4();
    filters: any[];
    texture: any;
    private _textureHost: Texture | RenderTexture2D | TextTexture
    private _clipMatDir = new Vector4(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE);
    private _clipMatpos = new Vector2();
    private _clipOff = new Vector2();//vector2			// 裁剪是否需要加上偏移，cacheas normal用

    constructor(mainID: RenderSpriteData) {
        this.shaderData = LayaGL.renderDeviceFactory.createShaderData(null);
        this.mainID = mainID;
        this.textureHost = null;
        this.texture = null;
        //this.fillStyle = null;
        //this.color = null;
        //this.strokeStyle = null;
        //this.colorAdd = null;

        this.clipMatDir = this._clipMatDir;
        this.clipMatPos = this._clipMatpos;
        this.clipOff = this._clipOff;
        this._cacheID = mainID;
        this._inClassCache = Value2D._cache[this._cacheID];
        if (mainID > 0 && !this._inClassCache) {
            this._inClassCache = Value2D._cache[this._cacheID] = [];
            this._inClassCache._length = 0;
        }
        this.clear();
    }

    public static _initone(type: number, classT: any): void {
        Value2D._compileDefine = LayaGL.unitRenderModuleDataFactory.createDefineDatas();
        Value2D._typeClass[type] = classT;
        Value2D._cache[type] = [];
        Value2D._cache[type]._length = 0;
        Value2D.globalShaderData = LayaGL.renderDeviceFactory.createShaderData(null);
    }

    /**
     * 对象池概念
     * @param mainType 
     * @returns 
     */
    static create(mainType: RenderSpriteData): Value2D {
        var types: any = Value2D._cache[mainType] ? Value2D._cache[mainType] : [];
        if (types._length)
            return types[--types._length];
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

    public get textureHost(): Texture | RenderTexture2D | TextTexture {
        return this._textureHost
    }
    public set textureHost(value: Texture | RenderTexture2D | TextTexture) {
        this._textureHost = value;
        //var tex = value && value._getSource();
        //@ts-ignore
        this.shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, value);
    }
    //public var fillStyle:DrawStyle;			//TODO 这个有什么用？

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
    set clipOff(value: Vector2) {
        this.shaderData.setVector2(ShaderDefines2D.UNIFORM_CLIPOFF, value);
    }

    get clipOff() {
        return this.shaderData.getVector2(ShaderDefines2D.UNIFORM_CLIPOFF);
    }

    /**
     * 组织Define宏数据
     */
    updateShaderData() {
        var renderstate2d: any = RenderState2D;
        // 如果有矩阵的话，就设置 WORLDMAT 宏
        RenderState2D.worldMatrix4 === RenderState2D.TEMPMAT4_ARRAY || this.shaderData.addDefine(ShaderDefines2D.WORLDMAT);
        this._mmat.cloneByArray(renderstate2d.worldMatrix4);
        this.mmat = this._mmat;

        if (RenderState2D.matWVP) {
            this.shaderData.addDefine(ShaderDefines2D.MVP3D);
            this.u_MvpMatrix = RenderState2D.matWVP;
        }
        let returnGamma: boolean = !(RenderTexture2D.currentActive) || ((RenderTexture2D.currentActive)._texture.gammaCorrection != 1);
        //returnGamma = returnGamma && (this.textureHost && ((this.textureHost as RenderTexture2D).gammaCorrection == 1 || (this.textureHost as Texture).bitmap.gammaCorrection == 1));
        let textrueReadGamma: boolean = false;
        if (this.textureHost) {
            if (this.textureHost instanceof RenderTexture2D) {
                textrueReadGamma = (this.textureHost as RenderTexture2D).gammaCorrection != 1;
            } else if (this.textureHost instanceof Texture && (this.textureHost as Texture).bitmap) {
                textrueReadGamma = (this.textureHost as Texture).bitmap.gammaCorrection != 1;
            } else if (this.textureHost instanceof TextTexture && (this.textureHost as TextTexture).bitmap) {
                // TextTexture
                textrueReadGamma = (this.textureHost as TextTexture).gammaCorrection != 1;
            }
        }

        if (textrueReadGamma) {
            this.shaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
        } else {
            this.shaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
        }

        if (returnGamma) {
            this.shaderData.addDefine(ShaderDefines2D.GAMMASPACE);
        } else {
            this.shaderData.removeDefine(ShaderDefines2D.GAMMASPACE);
        }

        if (RenderState2D.InvertY) {
            this.shaderData.addDefine(ShaderDefines2D.INVERTY);
        } else {
            this.shaderData.removeDefine(ShaderDefines2D.INVERTY);
        }

        if (this.mainID == RenderSpriteData.Texture2D) {
            this.shaderData.addDefine(ShaderDefines2D.TEXTURESHADER);
        }
        if (this.mainID == RenderSpriteData.Primitive) {
            this.shaderData.addDefine(ShaderDefines2D.PRIMITIVESHADER);
        }
    }

    upload(material: Material|null, shaderData:ShaderData): void {
        //this._size.setValue(RenderState2D.width, RenderState2D.height)
        //this.size = this._size;
        //update owner ShaderData
        this.updateShaderData();
        if (material) {
            //Custom Shader
            var shaderPass = material._shader._subShaders[0]._passes;

            var pass;
            for (var j = 0, m = shaderPass.length; j < m; j++) {
                pass = shaderPass[j];
                //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
                if (pass.pipelineMode == "Forward")
                    break;
            }
            var comDef = Value2D._compileDefine;
            shaderData.getDefineData().cloneTo(Value2D._compileDefine);
            //mateiral Define
            Value2D._compileDefine.addDefineDatas(material._defineDatas);
            //Global Define
            Value2D._compileDefine.addDefineDatas(Value2D.globalShaderData.getDefineData());
            var shaderIns = pass.withCompile(Value2D._compileDefine, true) as WebGLShaderInstance;
            shaderIns.bind();
            shaderIns.uploadUniforms(shaderIns._sprite2DUniformParamsMap, shaderData as any, true);
            shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, Value2D.globalShaderData as any, true);
            shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, material.shaderData as any, true);
        } else {
            //default pass
            var shaderPass = this._defaultShader._subShaders[0]._passes;

            if (shaderPass.length >= 1) {
                pass = shaderPass[0];
                //var comDef: DefineDatas = Value2D._compileDefine;
                var shaderIns = pass.withCompile(shaderData.getDefineData(), true) as unknown as WebGLShaderInstance;
                shaderIns.bind();
                shaderIns.uploadUniforms(shaderIns._sprite2DUniformParamsMap, shaderData as any, true);
                shaderIns.uploadRenderStateBlendDepth(shaderData)
            } else {
                //TODO 多pass情况
            }
        }
    }

    //TODO:coverage
    setFilter(value: ColorFilter): void {
        if (!value)
            return;

        this.shaderData.addDefine(value.typeDefine);//搬到setValue中
    }

    clear(): void {
        this.clipOff.x = 0;
        this.clipOff = this.clipOff
    }

    //临时
    setBlend() {
        let data = this.shaderData.getData();
        data[Shader3D.DEPTH_WRITE] = false;
        data[Shader3D.DEPTH_TEST] = RenderState.DEPTHTEST_OFF;
        data[Shader3D.BLEND] = RenderState.BLEND_ENABLE_ALL;
        data[Shader3D.BLEND_EQUATION] = RenderState.BLENDEQUATION_ADD;
        data[Shader3D.BLEND_SRC] = RenderState.BLENDPARAM_ONE;
        data[Shader3D.BLEND_DST] = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
    }

    release(): void {
        if ((--this.ref) < 1) {
            this._inClassCache && (this._inClassCache[this._inClassCache._length++] = this);
            this.clear();
            this.filters = null;
            this.ref = 1;
            this.clipOff.x = 0;
            this.clipOff = this.clipOff
        }
    }
}
