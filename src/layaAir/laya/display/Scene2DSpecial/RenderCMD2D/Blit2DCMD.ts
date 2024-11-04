import { LayaGL } from "../../../layagl/LayaGL";
import { Vector4 } from "../../../maths/Vector4";
import { Blit2DQuadCMD } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IRenderTarget } from "../../../RenderDriver/DriverDesign/RenderDevice/IRenderTarget";
import { ShaderData, ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Texture2D } from "../../../resource/Texture2D";
import { Command2D } from "./Command2D";

export class Blit2DCMD extends Command2D {

    private static QuadGeometry: IRenderGeometryElement;

    private static _defaultShader: Shader3D;

    private static _blitShaderData: ShaderData;

    private static _defaultOffsetScale: Vector4 = new Vector4(0, 0, 1, 1);

    private static __initBlitShader__() {
        //ShaderInit
        let blitvs = `
        #define SHADER_NAME Blit2DVS

        varying vec2 v_Texcoord0;

        void main()
        {
            gl_Position = vec4(u_OffsetScale.x * 2.0 - 1.0 + (a_PositionTexcoord.x + 1.0) * u_OffsetScale.z, (1.0 - ((u_OffsetScale.y * 2.0 - 1.0 + (-a_PositionTexcoord.y + 1.0) * u_OffsetScale.w) + 1.0) / 2.0) * 2.0 - 1.0, 0.0, 1.0);

            v_Texcoord0 = a_PositionTexcoord.zw;
        }
        `;
        let blitfs = `
        #define SHADER_NAME Blit2DFS

        #include "Color.glsl";

        varying vec2 v_Texcoord0;

        void main()
        {
            vec4 mainColor = texture2D(u_MainTex, v_Texcoord0);
            #ifdef Gamma_u_MainTex
            mainColor = gammaToLinear(mainColor);
            #endif // Gamma_u_AlbedoTexture
            gl_FragColor = mainColor;
            gl_FragColor = outputTransform(gl_FragColor);
        }
        `;
        let attributeMap: { [name: string]: [number, ShaderDataType] } = {
            "a_PositionTexcoord": [0, ShaderDataType.Vector4]
        };
        let uniformMap = {
            "u_OffsetScale": ShaderDataType.Vector4,
            "u_MainTex": ShaderDataType.Texture2D,
            "u_MainTex_TexelSize": ShaderDataType.Vector4, //x:width,y:height,z:1/width,w:1/height
        };
        let shader = Shader3D.add("Blit2DCMD");
        shader.shaderType = ShaderFeatureType.PostProcess;
        let subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        let blitPass = subShader.addShaderPass(blitvs, blitfs);
        blitPass.statefirst = true;
        blitPass.renderState.depthWrite = false;
        blitPass.renderState.depthTest = RenderState.DEPTHTEST_OFF;
        blitPass.renderState.blend = RenderState.BLEND_ENABLE_ALL;
        blitPass.renderState.blendEquation = RenderState.BLENDEQUATION_ADD;
        blitPass.renderState.srcBlend = RenderState.BLENDPARAM_ONE;
        blitPass.renderState.dstBlend = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        blitPass.renderState.cull = RenderState.CULL_NONE;

    }

