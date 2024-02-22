import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { VertexDeclaration, VertexStateContext } from "../../../RenderEngine/VertexDeclaration";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";

export class GLESVertexBuffer implements IVertexBuffer {
    _instanceBuffer: boolean;
    _nativeObj:any;
    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage){
        this._nativeObj = new (window as any).conchGLESVertexBuffer(targetType, bufferUsageType);
    }
    private _vertexDeclaration: VertexDeclaration;

    /**@internal */
    _shaderValues: { [key: number]: VertexStateContext };

    public get vertexDeclaration(): VertexDeclaration {
        return this._vertexDeclaration;
    }

    public set vertexDeclaration(value: VertexDeclaration) {
        this._vertexDeclaration = value;
        this._shaderValues = this._vertexDeclaration._shaderValues;
        this._nativeObj.setVertexDeclaration(this._shaderValues);
    }
    public get instanceBuffer(): boolean {
        return this._nativeObj._instanceBuffer;
    }

    public set instanceBuffer(value: boolean) {
        this._nativeObj._instanceBuffer = value;
    }
    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void {
        this._nativeObj.setData(buffer, bufferOffset, dataStartIndex, dataCount);
    }
    setDataLength(byteLength: number): void {
        this._nativeObj.setDataLength(byteLength);
    }
    destory(): void {
        this._nativeObj.destory();
        this._nativeObj = null;
    }

}