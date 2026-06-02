import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { LayaGL } from "../../../layagl/LayaGL";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { IShaderPassData } from "../../RenderModuleData/Design/IShaderPassData";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { LayaXDefineDatas } from "./LayaXDefineDatas";
import { LayaXRenderState } from "./LayaXRenderState";

/**
 * LayaX ShaderPass — Rust-backed shader pass with compile callback.
 *
 * When Rust encounters a variant cache miss during ForwardAddFeature::execute,
 * it calls back into C++ → this TS class to compile WGSL and create pipeline.
 *
 * The compile flow:
 * 1. Rust sets compileDefines + setMapNames on the pass
 * 2. Rust invokes compile callback (C++ → TS)
 * 3. TS reads compileDefine + setMapNames, generates WGSL, creates LayaXShaderInstance
 * 4. Returns ProgramHandle to Rust
 */
export class LayaXShaderPass implements IShaderPassData {
    _nativeObj: any;
    private _pass: ShaderPass;
    private _validDefine: LayaXDefineDatas;
    private _renderState: RenderState;
    private _compileCallbackBound: any;
    private _statefirst: boolean = false;

    is2D: boolean = false;
    name: string = "";
    nodeCommonMap: string[] = [];
    additionShaderData: string[] = [];
    attributeLocations: Set<number> = new Set();

    /** @internal set→map names from Rust compile callback, consumed by LayaXShaderInstance._create */
    compileSetMapNames: Map<number, string[]> | null = null;

    constructor(pass: ShaderPass) {
        this._pass = pass;
        this._nativeObj = new (window as any).conchLayaXShaderPass();
        this._nativeObj.create();

        this._validDefine = new LayaXDefineDatas();
        this._renderState = new LayaXRenderState();
        this._renderState.setNull();

        // Register compile callback: Rust → C++ → this function
        this._compileCallbackBound = this._onCompileCallback.bind(this);
        this._nativeObj.setCompileCallback(this._compileCallbackBound);
    }

    get pipelineMode(): string {
        return this._nativeObj._pipelineMode || "";
    }

    set pipelineMode(value: string) {
        this._nativeObj.setPipelineMode(value);
    }

    get validDefine(): IDefineDatas {
        return this._validDefine;
    }

    set validDefine(value: IDefineDatas) {
        this._validDefine = value as LayaXDefineDatas;
        // C++ setValidDefine expects LayaXDefineDatas_JS*, pass the native object (not handle number)
        this._nativeObj.setValidDefine(this._validDefine._nativeObj);
    }

    get renderState(): RenderState {
        return this._renderState;
    }

    set renderState(value: RenderState) {
        this._renderState = value;
    }

    get statefirst(): boolean {
        return this._statefirst;
    }

    set statefirst(value: boolean) {
        this._statefirst = value;
        this._nativeObj?.setStateFirst?.(value);
        if (!value) {
            this._nativeObj?.setRenderStateMask?.(0);
        }
    }

    /**
     * Parse set→map name mapping string from Rust.
     * Format: "0:Scene3D,Global,Shadow;1:BaseCamera;2:Sprite3D"
     * Returns Map<setIndex, mapNames[]>
     */
    private _parseSetMapNames(str: string): Map<number, string[]> {
        const result = new Map<number, string[]>();
        if (!str) return result;

        const parts = str.split(';');
        for (const part of parts) {
            const colonIdx = part.indexOf(':');
            if (colonIdx < 0) continue;
            const setIndex = parseInt(part.substring(0, colonIdx));
            const namesStr = part.substring(colonIdx + 1);
            const names = namesStr ? namesStr.split(',').filter(n => n.length > 0) : [];
            if (!isNaN(setIndex)) {
                result.set(setIndex, names);
            }
        }
        return result;
    }

