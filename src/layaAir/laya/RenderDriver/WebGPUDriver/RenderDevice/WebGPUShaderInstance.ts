import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUBindingInfoType, WebGPUCodeGenerator, WebGPUUniformPropertyBindingInfo } from "./WebGPUCodeGenerator";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";
import { NotImplementedError } from "../../../utils/Error";
import { WebGPUCommandUniformMap } from "./WebGPUCommandUniformMap";
import { LayaGL } from "../../../layagl/LayaGL";
import { WebGPUBindGroupHelper } from "./WebGPUBindGroupHelper";

/**
 * WebGPU着色器实例
 */
export class WebGPUShaderInstance implements IShaderInstance {
    static idCounter: number = 0;

    /**
     * @internal
     */
    _id: number = WebGPUShaderInstance.idCounter++;
    /**
     * @internal
     */
    _shaderPass: ShaderPass;

    private _vsShader: GPUShaderModule;
    private _fsShader: GPUShaderModule;

    private _destroyed: boolean = false;

    private _gpuPipelineLayout: GPUPipelineLayout;

    name: string;
    complete: boolean = false;

    uniformInfo: WebGPUUniformPropertyBindingInfo[];
    uniformSetMap: { [set: number]: WebGPUUniformPropertyBindingInfo[] } = {};

    globalId: number;

    //根据Sprite，additionnal分别记录资源列表
    _cacheSpriteBindGroupDescriptor: GPUBindGroupDescriptor;
    _additionalEntryGroup: Map<string, WebGPUUniformPropertyBindingInfo[]>;
    _spriteEntryGroup: WebGPUUniformPropertyBindingInfo[] = [];

    _nodeUniformMaps: string[];
    _nodeBindGroupKey: string;

    constructor(name: string) {
        this.name = name;
        this.globalId = WebGPUGlobal.getId(this);
    }

    _serializeShader(): ArrayBuffer {
        throw new NotImplementedError();
    }

    _deserialize(buffer: ArrayBuffer): boolean {
        throw new NotImplementedError();
    }

    /**
     * 获取渲染管线描述
     */
    getRenderPipelineDescriptor() {
        //设置颜色目标模式
        const colorTargetState: GPUColorTargetState = {
            format: 'bgra8unorm',
            blend: {
                alpha: {
                    srcFactor: 'src-alpha',
                    dstFactor: 'one-minus-src-alpha',
                    operation: 'add',
                },
                color: {
                    srcFactor: 'src-alpha',
                    dstFactor: 'one-minus-src-alpha',
                    operation: 'add',
                },
            },
            writeMask: GPUColorWrite.ALL,
        };

        //设置渲染管线描述
        const renderPipelineDescriptor: GPURenderPipelineDescriptor = {
            label: 'render',
            layout: 'auto',
            vertex: {
                buffers: [],
                module: this._vsShader,
                entryPoint: 'main',
            },
            fragment: {
                module: this._fsShader,
                entryPoint: 'main',
                targets: [colorTargetState],
            },
            primitive: {
                topology: 'triangle-list',
                frontFace: 'ccw',
                cullMode: 'back',
            },
            depthStencil: {
                format: 'depth24plus-stencil8',
                depthWriteEnabled: true,
                depthCompare: 'less',
            },
            multisample: {
                count: 1,
            },
        };

        return renderPipelineDescriptor;
    }

    /**
     * 创建ShaderInstance
     * @param shaderProcessInfo 
     * @param shaderPass 
     */
    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
        const engine = WebGPURenderEngine._instance;
        const device = engine.getDevice();
        const shaderObj = WebGPUCodeGenerator.shaderLanguageProcess(
            shaderProcessInfo.defineString, shaderProcessInfo.attributeMap, //@ts-ignore
            shaderPass.uniformMap, shaderPass.arrayMap, shaderPass.nodeCommonMap, shaderProcessInfo.vs, shaderProcessInfo.ps,
            shaderProcessInfo.is2D);

        this.uniformInfo = shaderObj.uniformInfo;
        this.uniformInfo.forEach(item => {
            if (!this.uniformSetMap[item.set])
                this.uniformSetMap[item.set] = new Array<WebGPUUniformPropertyBindingInfo>();
            this.uniformSetMap[item.set].push(item);
        });

        //
        let commap = this._shaderPass.nodeCommonMap;
        let additional = this._shaderPass.additionShaderData;
        for (var com in commap) {
            this._nodeUniformMaps.push(com);
        }
        for (var addition in additional) {
            this._nodeUniformMaps.push(addition);
        }
        this._nodeBindGroupKey = WebGPUBindGroupHelper._getBindGroupID(this._nodeUniformMaps);
        
