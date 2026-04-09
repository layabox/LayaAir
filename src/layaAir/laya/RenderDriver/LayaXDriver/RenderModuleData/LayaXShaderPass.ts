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

    is2D: boolean = false;
    name: string = "";
    statefirst: boolean = false;
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
        // TODO: sync render state handle to Rust when RenderState FFI is complete
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
    private _onCompileCallback(defineNamesStr: string, setMapNamesStr: string, attributeLocationsStr: string): any {
        try {
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

            // 5. Create shader instance
            const shaderInstance = LayaGL.renderDeviceFactory.createShaderInstance(shaderProcessInfo, this._pass);

            // Return the C++ native object directly — C++ will call getHandle() on it
            if (shaderInstance && (shaderInstance as any)._nativeObj) {
                let nobj = (shaderInstance as any)._nativeObj;
                console.log(`[LayaX-DBG] compile callback OK: shader=${this._pass._owner?._owner?.name} is2D=${this.is2D} nativeObj=${!!nobj}`);
                return nobj;
            }
            console.error(`[LayaX-DBG] compile callback: shaderInstance or _nativeObj is null`);
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
