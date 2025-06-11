import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";
import { NotImplementedError } from "../../../utils/Error";
import { WebGPUBindGroupHelper, WebGPUBindingInfoType, WebGPUUniformPropertyBindingInfo } from "./WebGPUBindGroupHelper";
import { WebGPURenderContext3D } from "../3DRenderPass/WebGPURenderContext3D";
import { GLSLForVulkanGenerator } from "./GLSLForVulkanGenerator";
import { WebGPURenderGeometry } from "./WebGPURenderGeometry";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { LayaGL } from "../../../layagl/LayaGL";
import { WebGPUCommandUniformMap } from "./WebGPUCommandUniformMap";
import { WebGPURenderContext2D } from "../2DRenderPass/WebGPURenderContext2D";


/**
 * WebGPU着色器实例
 */
export class WebGPUShaderInstance implements IShaderInstance {
    static idCounter: number = 0;

    private _vsShader: GPUShaderModule;

    get vertexModule(): GPUShaderModule {
        return this._vsShader;
    }

    private _fsShader: GPUShaderModule;

    get fragmentModule(): GPUShaderModule {
        return this._fsShader;
    }

    private _destroyed: boolean = false;

    private _commanMap: string[] = [];

    /**
     * @internal
     */
    _id: number = WebGPUShaderInstance.idCounter++;

    /**
     * @internal
     */
    _shaderPass: ShaderPass;

    name: string;

    complete: boolean = false;

    uniformSetMap: Map<number, WebGPUUniformPropertyBindingInfo[]> = new Map();

    private uniformResourcesCacheKey: Map<number, string[]> = new Map();

    /** @internal */
    uniformTextureExits: Map<number, number> = new Map();

    constructor(name: string) {
        this.name = name;
    }

    _serializeShader(): ArrayBuffer {
        throw new NotImplementedError();
    }

    _deserialize(buffer: ArrayBuffer): boolean {
        throw new NotImplementedError();
    }

    /**
     * 创建ShaderInstance
     * @param shaderProcessInfo 
     * @param shaderPass 
     */
    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
        const engine = WebGPURenderEngine._instance;
        const device = engine.getDevice();
        this._shaderPass = shaderPass;

        if (!shaderProcessInfo.is2D) {
            this._create3D();
        } else {
            this._create2D();
        }

        let attriLocArray = ((shaderPass.moduleData as any).geo as WebGPURenderGeometry).bufferState._attriLocArray;

        let filteredAttributeMap: Record<string, [number, ShaderDataType]> = {};
        let noUseAttributeMap: Record<string, [number, ShaderDataType]> = {};//收集没有用到的attributeMap
        for (const [key, value] of Object.entries(shaderProcessInfo.attributeMap)) {
            if (attriLocArray.has(value[0])) {
                filteredAttributeMap[key] = value;
            } else {
                noUseAttributeMap[key] = value;
            }
        }

        let useTexSet = new Set<string>();
        //如果是3D  只对set2（Node） 和set3（Material）的纹理进行剔除   如果剔除scene和camera 会产生大量的bindGroup
        //如果是2D  TODO  暂时先不做剔出
        let cullTextureSetLayer = shaderProcessInfo.is2D ? 3 : 2;
        // 检测出新的uniform添加到的set position
        let appendSet = shaderProcessInfo.is2D ? 2 : 3;
        /**
         * 编译 shader 时可能检出新的 uniform
         * 将新检出的 uniform 添加到 material map 中
         */
        const glslObj = GLSLForVulkanGenerator.process(shaderProcessInfo.defineString, [filteredAttributeMap, noUseAttributeMap], this.uniformSetMap, shaderPass.name, shaderPass._owner._uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps, useTexSet, cullTextureSetLayer, appendSet);

        this._generateMaterialCommandMap();
        this.uniformResourcesCacheKey.set(appendSet, [shaderPass.name]);

