// import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
// import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
// import { LayaGL } from "../../../layagl/LayaGL";
// import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";


// export class NativeIndexBuffer3D extends IndexBuffer3D {

//     _conchIndexBuffer3D:any = null;

//     /**
//      * 创建一个 <code>VertexBuffer3D</code> 实例。
//      * @param	byteLength 字节长度。
//      * @param	bufferUsage VertexBuffer3D用途类型。
//      * @param	canRead 是否可读。
//      */
//     constructor(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage = BufferUsage.Static, canRead: boolean = false) {
//         super(indexType,indexCount,bufferUsage,canRead)
//         this._conchIndexBuffer3D = new (window as any).conchIndexBuffer3D( (LayaGL.renderEngine as any)._nativeObj,indexType,indexCount,bufferUsage,false);
//         this._conchIndexBuffer3D.setGLBuffer(this._glBuffer);
//      }
// }