import { LayaGL } from "../../layagl/LayaGL";
import { EDeviceBufferUsage, IDeviceBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IDeviceBuffer";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferTargetType, BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { RenderCapable } from "../../RenderEngine/RenderEnum/RenderCapable";
import { VertexBuffer3D } from "./VertexBuffer3D";

export class DeviceBuffer {

    private _deviceBuffer: IDeviceBuffer;

    get deviceBuffer(): IDeviceBuffer {
        return this._deviceBuffer;
    }

    private _vertexBuffer: IVertexBuffer;
    private _vertexBuffer3D: VertexBuffer3D;

    get vertexBuffer(): VertexBuffer3D {
        return this._vertexBuffer3D;
    }

    constructor(byteLength: number, usage: EDeviceBufferUsage) {
        if (!LayaGL.renderEngine.getCapable(RenderCapable.ComputeShader)) {
            return;
        }

        // vertex and storage
        if (usage & EDeviceBufferUsage.VERTEX) {
            this._vertexBuffer = LayaGL.renderDeviceFactory.createDeviceVertexBuffer(usage);
            this._deviceBuffer = this._vertexBuffer.getStorageBuffer();
            this._vertexBuffer.setDataLength(byteLength);

            this._vertexBuffer3D = new VertexBuffer3D(0, BufferUsage.Dynamic, false);
            this._vertexBuffer3D.destroy();
            this._vertexBuffer3D._deviceBuffer = this._vertexBuffer;
            this._vertexBuffer3D._byteLength = byteLength;
        }
        else {
            this._deviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(usage);
            this._deviceBuffer.setDataLength(byteLength);
        }

    }

    destroy() {
        this.vertexBuffer?.destroy();
        this._deviceBuffer.destroy();
    }

}