import { Color } from '../../../../maths/Color';
import { Matrix3x3 } from '../../../../maths/Matrix3x3';
import { Matrix4x4 } from '../../../../maths/Matrix4x4';
import { Vector2 } from '../../../../maths/Vector2';
import { Vector3 } from '../../../../maths/Vector3';
import { Vector4 } from '../../../../maths/Vector4';
import { BaseTexture } from '../../../../resource/BaseTexture';
import { IComputeCMD_Dispatch, IComputeContext, IGPUBuffer } from '../../../DriverDesign/RenderDevice/ComputeShader/IComputeContext';
import { ShaderData, ShaderDataType, ShaderDataItem } from '../../../DriverDesign/RenderDevice/ShaderData';
import { GLESShaderData } from '../GLESShaderData';
import { GLESComputeShader } from './GLESComputeShader';
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
    copySize: any;
}

/**
 * 缓冲区清理命令
 */
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
    copySize: any;
}

/**
 * 纹理到纹理复制命令
 */
interface ITextureToTextureCommand extends ICommand {
    srcTextureInfo: any;
    destTextureInfo: any;
    copySize: any;
}

/**
 * OpenGL ES计算上下文，用于缓存和管理一系列计算命令
 */
export class GLESComputeContext implements IComputeContext {
    private _nativeObj: any;
    private commands: Array<ICommand> = [];
    private _currentShader: GLESComputeShader | null = null;
    private _isExecuting: boolean = false;

    constructor() {
        // 创建原生OpenGL ES计算上下文对象
        this._nativeObj = new (window as any).conchGLESComputeContext();
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
        const cmdInfo: IDispatchCommand = {
            type: CommandType.Dispatch,
            cmd
        };
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
        const cmdInfo: ISetShaderDataCommand = {
            type: CommandType.SetShaderData,
            shaderData,
            propertyID,
            shaderDataType,
            value
        };
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
        const cmdInfo: IBufferToBufferCommand = {
            type: CommandType.BufferToBuffer,
            src,
            dest,
            sourceOffset,
            destinationOffset,
            size: size || 0
        };
        this.commands.push(cmdInfo);
    }

    /**
     * 添加缓冲区到纹理的复制命令
     * @param src 源缓冲区
     * @param srcTextureInfo 源纹理信息
     * @param destTextureInfo 目标纹理信息
     * @param copySize 复制大小
     */
    addBufferToTextureCommand(src: IGPUBuffer, srcTextureInfo: any, destTextureInfo: any, copySize: any): void {
        const cmdInfo: IBufferToTextureCommand = {
            type: CommandType.BufferToTexture,
            src,
            srcTextureInfo,
            destTextureInfo,
            copySize
        };
        this.commands.push(cmdInfo);
    }

    /**
     * 添加纹理到缓冲区的复制命令
     * @param srcTextureInfo 源纹理信息
     * @param dest 目标缓冲区
     * @param destTextureInfo 目标纹理信息
     * @param copySize 复制大小
     */
    addTextureToBufferCommand(srcTextureInfo: any, dest: IGPUBuffer, destTextureInfo: any, copySize: any): void {
        const cmdInfo: ITextureToBufferCommand = {
            type: CommandType.TextureToBuffer,
            srcTextureInfo,
            dest,
            destTextureInfo,
            copySize
        };
        this.commands.push(cmdInfo);
    }

    /**
     * 添加纹理到纹理的复制命令
     * @param srcTextureInfo 源纹理信息
     * @param destTextureInfo 目标纹理信息
     * @param copySize 复制大小
     */
    addTextureToTextureCommand(srcTextureInfo: any, destTextureInfo: any, copySize: any): void {
        const cmdInfo: ITextureToTextureCommand = {
            type: CommandType.TextureToTexture,
            srcTextureInfo,
            destTextureInfo,
            copySize
        };
        this.commands.push(cmdInfo);
    }

    /**
     * 清理buffer数据
     * @param dest 清理数据的buffer
     * @param destOffset 位置
     * @param destCount 长度
     */
    addClearBufferCommand(dest: GLESDeviceBuffer, destOffset: number, destCount: number): void {
        const cmdInfo: IBufferClearCommand = {
            type: CommandType.ClearBuffer,
            dest: dest,
            destinationOffset: destOffset,
            size: destCount
        };
        this.commands.push(cmdInfo);
    }

    /**
     * 绑定着色器数据到计算着色器
     * @param shader 计算着色器
     * @param shaderData 着色器数据数组
     */
    private _bindShaderData(shader: GLESComputeShader, shaderData: GLESShaderData[]): void {
        for (let i = 0, n = shaderData.length; i < n; i++) {
            const data = shaderData[i];
            const uniformCommandMap = shader.uniformCommandMap[i];

            if (uniformCommandMap) {
                // 绑定uniform数据到着色器
                this._nativeObj.bindShaderData(i, data._nativeObj);
            }
        }
    }

    /**
     * 执行所有缓存的命令
     */
    executeCMDs(): void {
        if (this.commands.length === 0) {
            return;
        }

        if (this._isExecuting) {
            console.warn("GLESComputeContext is already executing commands");
            return;
        }

        this._isExecuting = true;

        try {
            // 开始命令执行
            this._nativeObj.beginCommands();

            // 处理所有命令
            for (const cmd of this.commands) {
                switch (cmd.type) {
                    case CommandType.Dispatch:
                        this._executeDispatchCommand(cmd as IDispatchCommand);
                        break;
                    case CommandType.SetShaderData:
                        this._executeSetShaderDataCommand(cmd as ISetShaderDataCommand);
                        break;
                    case CommandType.BufferToBuffer:
                        this._executeBufferToBufferCommand(cmd as IBufferToBufferCommand);
                        break;
                    case CommandType.ClearBuffer:
                        this._executeClearBufferCommand(cmd as IBufferClearCommand);
                        break;
                    case CommandType.BufferToTexture:
                        this._executeBufferToTextureCommand(cmd as IBufferToTextureCommand);
                        break;
                    case CommandType.TextureToBuffer:
                        this._executeTextureToBufferCommand(cmd as ITextureToBufferCommand);
                        break;
                    case CommandType.TextureToTexture:
                        this._executeTextureToTextureCommand(cmd as ITextureToTextureCommand);
                        break;
                }
            }

            // 结束命令执行
            this._nativeObj.endCommands();
        } catch (error) {
            console.error("Error executing compute commands:", error);
        } finally {
            this._isExecuting = false;
        }
    }

