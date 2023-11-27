import { Texture } from "../../../../resource/Texture"
import { ShaderDefines2D } from "../ShaderDefines2D"
import { RenderState2D } from "../../../utils/RenderState2D"
import { RenderTexture2D } from "../../../../resource/RenderTexture2D"
import { Const } from "../../../../Const"
import { ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData"
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D"
import { Material } from "../../../../resource/Material"
import { DefineDatas } from "../../../../RenderEngine/RenderShader/DefineDatas"
import { Vector2 } from "../../../../maths/Vector2"
import { Matrix4x4 } from "../../../../maths/Matrix4x4"
import { Vector4 } from "../../../../maths/Vector4"
import { TextTexture } from "../../../text/TextTexture"

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

    public static _initone(type: number, classT: any): void {
        Value2D._typeClass[type] = classT;
        Value2D._cache[type] = [];
        Value2D._cache[type]._length = 0;
        Value2D.globalShaderData = new ShaderData();
    }

    static TEMPMAT4_ARRAY: any[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    static _compileDefine: DefineDatas = new DefineDatas();
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

    defines: ShaderData = new ShaderData();

    _defaultShader: Shader3D;
    //TODO
    alpha: number = 1.0;	//这个目前只给setIBVB用。其他的都放到attribute的color中了
    //TODO
    ALPHA: number = 1.0;	//这个？

    mainID: RenderSpriteData = RenderSpriteData.Zero;

    ref: number = 1;

    private _inClassCache: any;

    private _cacheID: number = 0;

    /**@internal */
    private _size: Vector2 = new Vector2();

    /**@internal */
    set size(value: Vector2) {
        this.defines.setVector2(ShaderDefines2D.UNIFORM_SIZE, value);
    }

    get size() {
        return this.defines.getVector2(ShaderDefines2D.UNIFORM_SIZE);
    }

    /**@internal */
    private _mmat: Matrix4x4 = new Matrix4x4();

    /**@internal */
    set mmat(value: Matrix4x4) {
        this.defines.setMatrix4x4(ShaderDefines2D.UNIFORM_MMAT, value);
    }

    /**@internal */
    get mmat() {
        return this.defines.getMatrix4x4(ShaderDefines2D.UNIFORM_MMAT);
    }

    filters: any[];

    ///**@internal */
    //private _mvpMatrix: Matrix4x4 = new Matrix4x4();
    /**@internal */
    set u_MvpMatrix(value: Matrix4x4) {
        this.defines.setMatrix4x4(ShaderDefines2D.UNIFORM_MVPMatrix, value);
    }

    get u_MvpMatrix() {
        return this.defines.getMatrix4x4(ShaderDefines2D.UNIFORM_MVPMatrix);
    }

    texture: any;
    private _textureHost: Texture | RenderTexture2D | TextTexture
    public get textureHost(): Texture | RenderTexture2D | TextTexture {
        return this._textureHost
    }
    public set textureHost(value: Texture | RenderTexture2D | TextTexture) {
        this._textureHost = value;
        //var tex = value && value._getSource();
        //@ts-ignore
        this.defines.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, value);
    }
    //public var fillStyle:DrawStyle;			//TODO 这个有什么用？
    _color: Vector4;

    set color(value: Vector4) {
        value && this.defines.setVector(ShaderDefines2D.UNIFORM_COLOR, value);
    }

    get color() {
        return this.defines.getVector(ShaderDefines2D.UNIFORM_COLOR);
    }//Vector4
    //public var strokeStyle:DrawStyle;
    //colorAdd: any[];//Vector4
    _colorAdd: Vector4;

    set colorAdd(value: Vector4) {
        this.defines.setVector(ShaderDefines2D.UNIFORM_COLORADD, value);
    }

    get colorAdd() {
        return this.defines.getVector(ShaderDefines2D.UNIFORM_COLORADD);
    }//Vector4


    private _clipMatDir: Vector4 = new Vector4(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE);

    set clipMatDir(value: Vector4) {
        this.defines.setVector(ShaderDefines2D.UNIFORM_CLIPMATDIR, value);
    }

    get clipMatDir() {
        return this.defines.getVector(ShaderDefines2D.UNIFORM_CLIPMATDIR);
    }//Vector4

    private _clipMatpos: Vector2 = new Vector2();
    set clipMatPos(value: Vector2) {
        this.defines.setVector2(ShaderDefines2D.UNIFORM_CLIPMATPOS, value);
    }

    get clipMatPos() {
        return this.defines.getVector2(ShaderDefines2D.UNIFORM_CLIPMATPOS);
    }//Vector2
    //clipMatPos: Array<number> = [0, 0];//Vector2
    _clipOff: Vector2 = new Vector2();//vector2			// 裁剪是否需要加上偏移，cacheas normal用
    set clipOff(value: Vector2) {
        this.defines.setVector2(ShaderDefines2D.UNIFORM_CLIPOFF, value);
    }

    get clipOff() {
        return this.defines.getVector2(ShaderDefines2D.UNIFORM_CLIPOFF);
    }//Vector2

    constructor(mainID: RenderSpriteData) {
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

    /**
     * 组织Define宏数据
     */
    public updateShaderData() {
        var renderstate2d: any = RenderState2D;
        // 如果有矩阵的话，就设置 WORLDMAT 宏
        RenderState2D.worldMatrix4 === RenderState2D.TEMPMAT4_ARRAY || this.defines.addDefine(ShaderDefines2D.WORLDMAT);
        this._mmat.cloneByArray(renderstate2d.worldMatrix4);
        this.mmat = this._mmat;

        if (RenderState2D.matWVP) {
            this.defines.addDefine(ShaderDefines2D.MVP3D);
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
            this.defines.addDefine(ShaderDefines2D.GAMMATEXTURE);
        } else {
            this.defines.removeDefine(ShaderDefines2D.GAMMATEXTURE);
        }

        if (returnGamma) {
            this.defines.addDefine(ShaderDefines2D.GAMMASPACE);
        } else {
            this.defines.removeDefine(ShaderDefines2D.GAMMASPACE);
        }

        if (RenderState2D.InvertY) {
            this.defines.addDefine(ShaderDefines2D.INVERTY);
        } else {
            this.defines.removeDefine(ShaderDefines2D.INVERTY);
        }

        if (this.mainID == RenderSpriteData.Texture2D) {
            this.defines.addDefine(ShaderDefines2D.TEXTURESHADER);
        }
        if (this.mainID == RenderSpriteData.Primitive) {
            this.defines.addDefine(ShaderDefines2D.PRIMITIVESHADER);
        }
    }

    upload(material: Material = null): void {

        this._size.setValue(RenderState2D.width, RenderState2D.height)
        this.size = this._size;
        //update owner ShaderData
        this.updateShaderData();
        if (material) {
            //Custom Shader
            var shaderPass = material._shader._subShaders[0]._passes;
            
            var pass;
            for (var j: number = 0, m: number = shaderPass.length; j < m; j++) {
                pass = shaderPass[j];
                //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
                if (pass._pipelineMode == "Forward")
                    break;
            }
            var comDef: DefineDatas = Value2D._compileDefine;
            this.defines._defineDatas.cloneTo(Value2D._compileDefine);
            //mateiral Define
            Value2D._compileDefine.addDefineDatas(material._defineDatas);
            //Global Define
            Value2D._compileDefine.addDefineDatas(Value2D.globalShaderData._defineDatas);
            var shaderIns = pass.withCompile(Value2D._compileDefine, true);
            shaderIns.bind();
            shaderIns.uploadUniforms(shaderIns._sprite2DUniformParamsMap, this.defines, true);
            shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, Value2D.globalShaderData, true);
            shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, material.shaderData, true);
        } else {
            //default pass
            var shaderPass = this._defaultShader._subShaders[0]._passes;

            if (shaderPass.length >= 1) {
                pass = shaderPass[0];
                //var comDef: DefineDatas = Value2D._compileDefine;
                var shaderIns = pass.withCompile(this.defines._defineDatas, true);
                shaderIns.bind();
                shaderIns.uploadUniforms(shaderIns._sprite2DUniformParamsMap, this.defines, true);
            } else {
                //TODO 多pass情况
            }
        }
    }

    //TODO:coverage
    setFilters(value: any[]): void {
        this.filters = value;
        if (!value)
            return;

        var n: number = value.length, f: any;
        for (var i: number = 0; i < n; i++) {
            f = value[i];
            if (f) {
                this.defines.addDefine(f.typeDefine);//搬到setValue中
                f.action.setValue(this);
            }
        }
    }

    clear(): void {
        this.clipOff.x = 0;
        this.clipOff = this.clipOff
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