    /**
     * Parse attribute locations string from Rust.
     * Format: "0,1,2,5"
     * Returns Set<number>
     */
    private _parseAttributeLocations(str: string): Set<number> {
        const result = new Set<number>();
        if (!str) return result;
        const parts = str.split(',');
        for (const part of parts) {
            const num = parseInt(part);
            if (!isNaN(num)) {
                result.add(num);
            }
        }
        return result;
    }

    /**
     * Compile callback invoked by Rust on variant cache miss.
     *
     * @param defineNamesStr - newline-separated define names from Rust (e.g. "DIRECTIONLIGHT\nSHADOWMAP")
     * @param setMapNamesStr - set→map name mapping from Rust (format: "0:Scene3D,Global;1:BaseCamera;2:Sprite3D")
     * @param attributeLocationsStr - attribute locations from Rust (format: "0,1,2,5")
     * @returns LayaXShaderInstance._nativeObj (C++ LayaXShaderInstance_JS*), C++ extracts handle
     */
    /**
     * Sync pass renderState to Rust (仅 statefirst=true 的 pass).
     *
     * 与 WebGL updateRenderState 对齐：
     * statefirst=true 时，pass 的 renderState 非 null 字段覆盖材质默认值。
     * statefirst=false 时，不设置 pass renderState，Rust 侧直接用材质的。
     */
    private _syncRenderState(): void {
        if (!this.statefirst) return;

        const rs = this._renderState;
        if (!rs) return;

        const isSet = (value: any) => value !== null && value !== undefined;
        const mask =
            (isSet(rs.blend) ? 1 << 0 : 0) |
            (isSet(rs.srcBlend) ? 1 << 1 : 0) |
            (isSet(rs.dstBlend) ? 1 << 2 : 0) |
            (isSet(rs.blendEquation) ? 1 << 3 : 0) |
            (isSet(rs.srcBlendRGB) ? 1 << 4 : 0) |
            (isSet(rs.dstBlendRGB) ? 1 << 5 : 0) |
            (isSet(rs.srcBlendAlpha) ? 1 << 6 : 0) |
            (isSet(rs.dstBlendAlpha) ? 1 << 7 : 0) |
            (isSet(rs.blendEquationRGB) ? 1 << 8 : 0) |
            (isSet(rs.blendEquationAlpha) ? 1 << 9 : 0) |
            (isSet(rs.depthTest) ? 1 << 10 : 0) |
            (isSet(rs.depthWrite) ? 1 << 11 : 0) |
            (isSet(rs.stencilTest) ? 1 << 12 : 0) |
            (isSet(rs.stencilRef) ? 1 << 13 : 0) |
            (isSet(rs.stencilReadMask) ? 1 << 14 : 0) |
            (isSet(rs.stencilWriteMask) ? 1 << 15 : 0) |
            (isSet(rs.stencilOp?.x) ? 1 << 16 : 0) |
            (isSet(rs.stencilOp?.y) ? 1 << 17 : 0) |
            (isSet(rs.stencilOp?.z) ? 1 << 18 : 0) |
            (isSet(rs.cull) ? 1 << 19 : 0) |
            (isSet(rs.stencilWrite) ? 1 << 20 : 0) |
            (isSet(rs.depthBias) ? 1 << 21 : 0) |
            (isSet(rs.depthBiasConstant) ? 1 << 22 : 0) |
            (isSet(rs.depthBiasSlopeScale) ? 1 << 23 : 0) |
            (isSet(rs.depthBiasClamp) ? 1 << 24 : 0);

        if (mask === 0) {
            this._nativeObj?.setRenderStateMask?.(0);
            return;
        }

        const D = RenderState.Default;
        const depthWrite = rs.depthWrite ?? D.depthWrite;
        const rsHandle = this._nativeObj.registerRenderState(
            rs.blend ?? D.blend,
            rs.srcBlend ?? D.srcBlend,
            rs.dstBlend ?? D.dstBlend,
            rs.blendEquation ?? D.blendEquation,
            rs.srcBlendRGB ?? D.srcBlendRGB,
            rs.dstBlendRGB ?? D.dstBlendRGB,
            rs.srcBlendAlpha ?? D.srcBlendAlpha,
            rs.dstBlendAlpha ?? D.dstBlendAlpha,
            rs.blendEquationRGB ?? D.blendEquationRGB,
            rs.blendEquationAlpha ?? D.blendEquationAlpha,
            rs.depthTest ?? D.depthTest,
            depthWrite ? 1 : 0,
            rs.stencilTest ?? D.stencilTest,
            (rs.stencilWrite ?? D.stencilWrite) ? 1 : 0,
            rs.stencilRef ?? D.stencilRef,
            rs.stencilReadMask ?? 0xFF,
            rs.stencilWriteMask ?? 0xFF,
            rs.stencilOp?.x ?? D.stencilOp.x,
            rs.stencilOp?.y ?? D.stencilOp.y,
            rs.stencilOp?.z ?? D.stencilOp.z,
            (rs.depthBias ?? D.depthBias) ? 1 : 0,
            rs.depthBiasConstant ?? D.depthBiasConstant,
            rs.depthBiasSlopeScale ?? D.depthBiasSlopeScale,
            rs.depthBiasClamp ?? D.depthBiasClamp,
            rs.cull ?? D.cull,
            1  // CCW default
        );
        if (rsHandle) {
            this._nativeObj?.setRenderStateMask?.(mask);
            this._nativeObj.setRenderState(rsHandle);
        } else {
            this._nativeObj?.setRenderStateMask?.(0);
        }
    }

