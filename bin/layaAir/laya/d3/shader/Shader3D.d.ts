import { SubShader } from "././SubShader";
/**
 * <code>Shader3D</code> 类用于创建Shader3D。
 */
export declare class Shader3D {
    /**渲染状态_剔除。*/
    static RENDER_STATE_CULL: number;
    /**渲染状态_混合。*/
    static RENDER_STATE_BLEND: number;
    /**渲染状态_混合源。*/
    static RENDER_STATE_BLEND_SRC: number;
    /**渲染状态_混合目标。*/
    static RENDER_STATE_BLEND_DST: number;
    /**渲染状态_混合源RGB。*/
    static RENDER_STATE_BLEND_SRC_RGB: number;
    /**渲染状态_混合目标RGB。*/
    static RENDER_STATE_BLEND_DST_RGB: number;
    /**渲染状态_混合源ALPHA。*/
    static RENDER_STATE_BLEND_SRC_ALPHA: number;
    /**渲染状态_混合目标ALPHA。*/
    static RENDER_STATE_BLEND_DST_ALPHA: number;
    /**渲染状态_混合常量颜色。*/
    static RENDER_STATE_BLEND_CONST_COLOR: number;
    /**渲染状态_混合方程。*/
    static RENDER_STATE_BLEND_EQUATION: number;
    /**渲染状态_RGB混合方程。*/
    static RENDER_STATE_BLEND_EQUATION_RGB: number;
    /**渲染状态_ALPHA混合方程。*/
    static RENDER_STATE_BLEND_EQUATION_ALPHA: number;
    /**渲染状态_深度测试。*/
    static RENDER_STATE_DEPTH_TEST: number;
    /**渲染状态_深度写入。*/
    static RENDER_STATE_DEPTH_WRITE: number;
    /**shader变量提交周期，自定义。*/
    static PERIOD_CUSTOM: number;
    /**shader变量提交周期，逐材质。*/
    static PERIOD_MATERIAL: number;
    /**shader变量提交周期，逐精灵和相机，注：因为精灵包含MVP矩阵，为复合属性，所以摄像机发生变化时也应提交。*/
    static PERIOD_SPRITE: number;
    /**shader变量提交周期，逐相机。*/
    static PERIOD_CAMERA: number;
    /**shader变量提交周期，逐场景。*/
    static PERIOD_SCENE: number;
    /**@private */
    static SHADERDEFINE_HIGHPRECISION: number;
    /**@private */
    private static _propertyNameCounter;
    /**@private */
    private static _propertyNameMap;
    /**@private */
    private static _publicCounter;
    /**@private */
    _attributeMap: any;
    /**@private */
    _uniformMap: any;
    /**@private */
    static _globleDefines: any[];
    /**@private */
    static _preCompileShader: any;
    /**是否开启调试模式。 */
    static debugMode: boolean;
    /**
     * 通过Shader属性名称获得唯一ID。
     * @param name Shader属性名称。
     * @return 唯一ID。
     */
    static propertyNameToID(name: string): number;
    /**
     * @private
     */
    static addInclude(fileName: string, txt: string): void;
    /**
     * @private
     */
    static registerPublicDefine(name: string): number;
    /**
     * 编译shader。
     * @param	name Shader名称。
     * @param   subShaderIndex 子着色器索引。
     * @param   passIndex  通道索引。
     * @param	publicDefine 公共宏定义值。
     * @param	spriteDefine 精灵宏定义值。
     * @param	materialDefine 材质宏定义值。
     */
    static compileShader(name: string, subShaderIndex: number, passIndex: number, publicDefine: number, spriteDefine: number, materialDefine: number): void;
    /**
     * @private
     * 添加预编译shader文件，主要是处理宏定义
     */
    static add(name: string, attributeMap?: any, uniformMap?: any, enableInstancing?: boolean): Shader3D;
    /**
     * 获取ShaderCompile3D。
     * @param	name
     * @return ShaderCompile3D。
     */
    static find(name: string): Shader3D;
    /**@private */
    _name: string;
    /**@private */
    _enableInstancing: boolean;
    /**@private */
    _subShaders: SubShader[];
    /**
     * 创建一个 <code>Shader3D</code> 实例。
     */
    constructor(name: string, attributeMap: any, uniformMap: any, enableInstancing: boolean);
    /**
     * 添加子着色器。
     * @param 子着色器。
     */
    addSubShader(subShader: SubShader): void;
    /**
     * 在特定索引获取子着色器。
     * @param	index 索引。
     * @return 子着色器。
     */
    getSubShaderAt(index: number): SubShader;
}
