import { LayaGL } from "../../../layagl/LayaGL";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";


export class NativeUniformBufferObject extends UniformBufferObject{
    _conchUniformBufferObject:any = null;

    constructor(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean) {
        super(glPointer, name, bufferUsage, byteLength, isSingle);
        this._conchUniformBufferObject = new (window as any).conchUniformBufferObject((LayaGL.renderEngine as any)._nativeObj, glPointer);
        this._conchUniformBufferObject.setGLBuffer(this._glBuffer);
    }
}