    private _onCompileCallback(defineNamesStr: string, setMapNamesStr: string, attributeLocationsStr: string): any {
        // Sync pass renderState to Rust on first compile
        this._syncRenderState();

        // 1. Parse define names from Rust (newline-separated → string[])
        const defineStrings = defineNamesStr
            ? defineNamesStr.split('\n').filter(s => s.length > 0)
            : [];

        // 2. Parse set→map name mapping and store for LayaXShaderInstance._create
        this.compileSetMapNames = this._parseSetMapNames(setMapNamesStr);

        // 3. Parse attribute locations
        this.attributeLocations = this._parseAttributeLocations(attributeLocationsStr);

        // 4. Build ShaderProcessInfo directly with define names from Rust
        const shaderProcessInfo: ShaderProcessInfo = {
            is2D: this.is2D,
            vs: this._pass._VS,
            ps: this._pass._PS,
            attributeMap: this._pass._owner._attributeMap,
            uniformMap: this._pass._owner._uniformMap,
            defineString: defineStrings,
        };

        try {
            // 5. Create shader instance
            const shaderInstance = LayaGL.renderDeviceFactory.createShaderInstance(shaderProcessInfo, this._pass);
            if (shaderInstance && (shaderInstance as any)._nativeObj) {
                return (shaderInstance as any)._nativeObj;
            }
            console.error(`LayaXShaderPass compile callback: shaderInstance or _nativeObj is null`);
        } catch (e) {
            const shaderName = this._pass._owner?._owner?.name || "unknown";
            const passIdx = this._pass._owner?._passes?.indexOf(this._pass) ?? -1;
            console.error(`LayaXShaderPass compile callback failed: ${shaderName}_pass${passIdx} defines=[${defineNamesStr?.replace(/\n/g, ',')}]`, e);
        }
        return null;
    }

    setCacheShader(defines: IDefineDatas, shaderInstance: IShaderInstance): void {
        // Caching is handled by Rust's ShaderVariantCache
        // This is a no-op on the TS side for LayaX path
    }

    getCacheShader(defines: IDefineDatas): IShaderInstance {
        // Cache lookup is handled by Rust's ShaderVariantCache
        // TS side returns null; Rust resolves the variant
        return null as any;
    }

    destroy(): void {
        if (this._nativeObj) {
            this._nativeObj.destroy();
        }
        if (this._validDefine) {
            this._validDefine.destroy();
        }
    }
}