        this._shaderPass = shaderPass;
        this._vsShader = device.createShaderModule({ code: shaderObj.vs });
        this._fsShader = device.createShaderModule({ code: shaderObj.fs });

        this.complete = true;
    }

    // private _createSpriteChacheData() {
    //     //创建Sprite的缓存组
    //     let spriteGroupLayout = this._createBindGroupLayout(2, 'spriteBindGroup');
    //     if (spriteGroupLayout) {
    //         let entries: GPUBindGroupEntry[] = [];
    //         this._cacheSpriteBindGroupDescriptor = {
    //             label: 'spriteBindGroup',
    //             layout: spriteGroupLayout,
    //             entries: entries
    //         }
    //         for (let i = 0; i < this.uniformInfo.length; i++) {
    //             const item = this.uniformInfo[i];
    //             if (item.set === 2) {

    //                 if (this.hasSpritePtrID(item.propertyId)) {
    //                     if (!this._spriteEntryGroup) {
    //                         this._spriteEntryGroup = [];
    //                     }
    //                     this._spriteEntryGroup.push(item);
    //                 }
    //                 if (this._hasAdditionShaderData(item.propertyId)) {
    //                     let strKey = this._hasAdditionShaderData(item.propertyId);
    //                     if (!strKey) {
    //                         if (this._additionalEntryGroup.has(strKey)) {
    //                             this._additionalEntryGroup.get(strKey).push(item);
    //                         } else {
    //                             this._additionalEntryGroup.set(strKey, [item]);
    //                         }
    //                     }

    //                 }
    //             }
    //         }
    //     }

    // }


    private _createBindGroupLayout(set: number, name: string) {
        const data: WebGPUUniformPropertyBindingInfo[] = [];
        const info = this.uniformInfo;
        for (let i = 0; i < info.length; i++) {
            const item = info[i];
            if (item.set === set)
                data.push(item);
        }
        if (data.length === 0) return null;
        let entries: GPUBindGroupLayoutEntry[] = [];
        const desc: GPUBindGroupLayoutDescriptor = {
            label: name,
            entries: entries,
        };
        for (let i = 0; i < data.length; i++) {
            switch (data[i].type) {
                case WebGPUBindingInfoType.buffer:
                    (desc.entries as any).push({
                        binding: data[i].binding,
                        visibility: data[i].visibility,
                        buffer: data[i].buffer,
                    });
                    break;
                case WebGPUBindingInfoType.sampler:
                    (desc.entries as any).push({
                        binding: data[i].binding,
                        visibility: data[i].visibility,
                        sampler: data[i].sampler,
                    });
                    break;
                case WebGPUBindingInfoType.texture:
                    (desc.entries as any).push({
                        binding: data[i].binding,
                        visibility: data[i].visibility,
                        texture: data[i].texture,
                    });
                    break;
            }
        }
        return WebGPURenderEngine._instance.getDevice().createBindGroupLayout(desc);
    }

    /**
     * 基于WebGPUUniformPropertyBindingInfo创建PipelineLayout
     * @param device 
     * @param name 
     * @param entries 
     */
    createPipelineLayout(device: GPUDevice) {
        if (!this._gpuPipelineLayout) {
            const bindGroupLayouts: GPUBindGroupLayout[] = [];
            for (let i = 0; i < 4; i++) {
                const group = this._createBindGroupLayout(i, `group${i}`);
                if (group) bindGroupLayouts.push(group);
            }
            this._gpuPipelineLayout = device.createPipelineLayout({ label: "pipelineLayout", bindGroupLayouts });
        }
        return this._gpuPipelineLayout;
    }



    // private hasSpritePtrID(dataOffset: number): boolean {
    //     let commap = this._shaderPass.nodeCommonMap;
    //     if (!commap) {
    //         return false;
    //     } else {
    //         for (let i = 0, n = commap.length; i < n; i++) {
    //             if ((LayaGL.renderDeviceFactory.createGlobalUniformMap(commap[i]) as WebGPUCommandUniformMap).hasPtrID(dataOffset))
    //                 return true;
    //         }
    //         return false;
    //     }
    // }

    // private _hasAdditionShaderData(dataOffset: number): string {
    //     let additionShaderData = this._shaderPass.additionShaderData;
    //     if (!additionShaderData) {
    //         return null;
    //     } else {
    //         for (let i = 0, n = additionShaderData.length; i < n; i++) {
    //             if ((LayaGL.renderDeviceFactory.createGlobalUniformMap(additionShaderData[i]) as WebGPUCommandUniformMap).hasPtrID(dataOffset))
    //                 return additionShaderData[i];
    //         }
    //     }
    //     return null;
    // }

    /**
     * 销毁
     */
    _disposeResource(): void {
        if (!this._destroyed) {
            WebGPUGlobal.releaseId(this);
            this._destroyed = true;
        }
    }

}