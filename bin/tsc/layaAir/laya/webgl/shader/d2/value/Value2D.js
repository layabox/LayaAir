import { Shader } from "../../Shader";
import { Shader2X } from "../Shader2X";
import { ShaderDefines2D } from "../ShaderDefines2D";
import { RenderState2D } from "../../../utils/RenderState2D";
import { ILaya } from "../../../../../ILaya";
export class Value2D {
    //public var clipDir:Array = [Context._MAXSIZE, 0, 0, Context._MAXSIZE];		//裁剪信息
    //public var clipRect:Array = [0, 0];						//裁剪位置
    constructor(mainID, subID) {
        this.defines = new ShaderDefines2D();
        this.size = [0, 0];
        this.alpha = 1.0; //这个目前只给setIBVB用。其他的都放到attribute的color中了
        this.ALPHA = 1.0; //这个？
        this.subID = 0;
        this.ref = 1;
        this._cacheID = 0;
        this.clipMatDir = [ILaya.Context._MAXSIZE, 0, 0, ILaya.Context._MAXSIZE];
        this.clipMatPos = [0, 0];
        this.clipOff = [0, 0]; // 裁剪是否需要加上偏移，cacheas normal用
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
    static _initone(type, classT) {
        Value2D._typeClass[type] = classT;
        Value2D._cache[type] = [];
        Value2D._cache[type]._length = 0;
    }
    static __init__() {
    }
    setValue(value) { }
    //throw new Error("todo in subclass");
    //不知道什么意思，这个名字太难懂，反正只有submitIBVB中用到。直接把代码拷贝到哪里
    //public function refresh():ShaderValue
    _ShaderWithCompile() {
        var ret = Shader.withCompile2D(0, this.mainID, this.defines.toNameDic(), this.mainID | this.defines._value, Shader2X.create, this._attribLocation);
        //ret.setAttributesLocation(_attribLocation); 由于上面函数的流程的修改，导致这里已经晚了
        return ret;
    }
    upload() {
        var renderstate2d = RenderState2D;
        // 如果有矩阵的话，就设置 WORLDMAT 宏
        RenderState2D.worldMatrix4 === RenderState2D.TEMPMAT4_ARRAY || this.defines.addInt(ShaderDefines2D.WORLDMAT);
        this.mmat = renderstate2d.worldMatrix4;
        if (RenderState2D.matWVP) {
            this.defines.addInt(ShaderDefines2D.MVP3D);
            this.u_MvpMatrix = RenderState2D.matWVP.elements;
        }
        var sd = Shader.sharders[this.mainID | this.defines._value] || this._ShaderWithCompile();
        if (sd._shaderValueWidth !== renderstate2d.width || sd._shaderValueHeight !== renderstate2d.height) {
            this.size[0] = renderstate2d.width;
            this.size[1] = renderstate2d.height;
            sd._shaderValueWidth = renderstate2d.width;
            sd._shaderValueHeight = renderstate2d.height;
            sd.upload(this, null);
        }
        else {
            sd.upload(this, sd._params2dQuick2 || sd._make2dQuick2());
        }
    }
    //TODO:coverage
    setFilters(value) {
        this.filters = value;
        if (!value)
            return;
        var n = value.length, f;
        for (var i = 0; i < n; i++) {
            f = value[i];
            if (f) {
                this.defines.add(f.type); //搬到setValue中
                f.action.setValue(this);
            }
        }
    }
    clear() {
        this.defines._value = this.subID + (ILaya.WebGL.shaderHighPrecision ? ShaderDefines2D.SHADERDEFINE_FSHIGHPRECISION : 0);
        this.clipOff[0] = 0;
    }
    release() {
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
    static create(mainType, subType) {
        var types = Value2D._cache[mainType | subType];
        if (types._length)
            return types[--types._length];
        else
            return new Value2D._typeClass[mainType | subType](subType);
    }
}
Value2D._cache = [];
Value2D._typeClass = [];
Value2D.TEMPMAT4_ARRAY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
