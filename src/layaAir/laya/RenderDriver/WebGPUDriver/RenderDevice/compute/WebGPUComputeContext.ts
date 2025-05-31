
import { Color } from '../../../../maths/Color';
import { Matrix3x3 } from '../../../../maths/Matrix3x3';
import { Matrix4x4 } from '../../../../maths/Matrix4x4';
import { Vector2 } from '../../../../maths/Vector2';
import { Vector3 } from '../../../../maths/Vector3';
import { Vector4 } from '../../../../maths/Vector4';
import { BaseTexture } from '../../../../resource/BaseTexture';
import { IComputeCMD_Dispatch, IComputeContext, IGPUBuffer } from '../../../DriverDesign/RenderDevice/ComputeShader/IComputeContext';
import { ShaderData, ShaderDataType, ShaderDataItem } from '../../../DriverDesign/RenderDevice/ShaderData';
import { WebGPURenderEngine } from '../WebGPURenderEngine';
import { WebGPUShaderData } from '../WebGPUShaderData';
import { WebGPUComputeShaderInstance } from './WebGPUComputeShaderInstance';
import { WebGPUDeviceBuffer } from './WebGPUStorageBuffer';

/**
 * 命令类型枚举
 */
enum CommandType {
    Dispatch,
    SetShaderData,
    ClearBuffer,
    BufferToBuffer,
    BufferToTexture,
    TextureToBuffer,
    TextureToTexture
}

/**
 * 命令基础接口
 */
interface ICommand {
    type: CommandType;
}

/**
 * 调度计算命令
 */
interface IDispatchCommand extends ICommand {
    cmd: IComputeCMD_Dispatch;
}

/**
 * 设置着色器数据命令
 */
interface ISetShaderDataCommand extends ICommand {
    shaderData: ShaderData;
    propertyID: number;
    shaderDataType: ShaderDataType;
    value: ShaderDataItem;
}

/**
 * 缓冲区到缓冲区复制命令
 */
interface IBufferToBufferCommand extends ICommand {
    src: IGPUBuffer;
    dest: IGPUBuffer;
    sourceOffset: number;
    destinationOffset: number;
    size: number;
}

/**
 * 缓冲区到纹理复制命令
 */
interface IBufferToTextureCommand extends ICommand {
    src: IGPUBuffer;
    srcTextureInfo: any;
    destTextureInfo: any;
    copySize: GPUExtent3D;
}

interface IBufferClearCommand extends ICommand {
    dest: IGPUBuffer;
    destinationOffset: number;
    size: number;
}

/**
 * 纹理到缓冲区复制命令
 */
interface ITextureToBufferCommand extends ICommand {
    srcTextureInfo: any;
    dest: IGPUBuffer;
    destTextureInfo: any;
    copySize: GPUExtent3D;
}

/**
 * 纹理到纹理复制命令
 */
interface ITextureToTextureCommand extends ICommand {
    srcTextureInfo: any;
    destTextureInfo: any;
    copySize: GPUExtent3D;
}


/**
 * WebGPU计算上下文，用于缓存和管理一系列计算命令
 */
export class WebGPUComputeContext implements IComputeContext {
    private device: GPUDevice;
    private commands: Array<ICommand> = [];
    private _computeEncoder: GPUComputePassEncoder;
    private _commandEncoder: GPUCommandEncoder;
    private _cacheShader: WebGPUComputeShaderInstance;
    constructor() {
        this.device = WebGPURenderEngine._instance.getDevice();
    }

    /**
     * 清空所有命令
     */
    clearCMDs(): void {
        this.commands = [];
    }

    /**
     * 添加计算调度命令
     * @param cmd 计算调度命令信息
     */
    addDispatchCommand(cmd: IComputeCMD_Dispatch): void {
        let cmdInfo: IDispatchCommand = {
            type: CommandType.Dispatch,
            cmd
        }
        this.commands.push(cmdInfo);
    }

    /**
     * 添加设置着色器数据命令
     * @param shaderData 着色器数据
     * @param propertyID 属性ID
     * @param shaderDataType 着色器数据类型
     * @param value 数据值
     */
    addSetShaderDataCommand(shaderData: ShaderData, propertyID: number, shaderDataType: ShaderDataType, value: ShaderDataItem): void {
        let cmdInfo: ISetShaderDataCommand = {
            type: CommandType.SetShaderData,
            shaderData,
            propertyID,
            shaderDataType,
            value
        }
        this.commands.push(cmdInfo);
    }

