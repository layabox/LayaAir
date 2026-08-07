
import { LayaGL } from "../../../layagl/LayaGL";
import { StatElement } from "../../../layagl/StatisticsContext";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { FastSinglelist } from "../../../utils/SingletonList";
import { UniformBufferManager } from "../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferManager";
import { WebGLBufferCluster } from "./WebGLBufferCluster";
import { WebGLEngine } from "./WebGLEngine";
import { GLBuffer } from "./WebGLEngine/GLBuffer";

/** 待 apply 的 ShaderData 的最小面(结构类型,避免 manager 反向依赖 WebGLShaderData 造成循环 import) */
export interface IUniformCacheApplier {
    uploadCache(): void;
}

export class WebGLUniformBufferManager extends UniformBufferManager {

    engine: WebGLEngine;

    /** 攒了 set 改动、等待 apply 的 ShaderData 列表;set 时挂入,upload() 前统一 apply。 */
    _pendingApply: FastSinglelist<IUniformCacheApplier> = new FastSinglelist();

    /** upload() 轮次,每次递增;ShaderData 比对挂入时的轮次做去重。 */
    _uploadRound: number = 0;

    constructor(engine: WebGLEngine, offsetAlignment: number) {
        super(true);
        this.engine = engine;

        this.byteAlign = offsetAlignment;
        engine.on("endFrame", this, this.endFrame);
        engine.on("startFrame", this, this.startFrame)
    }

    /** 先 apply 各 ShaderData 攒的 set 改动(经 setter 自动标脏),再走 cluster 合并上传。 */
    upload() {
        const p = this._pendingApply;
        const arr = p.elements;
        const n = p.length;
        for (let i = 0; i < n; i++)
            arr[i].uploadCache();
        // 保留底层数组供下一轮复用,但必须解除对上一轮 ShaderData 的强引用。
        arr.fill(null, 0, n);
        p.length = 0;
        this._uploadRound++;
        super.upload();
    }

    destroy(): boolean {
        this._pendingApply.clear();
        return super.destroy();
    }

    protected _createBufferCluster(size: number, blockNum: number): WebGLBufferCluster {
        return new WebGLBufferCluster(size, blockNum, this);
    }

    /**
     * 创建GPU内存对象
     * @param size 字节长度
     * @param name 名称
     */
    createGPUBuffer(size: number, name?: string, data?: ArrayBuffer): GLBuffer {
        let buffer = this.engine.createBuffer(BufferTargetType.UNIFORM_BUFFER, BufferUsage.Dynamic);
        buffer.bindBuffer();
        buffer.setDataLength(size);
        if (data) {
            buffer.setData(data, 0);
        }
        return buffer;
    }

    /**
     * 将数据写入GPU内存
     * @param buffer GPU内存对象
     * @param data CPU数据对象
     * @param offset 数据在大内存中的偏移量（字节）
     * @param size 写入的数据长度（字节）
     */
    writeBuffer(buffer: GLBuffer, data: ArrayBuffer, offset: number, size: number): void {
        buffer.bindBuffer();
        let gl = <WebGL2RenderingContext>this.engine.gl;
        gl.bufferSubData(buffer._glTarget, offset, new Float32Array(data, offset, size / 4));
        LayaGL.statAgent.recordCTData(StatElement.CT_UBOBufferUploadCount, 1);
        LayaGL.statAgent.recordCTData(StatElement.CT_UBOBufferUploadMemory, size / 1048576);
        LayaGL.statAgent.recordCTData(StatElement.CT_BufferUploadCount, 1);
    }
}