    private static __initGeometryElement__() {
        let _vertices: Float32Array = new Float32Array([
            1, 1, 1, 1,
            1, -1, 1, 0,
            -1, 1, 0, 1,
            -1, -1, 0, 0]);
        let vertexDec = new VertexDeclaration(16, [new VertexElement(0, VertexElementFormat.Vector4, 0)]);
        let vertex = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        vertex.vertexDeclaration = vertexDec;
        vertex.setDataLength(_vertices.buffer.byteLength);
        vertex.setData(_vertices.buffer, 0, 0, _vertices.buffer.byteLength);
        let bufferState = LayaGL.renderDeviceFactory.createBufferState();
        bufferState.applyState([vertex], null);
        let geometry = Blit2DCMD.QuadGeometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.TriangleStrip, DrawType.DrawArray);
        geometry.setDrawArrayParams(0, 4);
        geometry.bufferState = bufferState;
    }

    private static __init__() {
        Blit2DCMD.__initBlitShader__();
        Blit2DCMD.__initGeometryElement__();
        Blit2DCMD._blitShaderData = LayaGL.renderDeviceFactory.createShaderData();
        Blit2DCMD._defaultShader = Shader3D.find("Blit2DCMD");
    }

    private static _pool: any[] = [];

    /**
     * @en creat a blit2D render Command
     * @param source copy source
     * @param dest copy dest rt
     * @param offsetScale offset and scale Value,(Based on percentage)
     * @param shader use shader
     * @param shaderData data for shader
     * @returns 
     * @zh 创建一个纹理拷贝渲染指令
     * @param source 拷贝原图
     * @param dest 拷贝目标
     * @param offsetScale 偏移缩放（基于百分比）
     * @param shader 拷贝使用Shader
     * @param shaderData 拷贝使用的shader对应的渲染数据
     * @returns 
     */
    static create(source: BaseTexture, dest: IRenderTarget, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null) {
        if (!Blit2DCMD._blitShaderData)
            Blit2DCMD.__init__();
        var cmd: Blit2DCMD;
        cmd = Blit2DCMD._pool.length > 0 ? Blit2DCMD._pool.pop() : new Blit2DCMD();
        cmd.source = source;
        cmd.dest = dest;
        cmd.offsetScale = offsetScale;
        cmd.setshader(shader, shaderData);
        return cmd;
    }

    private _source: BaseTexture = null;

    private _dest: IRenderTarget = null;

    private _offsetScale: Vector4 = new Vector4();

    private _shader: Shader3D = null;

    private _shaderData: ShaderData = null;

    private _renderElement: IRenderElement2D;

    /**
     * @internal
     */
    _blitQuadCMDData: Blit2DQuadCMD;

    constructor() {
        super();
        this._renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        this._blitQuadCMDData = LayaGL.render2DRenderPassFactory.createBlit2DQuadCMDData();
        this._blitQuadCMDData.element = this._renderElement;
        this._renderElement.geometry = Blit2DCMD.QuadGeometry;
        this._renderElement.nodeCommonMap = null;
        this._renderElement.renderStateIsBySprite = false;
    }

    /**
     * @en The offset and scale for rendering.
     * @zh 渲染的偏移和缩放。
     */
    get offsetScale(): Vector4 {
        return this._offsetScale;
    }

    set offsetScale(value: Vector4) {
        value ? value.cloneTo(this._offsetScale) : Blit2DCMD._defaultOffsetScale.cloneTo(this._offsetScale);
        this._blitQuadCMDData.offsetScale = this._offsetScale;
    }

    /**
    * @en The destination render texture.
    * @zh 目标渲染纹理。
    */
    get source(): BaseTexture {
        return this._source;
    }

    set source(value: BaseTexture) {
        this._source = value;
        this._blitQuadCMDData.source = value ? value._texture : Texture2D.blackTexture._texture;
    }

    /**
     * @en The destination render texture.
     * @zh 目标渲染纹理。
     */
    get dest(): IRenderTarget {
        return this._dest;
    }

    set dest(value: IRenderTarget) {
        this._dest = value;
        this._blitQuadCMDData.dest = value ? value._renderTarget : null;
    }

    /**
     * @en The shader data for rendering.
     * @zh 渲染的着色器数据。
     */
    set shaderData(value: ShaderData) {
        this._shaderData = value || Blit2DCMD._blitShaderData;
        this._renderElement.materialShaderData = this._shaderData;
    }

    /**
     * @override
     * @internal
     * @returns 
     */
    getRenderCMD(): Blit2DQuadCMD {
        return this._blitQuadCMDData;
    }

    /**
     * @en change render shader
     * @param shader use shader
     * @param subShader shader index of ShaderList
     * @param shaderData data for shader
     * @zh 设置着色器
     * @param shader 使用着色器
     * @param subShader 着色器索引（目前都是0）
     * @param shaderData 着色器数据
     */
    setshader(shader: Shader3D, shaderData: ShaderData) {
        this._shader = shader || Blit2DCMD._defaultShader;
        this.shaderData = shaderData;
        this._renderElement.subShader = this._shader.getSubShaderAt(0);
    }

    /**
     * @destroy
     */
    destroy() {
        this._commandBuffer = null;
        this._context = null;
    }

}