    /**
     * 执行调度命令
     */
    private _executeDispatchCommand(cmd: IDispatchCommand): void {
        const dispatchInfo = cmd.cmd;
        const shader = dispatchInfo.shader as GLESComputeShader;
        const shaderData = dispatchInfo.shaderData as GLESShaderData[];
        const dispatchParams = dispatchInfo.dispatchParams;

        // 绑定计算着色器
        shader.bind(dispatchInfo.Kernel);
        this._currentShader = shader;

        // 绑定着色器数据
        this._bindShaderData(shader, shaderData);

        // 执行计算调度
        this._nativeObj.dispatchCompute(
            dispatchParams.x,
            dispatchParams.y || 1,
            dispatchParams.z || 1
        );
    }

    /**
     * 执行设置着色器数据命令
     */
    private _executeSetShaderDataCommand(cmd: ISetShaderDataCommand): void {
        const { shaderData, propertyID, shaderDataType, value } = cmd;

        switch (shaderDataType) {
            case ShaderDataType.Int:
                shaderData.setInt(propertyID, value as number);
                break;
            case ShaderDataType.Float:
                shaderData.setNumber(propertyID, value as number);
                break;
            case ShaderDataType.Bool:
                shaderData.setBool(propertyID, value as boolean);
                break;
            case ShaderDataType.Matrix3x3:
                shaderData.setMatrix3x3(propertyID, value as Matrix3x3);
                break;
            case ShaderDataType.Matrix4x4:
                shaderData.setMatrix4x4(propertyID, value as Matrix4x4);
                break;
            case ShaderDataType.Color:
                shaderData.setColor(propertyID, value as Color);
                break;
            case ShaderDataType.Texture2D:
                shaderData.setTexture(propertyID, value as BaseTexture);
                break;
            case ShaderDataType.Vector2:
                shaderData.setVector2(propertyID, value as Vector2);
                break;
            case ShaderDataType.Vector3:
                shaderData.setVector3(propertyID, value as Vector3);
                break;
            case ShaderDataType.Vector4:
                shaderData.setVector(propertyID, value as Vector4);
                break;
            case ShaderDataType.Buffer:
                shaderData.setBuffer(propertyID, value as Float32Array);
                break;
            case ShaderDataType.DeviceBuffer:
            case ShaderDataType.ReadOnlyDeviceBuffer:
                // GLES实现中，设备缓冲区需要特殊处理
                const deviceBuffer = value as GLESDeviceBuffer;
                (shaderData as any).setDeviceBuffer(propertyID, deviceBuffer);
                break;
            default:
                console.warn(`Unsupported shader data type: ${shaderDataType}`);
                break;
        }
    }

    /**
     * 执行缓冲区到缓冲区复制命令
     */
    private _executeBufferToBufferCommand(cmd: IBufferToBufferCommand): void {
        const { src, dest, sourceOffset, destinationOffset, size } = cmd;
        this._nativeObj.copyBufferToBuffer(
            src.getNativeBuffer(),
            dest.getNativeBuffer(),
            sourceOffset,
            destinationOffset,
            size
        );
    }

    /**
     * 执行清理缓冲区命令
     */
    private _executeClearBufferCommand(cmd: IBufferClearCommand): void {
        const { dest, destinationOffset, size } = cmd;
        this._nativeObj.clearBuffer(
            dest.getNativeBuffer(),
            destinationOffset,
            size
        );
    }

    /**
     * 执行缓冲区到纹理复制命令
     */
    private _executeBufferToTextureCommand(cmd: IBufferToTextureCommand): void {
        // TODO: 实现缓冲区到纹理的复制逻辑
        console.warn("BufferToTexture command is not implemented yet");
    }

    /**
     * 执行纹理到缓冲区复制命令
     */
    private _executeTextureToBufferCommand(cmd: ITextureToBufferCommand): void {
        // TODO: 实现纹理到缓冲区的复制逻辑
        console.warn("TextureToBuffer command is not implemented yet");
    }

    /**
     * 执行纹理到纹理复制命令
     */
    private _executeTextureToTextureCommand(cmd: ITextureToTextureCommand): void {
        // TODO: 实现纹理到纹理的复制逻辑
        console.warn("TextureToTexture command is not implemented yet");
    }

    /**
     * 同步执行命令并等待完成
     */
    executeAndWait(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.executeCMDs();
                // 等待GPU完成
                this._nativeObj.finish(() => {
                    resolve();
                }, (error: any) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 检查是否正在执行命令
     */
    get isExecuting(): boolean {
        return this._isExecuting;
    }

    /**
     * 获取当前绑定的着色器
     */
    get currentShader(): GLESComputeShader | null {
        return this._currentShader;
    }

    /**
     * 销毁计算上下文，清空所有命令
     */
    destroy(): void {
        this.clearCMDs();

        if (this._currentShader) {
            this._currentShader.unbind();
            this._currentShader = null;
        }

        if (this._nativeObj) {
            this._nativeObj.release();
            this._nativeObj = null;
        }
    }
} 