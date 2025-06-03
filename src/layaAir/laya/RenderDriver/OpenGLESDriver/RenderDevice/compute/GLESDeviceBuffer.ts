import { EDeviceBufferUsage, IDeviceBuffer } from "../../../DriverDesign/RenderDevice/IDeviceBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { IGPUBuffer } from "../../../DriverDesign/RenderDevice/ComputeShader/IComputeContext";
import { GLESShaderData } from "../GLESShaderData";

/**
 * OpenGL ES设备缓冲区实现
 * 用于在GPU中创建各种各样的Buffer，支持计算着色器和间接渲染
 */
export class GLESDeviceBuffer implements IDeviceBuffer, IGPUBuffer {
    private _nativeObj: any;
    private _usage: EDeviceBufferUsage;
    private _size: number = 0;
    private _cacheShaderData: Map<GLESShaderData, number> = new Map();
    private _destroyed: boolean = false;

    constructor(usage: EDeviceBufferUsage) {
        this._usage = usage;
        // 创建原生OpenGL ES缓冲区对象
        this._nativeObj = new (window as any).conchGLESDeviceBuffer(this._convertUsage(usage));
    }

    /**
     * 将LayaAir的缓冲区用途转换为OpenGL ES的缓冲区用途
     * @param usage LayaAir缓冲区用途
     * @returns OpenGL ES缓冲区用途
     */
    private _convertUsage(usage: EDeviceBufferUsage): number {
        let glUsage = 0;
        
        // 映射到OpenGL ES相应的buffer usage
        if (usage & EDeviceBufferUsage.MAP_READ) {
            glUsage |= 1; // GL_MAP_READ_BIT equivalent
        }
        if (usage & EDeviceBufferUsage.MAP_WRITE) {
            glUsage |= 2; // GL_MAP_WRITE_BIT equivalent
        }
        if (usage & EDeviceBufferUsage.COPY_SRC) {
            glUsage |= 4; // GL_COPY_READ_BUFFER equivalent
        }
        if (usage & EDeviceBufferUsage.COPY_DST) {
            glUsage |= 8; // GL_COPY_WRITE_BUFFER equivalent
        }
        if (usage & EDeviceBufferUsage.STORAGE) {
            glUsage |= 16; // GL_SHADER_STORAGE_BUFFER equivalent
        }
        if (usage & EDeviceBufferUsage.INDIRECT) {
            glUsage |= 32; // GL_DRAW_INDIRECT_BUFFER equivalent
        }
        
        return glUsage;
    }

    /**
     * 添加缓存的着色器数据
     * @param shaderData 着色器数据
     * @param propertyID 属性ID
     */
    _addCacheShaderData(shaderData: GLESShaderData, propertyID: number): void {
        if (!this._cacheShaderData.has(shaderData)) {
            this._cacheShaderData.set(shaderData, propertyID);
        }
    }

    /**
     * 移除缓存的着色器数据
     * @param shaderData 着色器数据
     */
    _removeCacheShaderData(shaderData: GLESShaderData): void {
        if (this._cacheShaderData.has(shaderData)) {
            this._cacheShaderData.delete(shaderData);
        }
    }

    /**
     * 获取原生缓冲区对象
     * @returns 原生缓冲区对象
     */
    getNativeBuffer(): any {
        return this._nativeObj;
    }

    /**
     * 获取缓冲区绑定信息
     * @param binding 绑定点
     * @returns 绑定信息
     */
    getBindInfo(binding: number): any {
        return {
            binding: binding,
            buffer: this._nativeObj,
            offset: 0,
            size: this._size
        };
    }

    /**
     * 设置缓冲区数据
     * @param buffer 源数据缓冲区
     * @param bufferOffset 目标缓冲区偏移量（字节）
     * @param dataStartIndex 源数据起始偏移量（字节）
     * @param dataCount 数据长度（字节）
     */
    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void {
        const needSubData: boolean = dataStartIndex !== 0 || dataCount !== Number.MAX_SAFE_INTEGER;
        
        if (needSubData) {
            // 使用子数据更新
            this._nativeObj.setDataEx(buffer, dataStartIndex, dataCount, bufferOffset);
        } else {
            // 完整数据更新
            this._nativeObj.setData(buffer, bufferOffset);
        }
    }

    /**
     * 设置缓冲区数据长度
     * @param byteLength 字节长度
     */
    setDataLength(byteLength: number): void {
        if (byteLength !== this._size) {
            this._size = byteLength;
            this._nativeObj.setDataLength(byteLength);
        }
    }

    /**
     * 复制数据到另一个缓冲区
     * @param buffer 目标缓冲区
     * @param sourceOffset 源偏移量（字节）
     * @param destOffset 目标偏移量（字节）
     * @param byteLength 复制长度（字节）
     */
    copyToBuffer(buffer: IVertexBuffer | IDeviceBuffer, sourceOffset: number, destOffset: number, byteLength: number): void {
        let destBuffer: any;
        
        // 检查buffer是否实现了IGPUBuffer接口
        if ('getNativeBuffer' in buffer && typeof (buffer as any).getNativeBuffer === 'function') {
            destBuffer = (buffer as IGPUBuffer).getNativeBuffer();
        } else {
            // 如果是IVertexBuffer，需要不同的处理方式
            destBuffer = (buffer as any)._nativeObj || buffer;
        }
        
        this._nativeObj.copyToBuffer(destBuffer, sourceOffset, destOffset, byteLength);
    }

    /**
     * 复制数据到纹理（未实现）
     */
    copyToTexture(): void {
        // TODO: 实现复制到纹理的逻辑
        console.warn("GLESDeviceBuffer.copyToTexture() is not implemented yet");
    }

    /**
     * 从缓冲区读取数据
     * @param dest 目标缓冲区
     * @param destOffset 目标偏移量（字节）
     * @param srcOffset 源偏移量（字节）
     * @param byteLength 读取长度（字节）
     * @returns Promise，异步读取完成
     */
    readData(dest: ArrayBuffer, destOffset: number, srcOffset: number, byteLength: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this._nativeObj.readData(dest, destOffset, srcOffset, byteLength, () => {
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
     * 销毁缓冲区
     */
    destroy(): void {
        if (!this._destroyed) {
            if (this._nativeObj) {
                this._nativeObj.release();
                this._nativeObj = null;
            }
            
            this._cacheShaderData?.clear();
            this._cacheShaderData = null;
            this._destroyed = true;
        }
    }

    /**
     * 检查缓冲区是否已销毁
     */
    get destroyed(): boolean {
        return this._destroyed;
    }

    /**
     * 获取缓冲区大小
     */
    get size(): number {
        return this._size;
    }

    /**
     * 获取缓冲区用途
     */
    get usage(): EDeviceBufferUsage {
        return this._usage;
    }
} 