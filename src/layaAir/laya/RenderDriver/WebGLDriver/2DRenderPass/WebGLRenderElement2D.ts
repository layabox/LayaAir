import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Vector2 } from "../../../maths/Vector2";
import { Stat } from "../../../utils/Stat";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebRenderStruct2D } from "../../RenderModuleData/WebModuleData/2D/WebRenderStruct2D";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLRenderGeometryElement } from "../RenderDevice/WebGLRenderGeometryElement";
import { WebGLShaderInstance } from "../RenderDevice/WebGLShaderInstance";
import { WebglRenderContext2D } from "./WebGLRenderContext2D";

/**
 * 每个 pass key 对应的编译缓存条目
 * element 在不同 (passData, invertY, gamma) 组合下各自缓存一份编译结果
 */
export class Pass2DCacheInfo {
    shaderInss: WebGLShaderInstance[] = [];
    /** 本条目上次编译时的时间戳 x（loopCount），用于与各 changeFlag 比较 */
    cacheFlagX: number = -1;
    /** 本条目上次编译时的时间戳 y（framePassCount），用于与各 changeFlag 比较 */
    cacheFlagY: number = -1;
    /** 本条目上次编译时的 dirtyVersion */
    cachedDirtyVersion: number = -1;
    /** 本条目对应的 passData define 变化标记（稳定注册在 passData._defineDatas 上） */
    passDefineFlag: Vector2 = new Vector2(-1, -1);
    /** 注册 passDefineFlag 的 passData 引用，用于 destroy 时注销 */
    trackedPassData: WebGLShaderData;
}

export class WebGLRenderElement2D implements IRenderElement2D {
    owner: WebRenderStruct2D;
    nodeCommonMap: string[];
    renderStateIsBySprite: boolean = true;

    type: number = 0;
    /** @internal */
    static _compileDefine: WebDefineDatas = new WebDefineDatas();
    geometry: WebGLRenderGeometryElement;

    // ---- 共享变化标记，注册到所有 element 级 define 数据源 ----
    protected _defineChangeFlag: Vector2 = new Vector2(-1, -1);
    /**
     * 引用变化版本号，setter 触发时递增
     * 每个 pass cache 条目各自记录上次编译时的版本，跨 pass 不互相干扰
     */
    protected _dirtyVersion: number = 0;

    // ---- per-pass-key 编译缓存 ----
    // 外层 key 为 passData（null 表示无 passData），内层数组长度 4，索引 = (invertY ? 2 : 0) | (gamma ? 1 : 0)
    protected _passCache: Map<WebGLShaderData, Pass2DCacheInfo[]> = new Map();
    /** @internal */
    _curCacheEntry: Pass2DCacheInfo;

    // ---- 通过 setter 拦截赋值，自动注册/注销 changeFlag ----

    private _subShader: SubShader;
    public get subShader(): SubShader { return this._subShader; }
    public set subShader(value: SubShader) {
        if (this._subShader !== value) {
            this._subShader = value;
            this._dirtyVersion++;
        }
    }

    private _materialShaderData: WebGLShaderData;
    public get materialShaderData(): WebGLShaderData { return this._materialShaderData; }
    public set materialShaderData(value: WebGLShaderData) {
        if (this._materialShaderData !== value) {
            this._unregisterDefineFlag(this._materialShaderData);
            this._materialShaderData = value;
            this._registerDefineFlag(value);
            this._dirtyVersion++;
        }
    }

    private _value2DShaderData: WebGLShaderData;
    public get value2DShaderData(): WebGLShaderData { return this._value2DShaderData; }
    public set value2DShaderData(value: WebGLShaderData) {
        if (this._value2DShaderData !== value) {
            this._unregisterDefineFlag(this._value2DShaderData);
            this._value2DShaderData = value;
            this._registerDefineFlag(value);
            this._dirtyVersion++;
        }
    }

    private _globalShaderData: WebGLShaderData;
    /** @internal */
    public get globalShaderData(): WebGLShaderData { return this._globalShaderData; }
    public set globalShaderData(value: WebGLShaderData) {
        if (this._globalShaderData !== value) {
            this._unregisterDefineFlag(this._globalShaderData);
            this._globalShaderData = value;
            this._registerDefineFlag(value);
            this._dirtyVersion++;
        }
    }

    protected _registerDefineFlag(data: WebGLShaderData): void {
        data?._defineDatas?.addChangeFlagInfo(this._defineChangeFlag);
    }

    protected _unregisterDefineFlag(data: WebGLShaderData): void {
        data?._defineDatas?.removeChangeFlagInfo(this._defineChangeFlag);
    }

    /**
     * 获取或创建当前 pass key 对应的缓存条目
     * 新建时将 passDefineFlag 注册到 passData._defineDatas 上
     */
    private _getOrCreateCacheEntry(context: WebglRenderContext2D): Pass2DCacheInfo {
        let pd = context.passData || null;
        let arr = this._passCache.get(pd);
        if (!arr) {
            arr = [null, null, null, null];
            this._passCache.set(pd, arr);
        }
        let gamma = !context._destRT || context._destRT._textures[0].gammaCorrection != 1;
        let idx = (context.invertY ? 2 : 0) | (gamma ? 1 : 0);
        let entry = arr[idx];
        if (!entry) {
            entry = new Pass2DCacheInfo();
            if (pd?._defineDatas) {
                pd._defineDatas.addChangeFlagInfo(entry.passDefineFlag);
                entry.trackedPassData = pd;
            }
            arr[idx] = entry;
        }
        return entry;
    }