        //去除无用的TextureBinding
        {
            let textureIndices: number[] = [];
            for (const texName of useTexSet) {
                let propertyIDName = texName;
                // 去掉_texture和_Sample前缀
                if (propertyIDName.endsWith("_Texture")) {
                    textureIndices.push(WebGPURenderEngine._instance.propertyNameToID(propertyIDName.substring(0, propertyIDName.length - 8)));
                }
            }
            // 遍历uniformSetMap，移除不在textureIndices中的纹理
            for (const [setIndex, bindInfoArray] of this.uniformSetMap) {
                if (setIndex < cullTextureSetLayer) {
                    continue;
                }
                // 创建一个新数组来存储过滤后的绑定信息
                let filteredBindInfoArray: WebGPUUniformPropertyBindingInfo[] = [];

                for (const bindInfo of bindInfoArray) {
                    // 检查是否为纹理类型
                    if (bindInfo.sampler || bindInfo.texture) {
                        // 检查该纹理是否在textureIndices中
                        if (textureIndices.includes(bindInfo.propertyId)) {
                            filteredBindInfoArray.push(bindInfo);
                        }
                    } else {
                        // 非纹理类型直接保留
                        filteredBindInfoArray.push(bindInfo);
                    }
                }
                // 用过滤后的数组替换原数组
                this.uniformSetMap.set(setIndex, filteredBindInfoArray);
            }
        }

        {
            let subShader = this._shaderPass._owner;
            let shader = subShader.owner;

            let subIndex = shader._subShaders.indexOf(subShader);
            let passIndex = subShader._passes.indexOf(this._shaderPass);
            let vertexSpvRes = engine.shaderCompiler.glslang.glsl450_to_spirv(glslObj.vertex, "vertex");
            if (!vertexSpvRes.success) {
                console.error(`${shader.name}_sub${subIndex}_pass${passIndex}`);
                console.error(vertexSpvRes.info_log);
            }
            let vertexSpirv = vertexSpvRes.spirv;

            let vertexWgsl = engine.shaderCompiler.naga.spirv_to_wgsl(new Uint8Array(vertexSpirv.buffer, vertexSpirv.byteOffset, vertexSpirv.byteLength), false);
            // let vertexWgsl = engine.shaderCompiler.naga.glsl_to_wgsl(glslObj.vertex, "vertex", true);

            let fragmentSpvRes = engine.shaderCompiler.glslang.glsl450_to_spirv(glslObj.fragment, "fragment");

            if (!fragmentSpvRes.success) {
                console.error(`${shader.name}_sub${subIndex}_pass${passIndex}`);
                console.error(fragmentSpvRes.info_log);
            }
            let fragmentSpv = new Uint8Array(fragmentSpvRes.spirv.buffer, fragmentSpvRes.spirv.byteOffset, fragmentSpvRes.spirv.byteLength);

            let fragmentWgsl = engine.shaderCompiler.naga.spirv_to_wgsl(fragmentSpv, false);
            // let fragmentWgsl = engine.shaderCompiler.naga.glsl_to_wgsl(glslObj.fragment, "fragment", true);

            this._vsShader = device.createShaderModule({ label: this.name, code: vertexWgsl });
            this._vsShader.getCompilationInfo().then(info => {
                if (info.messages.length > 0) {
                    let subShader = this._shaderPass._owner;
                    let shader = subShader.owner;
                    let subIndex = shader._subShaders.indexOf(subShader);
                    let passIndex = subShader._passes.indexOf(this._shaderPass);
                    console.group(`Vertex shader compilation details for ${shader.name}_s${subIndex}_p${passIndex}:`);
                    for (const msg of info.messages) {
                        const type = msg.type === "error" ? "ERROR" : "WARNING";
                        console.warn(`${type} [${msg.lineNum}:${msg.linePos}]: ${msg.message}`);
                    }
                    console.groupEnd();
                }
            });
            this._fsShader = device.createShaderModule({ label: this.name, code: fragmentWgsl });
            this._fsShader.getCompilationInfo().then(info => {
                if (info.messages.length > 0) {
                    let subShader = this._shaderPass._owner;
                    let shader = subShader.owner;
                    let subIndex = shader._subShaders.indexOf(subShader);
                    let passIndex = subShader._passes.indexOf(this._shaderPass);
                    console.group(`Fragment shader compilation details for ${shader.name}_s${subIndex}_p${passIndex}:`);
                    for (const msg of info.messages) {
                        const type = msg.type === "error" ? "ERROR" : "WARNING";
                        console.warn(`${type} [${msg.lineNum}:${msg.linePos}]: ${msg.message}`);
                    }
                    console.groupEnd();
                }
            });
        }

