import { Color } from '../../../../maths/Color';
import { Matrix3x3 } from '../../../../maths/Matrix3x3';
import { Matrix4x4 } from '../../../../maths/Matrix4x4';
import { Vector2 } from '../../../../maths/Vector2';
import { Vector3 } from '../../../../maths/Vector3';
import { Vector4 } from '../../../../maths/Vector4';
import { BaseTexture } from '../../../../resource/BaseTexture';
import { IComputeCMD_Dispatch, IComputeCMD_DispatchIndirect, IComputeContext, IGPUBuffer } from '../../../DriverDesign/RenderDevice/ComputeShader/IComputeContext';
import { IComputeShader } from '../../../DriverDesign/RenderDevice/ComputeShader/IComputeShader';
import { ShaderData, ShaderDataType, ShaderDataItem } from '../../../DriverDesign/RenderDevice/ShaderData';
import { GLESIndexBuffer } from '../GLESIndexBuffer';
import { GLESShaderData } from '../GLESShaderData';
import { GLESComputeShaderInstance } from './GLESComputeShaderInstance';
import { GLESDeviceBuffer } from './GLESDeviceBuffer';

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
    //type: CommandType;
}

/**
 * 调度计算命令
 */
class IDispatchCommand implements ICommand {
    //cmd: IComputeCMD_Dispatch;
    private _shader: GLESComputeShaderInstance;
    private _shaderData: GLESShaderData[];
    set shader(value: GLESComputeShaderInstance) {
        this._shader = value;
        this._nativeObj.setShader(value._nativeObj);
    }
    set shaderData(value: GLESShaderData[]) {
        this._shaderData = value;
        let shaderData: any[] = this._shaderData.map(item => item._nativeObj);
        this._nativeObj.setShaderData(shaderData);
    }
    set dispatchParams(value: Vector3) {
        this._nativeObj.setDispatchParams(value);
    }
    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchGLESComputeDispatchCommand();
    }

}

/**
 * 设置着色器数据命令
 */
class ISetShaderDataCommand implements ICommand {
    private _shaderData: GLESShaderData;
    private _shaderDataItem: ShaderDataItem;
    set shaderData(value: GLESShaderData) {
        this._shaderData = value;
        this._nativeObj.setShaderData(value._nativeObj)
    }
    set propertyID(value: number) {
        this._nativeObj.setPropertyID(value);
    }
    set shaderDataType(value: ShaderDataType) {
        this._nativeObj.setShaderDataType(value);
    }
    set value(value: ShaderDataItem) {
        this._shaderDataItem = value;
        this._nativeObj.setShaderDataItem(value);
    }
    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchGLESComputeSetShaderDataCommand();
    }
}

/**
 * 缓冲区到缓冲区复制命令
 */
class IBufferToBufferCommand implements ICommand {
    private _src: IGPUBuffer;
    set src(value: IGPUBuffer) {
        this._src = value;
        this._nativeObj.setSrc((value as any)._nativeObj);
    }

    private _dest: IGPUBuffer;
    set dest(value: IGPUBuffer) {
        this._dest = value;
        this._nativeObj.setDest((value as any)._nativeObj);
    }

    set sourceOffset(value: number) {
        this._nativeObj.setSourceOffset(value);
    }

    set destinationOffset(value: number) {
        this._nativeObj.setDestinationOffset(value);
    }

    set size(value: number) {
        this._nativeObj.setSize(value);
    }

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchGLESComputeBufferToBufferCommand();
    }
}

/**
 * 缓冲区到纹理复制命令
 */
/*class IBufferToTextureCommand implements ICommand {
    private _src: GLESDeviceBuffer;
    set src(value: GLESDeviceBuffer) {
        this._src = value;
        this._nativeObj.setSrc(value._nativeObj);
    }
    set srcTextureInfo(value: any) {
        this._nativeObj.setSrcTextureInfo(value);
    }
    set destTextureInfo(value: any) {
        this._nativeObj.setDestTextureInfo(value);
    }

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchGLESComputeBufferToTextureCommand();
    }
}*/

/**
 * 缓冲区清理命令
 */
class IBufferClearCommand implements ICommand {
    private _dest: IGPUBuffer;
    set dest(value: GLESDeviceBuffer) {
        this._dest = value;
        this._nativeObj.setDest(value._nativeObj);
    }
    set destinationOffset(value: number) {
        this._nativeObj.setDestinationOffset(value);
    }
    set size(value: number) {
        this._nativeObj.setSize(value);
    }

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchGLESComputeClearBufferCommand();
    }
}

/**
 * 纹理到缓冲区复制命令
 */
/*class ITextureToBufferCommand implements ICommand {
    set srcTextureInfo(value: any) {
        if (this._nativeObj.setSrcTextureInfo) this._nativeObj.setSrcTextureInfo(value);
        else this._nativeObj.srcTextureInfo = value;
    }
    private _dest: GLESDeviceBuffer;
    set dest(value: GLESDeviceBuffer) {
        this._dest = value;
        this._nativeObj.setDest(value._nativeObj);
    }
    set destTextureInfo(value: any) {
        this._nativeObj.setDestTextureInfo(value);
    }
    set copySize(value: any) {
        this._nativeObj.setCopySize(value);
    }

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchGLESComputeTextureToBufferCommand();
    }
}*/

/**
 * 纹理到纹理复制命令
 */
class ITextureToTextureCommand implements ICommand {
    set srcTextureInfo(value: any) {
        this._nativeObj.setSrcTextureInfo(value);
    }
    set destTextureInfo(value: any) {
        this._nativeObj.setDestTextureInfo(value);
    }
    set copySize(value: any) {
        this._nativeObj.setCopySize(value);
    }

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchGLESComputeTextureToTextureCommand();
    }
}

