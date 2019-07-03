import { Resource } from "../../../resource/Resource";
import { Handler } from "../../../utils/Handler";
import { DefineDatas } from "../../shader/DefineDatas";
import { ShaderData } from "../../shader/ShaderData";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { IClone } from "../IClone";
/**
 * <code>BaseMaterial</code> 类用于创建材质。
 */
export declare class BaseMaterial extends Resource implements IClone {
    /**Material资源。*/
    static MATERIAL: string;
    /** 渲染队列_不透明。*/
    static RENDERQUEUE_OPAQUE: number;
    /** 渲染队列_阿尔法裁剪。*/
    static RENDERQUEUE_ALPHATEST: number;
    /** 渲染队列_透明。*/
    static RENDERQUEUE_TRANSPARENT: number;
    /**着色器变量,透明测试值。*/
    static ALPHATESTVALUE: number;
    /**材质级着色器宏定义,透明测试。*/
    static SHADERDEFINE_ALPHATEST: number;
    static shaderDefines: ShaderDefines;
    /**
     * 加载材质。
     * @param url 材质地址。
     * @param complete 完成回掉。
     */
    static load(url: string, complete: Handler): void;
    /**
     * @inheritDoc
     */
    static _parse(data: any, propertyParams?: any, constructParams?: any[]): BaseMaterial;
    private _alphaTest;
    _shaderValues: ShaderData;
    /** 所属渲染队列. */
    renderQueue: number;
    /**
     * 获取透明测试模式裁剪值。
     * @return 透明测试模式裁剪值。
     */
    /**
    * 设置透明测试模式裁剪值。
    * @param value 透明测试模式裁剪值。
    */
    alphaTestValue: number;
    /**
     * 获取是否透明裁剪。
     * @return 是否透明裁剪。
     */
    /**
    * 设置是否透明裁剪。
    * @param value 是否透明裁剪。
    */
    alphaTest: boolean;
    /**
     * 创建一个 <code>BaseMaterial</code> 实例。
     */
    constructor();
    private _removeTetxureReference;
    /**
     * @inheritDoc
     */
    _addReference(count?: number): void;
    /**
     * @inheritDoc
     */
    _removeReference(count?: number): void;
    /**
     * @inheritDoc
     */
    protected _disposeResource(): void;
    /**
     * 设置使用Shader名字。
     * @param name 名称。
     */
    setShaderName(name: string): void;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
    readonly _defineDatas: DefineDatas;
}