        {
            this.uniformResourcesCacheKey.forEach((names, index) => {
                let bitOffset = 0;
                let textureExits = 0;
                let resources = this.uniformSetMap.get(index);
                names.forEach(name => {
                    let map = LayaGL.renderDeviceFactory.createGlobalUniformMap(name) as WebGPUCommandUniformMap;
                    resources.forEach(resource => {
                        let propertyID = resource.propertyId;
                        if (map.hasPtrID(propertyID)) {
                            switch (resource.type) {
                                case WebGPUBindingInfoType.sampler:
                                    let textureBit = map._textureBits.get(propertyID) + bitOffset;
                                    let posMask = 1 << textureBit;
                                    textureExits |= posMask;
                                    break;
                                default:
                                    break;
                            }
                        }
                    });

                    bitOffset += map._textureCount;
                });

                this.uniformTextureExits.set(index, textureExits);
            });
        }

        this.complete = true;
    }

    private _generateMaterialCommandMap() {
        let shaderpass = this._shaderPass;
        let map = (LayaGL.renderDeviceFactory.createGlobalUniformMap(shaderpass.name) as WebGPUCommandUniformMap);
        if (map._idata.size == 0) {
            //组织一下
            for (const [key, value] of shaderpass._owner._uniformMap) {
                if (value.arrayLength > 0) {
                    map.addShaderUniformArray(value.id, value.propertyName, value.uniformtype, value.arrayLength);
                }
                else {
                    map.addShaderUniform(value.id, value.propertyName, value.uniformtype);
                }
            }
            map._stateID = LayaGL.renderEngine.propertyNameToID("Material");
        }
    }

    private _create2D(): void {
        let shaderpass = this._shaderPass;
        let context = WebGPURenderContext2D._instance;
        // sprite2DGlobal
        if (context._needGlobalData()) {
            let globalArray = ["Sprite2DGlobal"];
            this.uniformSetMap.set(0, WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(0, globalArray));
            this.uniformResourcesCacheKey.set(0, globalArray);
        }
        else {
            let globalArray: string[] = [];
            this.uniformResourcesCacheKey.set(0, globalArray);
            this.uniformSetMap.set(0, []);
        }

        this._commanMap = shaderpass.nodeCommonMap ? shaderpass.nodeCommonMap.slice() : [];
        this.uniformResourcesCacheKey.set(1, this._commanMap);
        this.uniformSetMap.set(1, WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(1, this._commanMap));

        let emptyArray: string[] = [];
        this.uniformResourcesCacheKey.set(3, emptyArray);
        this.uniformSetMap.set(3, []);
    }

    private _create3D(): void {
        let shaderPass = this._shaderPass;
        //global
        let context = WebGPURenderContext3D._instance;

        let preDrawUniforms = context._preDrawUniformMaps;
        let preDrawArray = Array.from(preDrawUniforms);
        this.uniformSetMap.set(0, WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(0, preDrawArray));
        this.uniformResourcesCacheKey.set(0, preDrawArray);

        //camera
        let cameraArray = ["BaseCamera"];
        this.uniformSetMap.set(1, WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(1, cameraArray));
        this.uniformResourcesCacheKey.set(1, cameraArray);

        //sprite+additional
        this._commanMap = this._commanMap.concat(shaderPass.moduleData.nodeCommonMap, shaderPass.moduleData.additionShaderData);
        this.uniformSetMap.set(2, WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(2, this._commanMap));
        this.uniformResourcesCacheKey.set(2, this._commanMap);
    }

    /**
     * 销毁
     */
    _disposeResource(): void {
        if (!this._destroyed) {
            WebGPUGlobal.releaseId(this);
            this._destroyed = true;
            this.uniformSetMap.clear();
            this.uniformResourcesCacheKey.clear();
            this.uniformTextureExits.clear();
        }
    }
}