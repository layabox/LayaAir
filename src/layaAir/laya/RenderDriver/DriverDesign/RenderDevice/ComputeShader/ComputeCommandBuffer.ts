import { LayaGL } from "../../../../layagl/LayaGL.js";
import { IComputeCMD_Dispatch, IComputeContext } from "./IComputeContext.ts.js";
import { IStorageBuffer } from "../IStorageBuffer.js";
import { IVertexBuffer } from "../IVertexBuffer.js";
import { ShaderData, ShaderDataItem, ShaderDataType } from "../ShaderData.js";

export class ComputeCommandBuffer {
    private _context: IComputeContext;
    constructor() {
        if (LayaGL.renderDeviceFactory.createComputeContext) {//支持computeContext
            this._context = LayaGL.renderDeviceFactory.createComputeContext();
        }
    }
    /**
        * 清理所有指令
        */
    clearCMDs(): void {
        this._context.clearCMDs();
    }

    /**
     * 添加运行ComputeShader的命令
     * @param cmd 计算着色器调度命令
     */
    addDispatchCommand(cmd: IComputeCMD_Dispatch): void {
        this._context.addDispatchCommand(cmd);
    };

    /**
     * 添加修改ShaderData值的命令
     * @param shaderData 要修改的ShaderData
     * @param propertyName 属性名称
     * @param value 要设置的值
     */
    addSetShaderDataCommand(shaderData: ShaderData, propertyID: number, shaderDataType: ShaderDataType, value: ShaderDataItem): void {
        this._context.addSetShaderDataCommand(shaderData, propertyID, shaderDataType, value);
    };

    /**
     * 添加Buffer拷贝到Buffer的命令
     * @param src 源缓冲区
     * @param dest 目标缓冲区
     * @param sourceOffset 源偏移量（字节）
     * @param destinationOffset 目标偏移量（字节）
     * @param size 拷贝大小（字节）
     */
    addBufferToBufferCommand(src: IStorageBuffer | IVertexBuffer, dest: IStorageBuffer | IVertexBuffer, sourceOffset?: number, destinationOffset?: number, size?: number): void {
        this._context.addBufferToBufferCommand(src as any, dest as any, sourceOffset, destinationOffset, size);
    };

    /**
     * 添加Buffer拷贝到Texture的命令
     * @param src 源缓冲区
     * @param srcTextureInfo 源纹理信息
     * @param destTextureInfo 目标纹理信息
     * @param copySize 拷贝大小
     */
    addBufferToTextureCommand(src: IStorageBuffer | IVertexBuffer, srcTextureInfo: any, destTextureInfo: any, copySize: any): void {
        //TODO
    };

    /**
     * 添加Texture拷贝到Buffer的命令
     * @param srcTextureInfo 源纹理信息
     * @param dest 目标缓冲区
     * @param destTextureInfo 目标纹理信息
     * @param copySize 拷贝大小
     */
    addTextureToBufferCommand(srcTextureInfo: any, rc: IStorageBuffer | IVertexBuffer, destTextureInfo: any, copySize: any): void {
        //TODO
    };

    /**
     * 添加Texture拷贝到Texture的命令
     * @param srcTextureInfo 源纹理信息
     * @param destTextureInfo 目标纹理信息
     * @param copySize 拷贝大小
     */
    addTextureToTextureCommand(srcTextureInfo: any, destTextureInfo: any, copySize: any): void {
        //TODO
    };

    /**
     * 执行所有命令
     */
    executeCMDs(): void {
        this._context.executeCMDs();
    };

    /**
     * 销毁计算上下文，清空所有命令
     */
    destroy(): void {
        this._context.destroy();
    };
}