    protected _compileShader(context: WebglRenderContext2D) {
        var passes: ShaderPass[] = this._subShader._passes;
        let entry = this._curCacheEntry;
        let renderCount = 0;

        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            var pass: ShaderPass = passes[j];
            //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
            if (pass.pipelineMode !== context.pipelineMode)
                continue;

            var comDef = WebGLRenderElement2D._compileDefine;

            if (this._globalShaderData) {
                this._globalShaderData._defineDatas.cloneTo(comDef);
            } else {
                context._globalConfigShaderData.cloneTo(comDef);
            }

            if (context.passData) {
                comDef.addDefineDatas(context.passData._defineDatas);
            }

            let returnGamma: boolean = !(context._destRT) || ((context._destRT)._textures[0].gammaCorrection != 1);
            if (returnGamma) {
                comDef.add(ShaderDefines2D.GAMMASPACE);
            } else {
                comDef.remove(ShaderDefines2D.GAMMASPACE);
            }

            if (context.invertY) {
                comDef.add(ShaderDefines2D.INVERTY);
            } else {
                comDef.remove(ShaderDefines2D.INVERTY);
            }

            if (this._value2DShaderData) {
                comDef.addDefineDatas(this._value2DShaderData.getDefineData());
                pass.nodeCommonMap = this.nodeCommonMap;
            }

            if (this._materialShaderData)
                comDef.addDefineDatas(this._materialShaderData._defineDatas);

            var shaderIns = pass.withCompile(comDef, true) as WebGLShaderInstance;
            entry.shaderInss[renderCount++] = shaderIns;
        }
        entry.shaderInss.length = renderCount;
    }

    _prepare(context: WebglRenderContext2D) {
        this.globalShaderData = this.owner && this.owner._globalShaderData as WebGLShaderData;

        let entry = this._getOrCreateCacheEntry(context);
        this._curCacheEntry = entry;

        let cfx = entry.cacheFlagX, cfy = entry.cacheFlagY;
        let dcf = this._defineChangeFlag;
        let pdf = entry.passDefineFlag;
        if (entry.cachedDirtyVersion !== this._dirtyVersion
            || dcf.x > cfx || (dcf.x === cfx && dcf.y > cfy)
            || pdf.x > cfx || (pdf.x === cfx && pdf.y > cfy)) {
            entry.cachedDirtyVersion = this._dirtyVersion;
            entry.cacheFlagX = Stat.loopCount;
            entry.cacheFlagY = WebGLEngine.instance._framePassCount;
            this._compileShader(context);
        }
    }

    _render(context: WebglRenderContext2D) {
        // 非 Primitive 元素打断快速路径链
        context._prevTypeKey = -1;
        context._prevTextureKey = -1;
        context._prevClip = null;
        context._prevShaderIns = null;

        let inss = this._curCacheEntry.shaderInss;
        let count = inss.length;
        if (count === 1) {
            this.renderByShaderInstance(inss[0], context);
        } else {
            for (let j = 0; j < count; j++) {
                this.renderByShaderInstance(inss[j], context);
            }
        }
    }

    protected _uploadGlobalAndPass(shader: WebGLShaderInstance, context: WebglRenderContext2D) {
        this._globalShaderData && shader.uploadUniforms(shader._cameraUniformParamsMap, this._globalShaderData, true);
        context.passData && shader.uploadUniforms(shader._sceneUniformParamsMap, context.passData, true);
    }

    renderByShaderInstance(shader: WebGLShaderInstance, context: WebglRenderContext2D) {
        if (!shader.complete || !this.geometry)
            return
        shader.bind();
        this._uploadGlobalAndPass(shader, context);

        this._value2DShaderData && shader.uploadUniforms(shader._sprite2DUniformParamsMap, this._value2DShaderData, true);
        this._materialShaderData && shader.uploadUniforms(shader._materialUniformParamsMap, this._materialShaderData, true);
        //blend
        if (this.renderStateIsBySprite || !this._materialShaderData) {
            shader.uploadRenderStateBlendDepth(this._value2DShaderData);
            shader.uploadRenderStateFrontFace(this._value2DShaderData, false, context.invertY);
        } else {
            shader.uploadRenderStateBlendDepth(this._materialShaderData);
            shader.uploadRenderStateFrontFace(this._materialShaderData, false, context.invertY);
        }

        WebGLEngine.instance.getDrawContext().drawGeometryElement(this.geometry);
    }

    destroy(): void {
        this._unregisterDefineFlag(this._globalShaderData);
        this._unregisterDefineFlag(this._materialShaderData);
        this._unregisterDefineFlag(this._value2DShaderData);
        // 注销所有 pass 条目上的 passDefineFlag
        if (this._passCache) {
            this._passCache.forEach(arr => {
                for (let i = 0; i < 4; i++) {
                    let entry = arr[i];
                    if (entry) {
                        entry.trackedPassData?._defineDatas?.removeChangeFlagInfo(entry.passDefineFlag);
                    }
                }
            });
        }
        this._globalShaderData = null;
        this._materialShaderData = null;
        this._value2DShaderData = null;
        this._passCache = null;
        this._curCacheEntry = null;
        this.owner = null;
        if ((this as any)._ownerMaterial) {
            (this as any)._ownerMaterial._removeOwnerElement(this);
            (this as any)._ownerMaterial = null;
        }
    }
}
