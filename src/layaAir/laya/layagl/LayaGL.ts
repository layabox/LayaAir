import { LayaGPU } from "../webgl/LayaGPU";

/**
 * @internal
 * 封装GL命令
 */
export class LayaGL {
    static ARRAY_BUFFER_TYPE_DATA: number = 0;           	//创建ArrayBuffer时的类型为Data
    static ARRAY_BUFFER_TYPE_CMD: number = 1;            	//创建ArrayBuffer时的类型为Command

    static ARRAY_BUFFER_REF_REFERENCE: number = 0;			//创建ArrayBuffer时的类型为引用
    static ARRAY_BUFFER_REF_COPY: number = 1;				//创建ArrayBuffer时的类型为拷贝

    static UPLOAD_SHADER_UNIFORM_TYPE_ID: number = 0;      //data按照ID传入
    static UPLOAD_SHADER_UNIFORM_TYPE_DATA: number = 1;    //data按照数据传入

    static instance: WebGLRenderingContext;
    static layaGPUInstance: LayaGPU;
}



