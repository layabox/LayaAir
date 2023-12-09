import { Texture } from "../../../../resource/Texture"
import { Shader } from "../../Shader"
import { ShaderValue } from "../../ShaderValue"
import { Shader2D } from "../Shader2D"
import { Shader2X } from "../Shader2X"
import { ShaderDefines2D } from "../ShaderDefines2D"
import { RenderState2D } from "../../../utils/RenderState2D"
import { RenderTexture2D } from "../../../../resource/RenderTexture2D"
import { Const } from "../../../../Const"
import { TextTexture } from "../../../text/TextTexture"

export class Value2D {
    protected static _cache: any[] = [];
    protected static _typeClass: any = [];

    static TEMPMAT4_ARRAY: any[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    public static _initone(type: number, classT: any): void {
        Value2D._typeClass[type] = classT;
        Value2D._cache[type] = [];
        Value2D._cache[type]._length = 0;
    }

    static create(mainType: number, subType: number): Value2D {
        var types: any = Value2D._cache[mainType | subType];
        if (types._length) {
            let value: Value2D = types[--types._length];
            value.resetValue();
            return value;
        }
        else {
            return new Value2D._typeClass[mainType | subType](subType);
        }
    }


    static __init__(): void {
    }

    defines: ShaderDefines2D = new ShaderDefines2D();


    size: any[] = [0, 0];

    alpha: number = 1.0;	//这个目前只给setIBVB用。其他的都放到attribute的color中了
    mmat: any[];		//worldmatrix，是4x4的，因为为了shader使用方便。 TODO 换成float32Array
    u_MvpMatrix: any[];
    texture: any;

    ALPHA: number = 1.0;	//这个？

    shader: Shader;

    mainID: number;
    subID: number = 0;
    filters: any[];

    textureHost: Texture | RenderTexture2D | TextTexture;
    //public var fillStyle:DrawStyle;			//TODO 这个有什么用？
    color: any[];
    //public var strokeStyle:DrawStyle;
    colorAdd: any[];
    u_mmat2: any[];
    ref: number = 1;
    protected _attribLocation: any[];	//[name,location,name,location...] 由继承类赋值。这个最终会传给对应的shader

    private _inClassCache: any;
    private _cacheID: number = 0;
    clipMatDir: any[] = [Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE];
    clipMatPos: any[] = [0, 0];
    clipOff: any[] = [0, 0];			// 裁剪是否需要加上偏移，cacheas normal用
    //public var clipDir:Array = [Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE];		//裁剪信息
    //public var clipRect:Array = [0, 0];						//裁剪位置

    constructor(mainID: number, subID: number) {
        this.mainID = mainID;
        this.subID = subID;

        this.textureHost = null;
        this.texture = null;
        //this.fillStyle = null;
        this.color = null;
        //this.strokeStyle = null;
        this.colorAdd = null;
        this.u_mmat2 = null;

        this._cacheID = mainID | subID;
        this._inClassCache = Value2D._cache[this._cacheID];
        if (mainID > 0 && !this._inClassCache) {
            this._inClassCache = Value2D._cache[this._cacheID] = [];
            this._inClassCache._length = 0;
        }
        this.clear();

    }

    setValue(value: Shader2D): void { }
    //throw new Error("todo in subclass");

    //不知道什么意思，这个名字太难懂，反正只有submitIBVB中用到。直接把代码拷贝到哪里
    //public function refresh():ShaderValue

    private _ShaderWithCompile(): Shader2X {
        var ret: Shader2X = (<Shader2X>Shader.withCompile2D(0, this.mainID, this.defines.toNameDic(), this.mainID | this.defines._value, Shader2X.create, this._attribLocation));
        //ret.setAttributesLocation(_attribLocation); 由于上面函数的流程的修改，导致这里已经晚了
        return ret;
    }
    public updateShaderData() {
        var renderstate2d: any = RenderState2D;
        // 如果有矩阵的话，就设置 WORLDMAT 宏
        RenderState2D.worldMatrix4 === RenderState2D.TEMPMAT4_ARRAY || this.defines.addInt(ShaderDefines2D.WORLDMAT);
        this.mmat = renderstate2d.worldMatrix4;

        if (RenderState2D.matWVP) {
            this.defines.addInt(ShaderDefines2D.MVP3D);
            this.u_MvpMatrix = RenderState2D.matWVP.elements;
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
            this.defines.addInt(ShaderDefines2D.GAMMATEXTURE);
        } else {
            this.defines.remove(ShaderDefines2D.GAMMATEXTURE);
        }

        if (returnGamma) {
            this.defines.addInt(ShaderDefines2D.GAMMASPACE);
        } else {
            this.defines.remove(ShaderDefines2D.GAMMASPACE);
        }

        if (RenderState2D.InvertY) {
            this.defines.addInt(ShaderDefines2D.INVERTY);
        } else {
            this.defines.remove(ShaderDefines2D.INVERTY);
        }
    }
    upload(): void {
        var renderstate2d: any = RenderState2D;

        this.updateShaderData();


        var sd: Shader2X = Shader.sharders[this.mainID | this.defines._value] || this._ShaderWithCompile();

        if (sd._shaderValueWidth !== renderstate2d.width || sd._shaderValueHeight !== renderstate2d.height) {
            this.size[0] = renderstate2d.width;
            this.size[1] = renderstate2d.height;
            sd._shaderValueWidth = renderstate2d.width;
            sd._shaderValueHeight = renderstate2d.height;
            sd.upload((<ShaderValue>this), null);
        }
        else {
            sd.upload((<ShaderValue>this), sd._params2dQuick2 || sd._make2dQuick2());
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
                this.defines.add(f.type);//搬到setValue中
                f.action.setValue(this);
            }
        }
    }

    clear(): void {
        this.defines._value = this.subID;
        this.clipOff[0] = 0;
    }

    /**
     * 重设Value2D内容
     */
    resetValue(): void {
        this.textureHost = null;
    }

    release(): void {
        if ((--this.ref) < 1) {
            this._inClassCache && (this._inClassCache[this._inClassCache._length++] = this);
            //this.fillStyle = null;
            //this.strokeStyle = null;
            this.clear();
            this.filters = null;
            this.ref = 1;
            this.clipOff[0] = 0;
        }
    }


}