    /**
     * 添加缓冲区到缓冲区的复制命令
     * @param src 源缓冲区
     * @param dest 目标缓冲区
     * @param sourceOffset 源缓冲区偏移量
     * @param destinationOffset 目标缓冲区偏移量
     * @param size 复制大小
     */
    addBufferToBufferCommand(src: IGPUBuffer, dest: IGPUBuffer, sourceOffset: number = 0, destinationOffset: number = 0, size?: number): void {
        let cmdInfo: IBufferToBufferCommand = {
            type: CommandType.BufferToBuffer,
            src,
            dest,
            sourceOffset,
            destinationOffset,
            size
        }
        this.commands.push(cmdInfo);
    }

    /**
     * 添加缓冲区到纹理的复制命令
     * @param src 源缓冲区
     * @param srcTextureInfo 源纹理信息
     * @param destTextureInfo 目标纹理信息
     * @param copySize 复制大小
     */
    addBufferToTextureCommand(src: IGPUBuffer, srcTextureInfo: any, destTextureInfo: any, copySize: GPUExtent3D): void {
        let cmdInfo: IBufferToTextureCommand = {
            type: CommandType.BufferToTexture,
            src,
            srcTextureInfo,
            destTextureInfo,
            copySize
        }
        this.commands.push(cmdInfo);
    }

    /**
     * 添加纹理到缓冲区的复制命令
     * @param srcTextureInfo 源纹理信息
     * @param dest 目标缓冲区
     * @param destTextureInfo 目标纹理信息
     * @param copySize 复制大小
     */
    addTextureToBufferCommand(srcTextureInfo: any, dest: IGPUBuffer, destTextureInfo: any, copySize: GPUExtent3D): void {
        let cmdInfo: ITextureToBufferCommand = {
            type: CommandType.TextureToBuffer,
            srcTextureInfo,
            dest,
            destTextureInfo,
            copySize
        }
        this.commands.push(cmdInfo);
    }

    /**
     * 添加纹理到纹理的复制命令
     * @param srcTextureInfo 源纹理信息
     * @param destTextureInfo 目标纹理信息
     * @param copySize 复制大小
     */
    addTextureToTextureCommand(srcTextureInfo: any, destTextureInfo: any, copySize: GPUExtent3D): void {
        let cmdInfo: ITextureToTextureCommand = {
            type: CommandType.TextureToTexture,
            srcTextureInfo,
            destTextureInfo,
            copySize
        }
        this.commands.push(cmdInfo);
    }

    /**
    * 清理buffer数据
    * @param dest 清理数据的buffer
    * @param destoffset 位置
    * @param destCount 长度
    */
    addClearBufferCommand(dest: WebGPUDeviceBuffer, destoffset: number, destCount: number): void {
        let cmdInfo: IBufferClearCommand = {
            type: CommandType.ClearBuffer,
            dest: dest,
            destinationOffset: destoffset,
            size: destCount
        }
        this.commands.push(cmdInfo);
    }

    private _bindGroup(computeShader: WebGPUComputeShaderInstance, webgpuShaderData: WebGPUShaderData[]) {
        for (let i = 0, n = webgpuShaderData.length; i < n; i++) {
            let propertyBindArray = computeShader.uniformSetMap.get(i);
            let shaderdata = webgpuShaderData[i];
            let uniformCommandMap = computeShader.uniformCommandMap[i];
            if (uniformCommandMap._hasUniformBuffer) {
                let uniform = shaderdata.createSubUniformBuffer(uniformCommandMap._stateName, uniformCommandMap._stateName, uniformCommandMap._idata);
                if (uniform && uniform.needUpload) {
                    uniform.bufferBlock.needUpload();
                }
            }

            let resource = computeShader.uniformSetMap.get(i);
            let bindgroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup([uniformCommandMap._stateName], shaderdata, null, resource, ~0,true);

            this._computeEncoder.setBindGroup(i, bindgroup.gpuRS);
        }
        WebGPURenderEngine._instance.gpuBufferMgr.upload();
    }

    private _startComputePass() {
        if (!this._computeEncoder) {
            this._computeEncoder = this._commandEncoder.beginComputePass();
        }
    }

    private _endComputePass() {
        if (this._computeEncoder) {
            this._computeEncoder.end();
            this._computeEncoder = null;
            this._cacheShader = null;
        }
    }

