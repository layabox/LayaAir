import { Vector3 } from "../../../../maths/Vector3";
import { IStorageBuffer } from "../IStorageBuffer";
import { ShaderData, ShaderDataItem, ShaderDataType } from "../ShaderData";
import { IComputeShader } from "./IComputeShader";

export interface IGPUBuffer {
    getNativeBuffer(): any;
}

/**
 * 计算命令枚举
 */
export enum ComputeCommandType {
    DispatchCompute,
    SetRenderData,
    ClearBuffer,
    CopyBufferToBuffer,
    copyBufferToTexture,
    copyTextureToBuffer,
    copyTextureToTexture
}

/**
 * 内存操作枚举
 */
export enum EComputeCMDMemoryOperate {
    BufferToBuffer,
    BufferToTexture,//TODO
    TextureToBuffer,//TODO
    TextureToTexture,//TODO
}

export interface IComputeCMD_Dispatch {
    shader: IComputeShader;
    Kernel: string
    shaderData: ShaderData[];
    dispatchParams: Vector3;
}

export interface IComputeCMD_MemoryOperate {
    type: EComputeCMDMemoryOperate;
    src: IStorageBuffer,
    dest?: IStorageBuffer,
    sourceOffset?: number,
    destinationOffset?: number,
    size?: number
    srcTextureInfo?: any;
    destTextureInfo?: any;
}


export interface IComputeContext {
    /**
     * 清理所有指令
     */
    clearCMDs(): void;

    /**
     * 添加运行ComputeShader的命令
     * @param cmd 计算着色器调度命令
     */
    addDispatchCommand(cmd: IComputeCMD_Dispatch): void;

    /**
     * 添加修改ShaderData值的命令
     * @param shaderData 要修改的ShaderData
     * @param propertyName 属性名称
     * @param value 要设置的值
     */
    addSetShaderDataCommand(shaderData: ShaderData, propertyID: number, shaderDataType: ShaderDataType, value: ShaderDataItem): void;

    /**
     * 添加Buffer拷贝到Buffer的命令
     * @param src 源缓冲区
     * @param dest 目标缓冲区
     * @param sourceOffset 源偏移量（字节）
     * @param destinationOffset 目标偏移量（字节）
     * @param size 拷贝大小（字节）
     */
    addBufferToBufferCommand(src: IGPUBuffer, dest: IGPUBuffer, sourceOffset?: number, destinationOffset?: number, size?: number): void;

    /**
     * 添加Buffer拷贝到Texture的命令
     * @param src 源缓冲区
     * @param srcTextureInfo 源纹理信息
     * @param destTextureInfo 目标纹理信息
     * @param copySize 拷贝大小
     */
    addBufferToTextureCommand(src: IGPUBuffer, srcTextureInfo: any, destTextureInfo: any, copySize: any): void;

    /**
     * 添加Texture拷贝到Buffer的命令
     * @param srcTextureInfo 源纹理信息
     * @param dest 目标缓冲区
     * @param destTextureInfo 目标纹理信息
     * @param copySize 拷贝大小
     */
    addTextureToBufferCommand(srcTextureInfo: any, dest: IGPUBuffer, destTextureInfo: any, copySize: any): void;

    /**
     * 添加Texture拷贝到Texture的命令
     * @param srcTextureInfo 源纹理信息
     * @param destTextureInfo 目标纹理信息
     * @param copySize 拷贝大小
     */
    addTextureToTextureCommand(srcTextureInfo: any, destTextureInfo: any, copySize: any): void;

    /**
     * 执行所有命令
     */
    executeCMDs(): void;

    /**
     * 销毁计算上下文，清空所有命令
     */
    destroy(): void;
}
