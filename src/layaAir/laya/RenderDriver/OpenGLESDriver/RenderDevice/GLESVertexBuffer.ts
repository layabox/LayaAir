import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { VertexDeclaration, VertexStateContext } from "../../../RenderEngine/VertexDeclaration";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";

export class GLESVertexBuffer implements IVertexBuffer {
    _instanceBuffer: boolean;
    _nativeObj:any;

    canRead:boolean;
    _buffer:ArrayBuffer;
    
    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage){
        this._nativeObj = new (window as any).conchGLESVertexBuffer(targetType, bufferUsageType);
    }
    private _vertexDeclaration: VertexDeclaration;

    /**@internal */
    _shaderValues: { [key: number]: VertexStateContext };
    /**@internal */
	private _attributeMapTemp: Map<number, VertexStateContext> = new Map();

    public get vertexDeclaration(): VertexDeclaration {
        return this._vertexDeclaration;
    }

    public set vertexDeclaration(value: VertexDeclaration) {
        this._vertexDeclaration = value;
        this._shaderValues = this._vertexDeclaration._shaderValues;
       
        //this._attributeMapTemp.clear();
        this._nativeObj.clearVertexDeclaration();
		for (var k in this._shaderValues) {
			//this._attributeMapTemp.set(parseInt(k), this._shaderValues[k]);
            this._nativeObj.setVertexDeclaration(parseInt(k), this._shaderValues[k]);
		}

        //this._nativeObj.setVertexDeclaration(this._attributeMapTemp);
    }
    public get instanceBuffer(): boolean {
        return this._nativeObj._instanceBuffer;
    }

    public set instanceBuffer(value: boolean) {
        this._nativeObj._instanceBuffer = value;
    }
    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void {
        this._nativeObj.setData(buffer, bufferOffset, dataStartIndex, dataCount);
        if (this.canRead) {
            this._buffer = buffer;
        }
    }

    getData():Readonly<ArrayBuffer>{
        if (this.canRead) {
            return this._buffer;
        }else{
			throw new Error("Can't read data from VertexBuffer with only write flag!");
        }
    }

    setDataLength(byteLength: number): void {
        this._nativeObj.setDataLength(byteLength);
    }
    destroy(): void {
        this._nativeObj.destroy();
        this._nativeObj = null;
    }

}