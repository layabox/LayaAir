import { LayaGL } from "../../../../layagl/LayaGL";
import { CopyTextureInfo, IComputeCMD_Dispatch, IComputeCMD_DispatchIndirect, IComputeContext } from "./IComputeContext";
import { IDeviceBuffer } from "../IDeviceBuffer";
import { IVertexBuffer } from "../IVertexBuffer";
import { ShaderData, ShaderDataItem, ShaderDataType } from "../ShaderData";
import { ComputeShader } from "./ComputeShader";
import { IDefineDatas } from "../../../RenderModuleData/Design/IDefineDatas";
import { Vector3 } from "../../../../maths/Vector3";
import { IIndexBuffer } from "../IIndexBuffer";
export class ComputeCommandBuffer {
    private _context: IComputeContext;
    constructor() {
        if (LayaGL.renderDeviceFactory.createComputeContext) {//支持computeContext
            this._context = LayaGL.renderDeviceFactory.createComputeContext();
        }
    }

    /**
     * @internal
     */
    getResource() {
        return this._context;
    }

    /**
        * 清理所有指令
        */
    clearCMDs(): void {
        this._context.clearCMDs();
    }

    /**
     * @en Adds a command to run a ComputeShader.
     * @param computeshader The ComputeShader instance to run.
     * @param kernel The name of the kernel in the ComputeShader.
     * @param shaderDefine The shader define data.
     * @param datas The list of ShaderData to pass to the shader.
     * @param dispatchParams The dispatch parameters, typically a Vector3 representing the workgroup size
     * @zh 添加运行ComputeShader的命令
     * @param computeshader 计算着色器实例
     * @param kernel 计算着色器的内核名称
     * @param shaderDefine 着色器定义数据
     * @param datas 需要传递给着色器的数据列表
     * @param dispatchParams 调度参数，通常是一个Vector3，表示计算的工作组大小。
     */
    addDispatchCommand(computeshader: ComputeShader, shaderDefine: IDefineDatas, datas: ShaderData[], dispatchParams: Vector3): void {
        let cmd: IComputeCMD_Dispatch = {
            shader: computeshader.getCacheShader(shaderDefine),
            shaderData: datas,
            dispatchParams: dispatchParams.clone()
        }
        this._context.addDispatchCommand(cmd);
    };

    addDispatchIndirectCommand(computeshader: ComputeShader, shaderDefine: IDefineDatas, datas: ShaderData[], indirectBuffer: IDeviceBuffer, indirectOffset: number): void {
        let cmd: IComputeCMD_DispatchIndirect = {
            shader: computeshader.getCacheShader(shaderDefine),
            shaderData: datas,
            indirectBuffer: indirectBuffer as any,
            indirectOffset: indirectOffset
        }
        this._context.addDispatchIndirectCommand(cmd);
    }

    /**
     * 添加修改ShaderData值的命令
     * @param shaderData 要修改的ShaderData
     * @param propertyID 属性名称
     * @param shaderDataType ShaderData的类型
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
    addBufferToBufferCommand(src: IDeviceBuffer | IVertexBuffer | IIndexBuffer, dest: IDeviceBuffer | IVertexBuffer | IIndexBuffer, sourceOffset?: number, destinationOffset?: number, size?: number): void {
        this._context.addBufferToBufferCommand(src as any, dest as any, sourceOffset, destinationOffset, size);
    };

    /**
        * 清理buffer数据
        * @param dest 清理数据的buffer
        * @param destoffset 位置
        * @param destCount 长度
        */
    addClearBufferCommand(dest: IDeviceBuffer, destoffset: number, destCount: number): void {
        this._context.addClearBufferCommand(dest, destoffset, destCount);
    }

    /**
     * 添加Buffer拷贝到Texture的命令
     * @param src 源缓冲区
     * @param srcTextureInfo 源纹理信息
     * @param destTextureInfo 目标纹理信息
     * @param copySize 拷贝大小
     */
    addBufferToTextureCommand(src: IDeviceBuffer | IVertexBuffer, srcTextureInfo: any, destTextureInfo: any, copySize: any): void {
        //TODO
    };

    /**
     * 添加Texture拷贝到Buffer的命令
     * @param srcTextureInfo 源纹理信息
     * @param rc 目标缓冲区
     * @param destTextureInfo 目标纹理信息
     * @param copySize 拷贝大小
     */
    addTextureToBufferCommand(srcTextureInfo: any, rc: IDeviceBuffer | IVertexBuffer, destTextureInfo: any, copySize: any): void {
        //TODO
    };

    /**
     * 添加Texture拷贝到Texture的命令
     * @param srcTextureInfo 源纹理信息
     * @param destTextureInfo 目标纹理信息
     * @param copySize 拷贝大小
     */
    addTextureToTextureCommand(srcTextureInfo: CopyTextureInfo, destTextureInfo: CopyTextureInfo, copySize: any): void {
        this._context.addTextureToTextureCommand(srcTextureInfo, destTextureInfo, copySize);
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