import { TypedArrayType, TypedArrayConstructor } from "../../../../../ILaya";

/**
 * 单个 uniform 在 UBO 内的布局项(设备无关的只读描述)。
 * WebGPU/WebGL 的 descriptor 各自计算,但字段一致。
 */
export type UniformLayoutItem = {
    index: number;
    offset: number;              // 字节偏移
    dataView: TypedArrayConstructor;
    view: TypedArrayType;        // per-instance,重定位时重绑
    size: number;                // 源元素数
    alignStride: number;         // 目标每元素步长
    viewByteLength: number;
    arrayLength: number;         // 0 = 非数组
};

/**
 * UBO 布局只读面:UniformBufferWriter 写数据只需要它。
 * 具体的 build 方法(WebGPU setUniforms / WebGL addUniform+finish)后端不同,不在此接口。
 */
export interface IUniformLayout {
    readonly byteLength: number;
    uniforms: Map<number, UniformLayoutItem>;
}
