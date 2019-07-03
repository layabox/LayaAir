import { CommandEncoder } from "./CommandEncoder";
/**
 * @private
 * 封装GL命令
 */
export class LayaGL {
    //TODO:coverage
    createCommandEncoder(reserveSize = 128, adjustSize = 64, isSyncToRenderThread = false) {
        return new CommandEncoder(this, reserveSize, adjustSize, isSyncToRenderThread);
    }
    beginCommandEncoding(commandEncoder) {
    }
    endCommandEncoding() {
    }
    //TODO:coverage
    static getFrameCount() {
        return 0;
    }
    static syncBufferToRenderThread(value, index = 0) {
    }
    static createArrayBufferRef(arrayBuffer, type, syncRender) {
    }
    static createArrayBufferRefs(arrayBuffer, type, syncRender, refType) {
    }
    matrix4x4Multiply(m1, m2, out) {
    }
    evaluateClipDatasRealTime(nodes, playCurTime, realTimeCurrentFrameIndexs, addtive) {
    }
}
//-------------------------------------------------------------------------------------
LayaGL.EXECUTE_JS_THREAD_BUFFER = 0; //直接执行JS线程中的buffer
LayaGL.EXECUTE_RENDER_THREAD_BUFFER = 1; //直接执行渲染线程的buffer
LayaGL.EXECUTE_COPY_TO_RENDER = 2; //拷贝buffer到渲染线程
LayaGL.EXECUTE_COPY_TO_RENDER3D = 3; //拷贝3Dbuffer到渲染线程
//-------------------------------------------------------------------------------------
LayaGL.ARRAY_BUFFER_TYPE_DATA = 0; //创建ArrayBuffer时的类型为Data
LayaGL.ARRAY_BUFFER_TYPE_CMD = 1; //创建ArrayBuffer时的类型为Command
LayaGL.ARRAY_BUFFER_REF_REFERENCE = 0; //创建ArrayBuffer时的类型为引用
LayaGL.ARRAY_BUFFER_REF_COPY = 1; //创建ArrayBuffer时的类型为拷贝
LayaGL.UPLOAD_SHADER_UNIFORM_TYPE_ID = 0; //data按照ID传入
LayaGL.UPLOAD_SHADER_UNIFORM_TYPE_DATA = 1; //data按照数据传入