    /**
     * 执行所有缓存的命令
     */
    executeCMDs(): void {
        if (this.commands.length === 0) {
            return;
        }
        // 创建命令编码器
        this._commandEncoder = this.device.createCommandEncoder();
        // 处理计算调度命令
        for (const cmd of this.commands) {
            switch (cmd.type) {
                case CommandType.Dispatch:
                    const dispatchInfo = (cmd as IDispatchCommand).cmd;
                    // 如果没有创建计算通道，则创建一个
                    this._startComputePass();

                    let shader = dispatchInfo.shader as WebGPUComputeShaderInstance;

                    if (this._cacheShader != shader) {
                        this._computeEncoder.setPipeline(shader.getOrcreatePipeline(dispatchInfo.Kernel));
                    }


                    this._bindGroup(shader, dispatchInfo.shaderData as WebGPUShaderData[]);


                    let dispatchParams = dispatchInfo.dispatchParams;
                    // 执行计算着色器
                    this._computeEncoder.dispatchWorkgroups(
                        dispatchParams.x,
                        dispatchParams.y || 1,
                        dispatchParams.z || 1
                    );
                    break;
                case CommandType.SetShaderData:
                    const setDataCMD = cmd as ISetShaderDataCommand;
                    switch (setDataCMD.shaderDataType) {
                        case ShaderDataType.Int:
                            setDataCMD.shaderData.setInt(setDataCMD.propertyID, setDataCMD.value as number);
                            break;
                        case ShaderDataType.Float:
                            setDataCMD.shaderData.setNumber(setDataCMD.propertyID, setDataCMD.value as number);
                            break;
                        case ShaderDataType.Bool:
                            setDataCMD.shaderData.setBool(setDataCMD.propertyID, setDataCMD.value as boolean);
                            break;
                        case ShaderDataType.Matrix3x3:
                            setDataCMD.shaderData.setMatrix3x3(setDataCMD.propertyID, setDataCMD.value as Matrix3x3);
                            break;
                        case ShaderDataType.Matrix4x4:
                            setDataCMD.shaderData.setMatrix4x4(setDataCMD.propertyID, setDataCMD.value as Matrix4x4);
                            break;
                        case ShaderDataType.Color:
                            setDataCMD.shaderData.setColor(setDataCMD.propertyID, setDataCMD.value as Color);
                            break;
                        case ShaderDataType.Texture2D:
                            setDataCMD.shaderData.setTexture(setDataCMD.propertyID, setDataCMD.value as BaseTexture);
                            break;
                        case ShaderDataType.Vector2:
                            setDataCMD.shaderData.setVector2(setDataCMD.propertyID, setDataCMD.value as Vector2);
                            break;
                        case ShaderDataType.Vector3:
                            setDataCMD.shaderData.setVector3(setDataCMD.propertyID, setDataCMD.value as Vector3);
                            break;
                        case ShaderDataType.Vector4:
                            setDataCMD.shaderData.setVector(setDataCMD.propertyID, setDataCMD.value as Vector4);
                            break;
                        case ShaderDataType.Buffer:
                            setDataCMD.shaderData.setBuffer(setDataCMD.propertyID, setDataCMD.value as Float32Array);
                            break;
                        case ShaderDataType.DeviceBuffer:
                        case ShaderDataType.ReadOnlyDeviceBuffer:
                            setDataCMD.shaderData.setDeviceBuffer(setDataCMD.propertyID, setDataCMD.value as WebGPUDeviceBuffer)
                            break;
                        default:
                            //TODO shaderDefine
                            break;
                    }
                    break;
                case CommandType.BufferToBuffer:
                    const btbCmd = cmd as IBufferToBufferCommand;
                    this._endComputePass();
                    this._commandEncoder.copyBufferToBuffer(
                        btbCmd.src.getNativeBuffer()._source,
                        btbCmd.sourceOffset,
                        btbCmd.dest.getNativeBuffer()._source,
                        btbCmd.destinationOffset,
                        btbCmd.size
                    );
                    break;
                case CommandType.ClearBuffer:
                    const clearBufferCmd = cmd as IBufferClearCommand;
                    this._endComputePass();
                    this._commandEncoder.clearBuffer(
                        clearBufferCmd.dest.getNativeBuffer()._source,
                        clearBufferCmd.destinationOffset,
                        clearBufferCmd.size
                    );
                    break;
                case CommandType.BufferToTexture:
                    //TODO
                    break;

                case CommandType.TextureToBuffer:
                    //TODO
                    break;

                case CommandType.TextureToTexture:
                    //TODO
                    break;

            }
        }

        this._endComputePass();
        // 提交命令缓冲区
        const commandBuffer = this._commandEncoder.finish();
        this.device.queue.submit([commandBuffer]);

    }

    /**
     * 销毁计算上下文，清空所有命令
     */
    destroy() {
        this.clearCMDs();
    }
}