/**
 * OpenGL ES计算上下文，用于缓存和管理一系列计算命令
 */
export class GLESComputeContext implements IComputeContext {
    private _nativeObj: any;
    private commands: Array<ICommand> = [];

    constructor() {
        // 创建原生OpenGL ES计算上下文对象
        this._nativeObj = new (window as any).conchGLESComputeContext();
    }

    /**
     * 清空所有命令
     */
    clearCMDs(): void {
        this.commands = [];
        this._nativeObj.clearCMDs();
    }

    /**
     * 添加计算调度命令
     * @param cmd 计算调度命令信息
     */
    addDispatchCommand(cmd: IComputeCMD_Dispatch): void {
        let cmdInfo: IDispatchCommand = new IDispatchCommand();
        cmdInfo.shader = cmd.shader as GLESComputeShaderInstance;
        cmdInfo.shaderData = cmd.shaderData as GLESShaderData[];
        cmdInfo.dispatchParams = cmd.dispatchParams as Vector3;
        this.commands.push(cmdInfo);
        this._nativeObj.addCMD(cmdInfo._nativeObj as any);
    }

    /**
     * 添加间接调度计算命令
     * @param cmd 间接调度命令信息
     */
    addDispatchIndirectCommand(cmd: IComputeCMD_DispatchIndirect): void {
        //TODO
    }

    /**
     * 添加设置着色器数据命令
     * @param shaderData 着色器数据
     * @param propertyID 属性ID
     * @param shaderDataType 着色器数据类型
     * @param value 数据值
     */
    addSetShaderDataCommand(shaderData: GLESShaderData, propertyID: number, shaderDataType: ShaderDataType, value: ShaderDataItem): void {
        let cmdInfo: ISetShaderDataCommand = new ISetShaderDataCommand();
        cmdInfo.shaderData = shaderData;
        cmdInfo.propertyID = propertyID;
        cmdInfo.shaderDataType = shaderDataType;
        cmdInfo.value = value;
        this.commands.push(cmdInfo);
        this._nativeObj.addCMD(cmdInfo._nativeObj as any);
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
        let cmdInfo: IBufferToBufferCommand = new IBufferToBufferCommand();
        cmdInfo.src = src;
        cmdInfo.dest = dest;
        cmdInfo.sourceOffset = sourceOffset;
        cmdInfo.destinationOffset = destinationOffset;
        cmdInfo.size = size || 0;
        this.commands.push(cmdInfo);
        this._nativeObj.addCMD(cmdInfo._nativeObj as any);
    }

    /**
     * 添加缓冲区到纹理的复制命令
     * @param src 源缓冲区
     * @param srcTextureInfo 源纹理信息
     * @param destTextureInfo 目标纹理信息
     * @param copySize 复制大小
     */
    addBufferToTextureCommand(src: IGPUBuffer, srcTextureInfo: any, destTextureInfo: any, copySize: any): void {
        /*let cmdInfo: IBufferToTextureCommand = new IBufferToTextureCommand();
        cmdInfo.src = src as GLESDeviceBuffer;
        cmdInfo.srcTextureInfo = srcTextureInfo;
        cmdInfo.destTextureInfo = destTextureInfo;
        cmdInfo.copySize = copySize;
        this.commands.push(cmdInfo);
        this._nativeObj.addCMD(cmdInfo._nativeObj as any);*/
    }

    /**
     * 添加纹理到缓冲区的复制命令
     * @param srcTextureInfo 源纹理信息
     * @param dest 目标缓冲区
     * @param destTextureInfo 目标纹理信息
     * @param copySize 复制大小
     */
    addTextureToBufferCommand(srcTextureInfo: any, dest: IGPUBuffer, destTextureInfo: any, copySize: any): void {
        /*let cmdInfo: ITextureToBufferCommand = new ITextureToBufferCommand();
        cmdInfo.srcTextureInfo = srcTextureInfo;
        cmdInfo.dest = dest;
        cmdInfo.destTextureInfo = destTextureInfo;
        cmdInfo.copySize = copySize;
        this.commands.push(cmdInfo);
        this._nativeObj.addCMD(cmdInfo._nativeObj as any);*/
    }

    /**
     * 添加纹理到纹理的复制命令
     * @param srcTextureInfo 源纹理信息
     * @param destTextureInfo 目标纹理信息
     * @param copySize 复制大小
     */
    addTextureToTextureCommand(srcTextureInfo: any, destTextureInfo: any, copySize: any): void {
        let cmdInfo: ITextureToTextureCommand = new ITextureToTextureCommand();
        cmdInfo.srcTextureInfo = srcTextureInfo;
        cmdInfo.destTextureInfo = destTextureInfo;
        cmdInfo.copySize = copySize;
        this.commands.push(cmdInfo);
        this._nativeObj.addCMD(cmdInfo._nativeObj as any);
    }

    /**
     * 清理buffer数据
     * @param dest 清理数据的buffer
     * @param destOffset 位置
     * @param destCount 长度
     */
    addClearBufferCommand(dest: GLESDeviceBuffer, destOffset: number, destCount: number): void {
        let cmdInfo: IBufferClearCommand = new IBufferClearCommand();
        cmdInfo.dest = dest;
        cmdInfo.destinationOffset = destOffset;
        cmdInfo.size = destCount;
        this.commands.push(cmdInfo);
        this._nativeObj.addCMD(cmdInfo._nativeObj as any);
    }
    /**
     * 执行所有缓存的命令
     */
    executeCMDs(): void {
        this._nativeObj.executeCMDs();
    }
    /**
     * 销毁计算上下文，清空所有命令
     */
    destroy(): void {
        this.clearCMDs();
        if (this._nativeObj) {
            this._nativeObj.destroy();
        }
    }
} 