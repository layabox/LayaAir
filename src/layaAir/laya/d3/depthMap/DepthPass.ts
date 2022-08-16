import { Config3D } from "../../../Config3D";
import { LayaGL } from "../../layagl/LayaGL";
import { Camera } from "../core/Camera";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { ShadowCasterPass } from "../shadowMap/ShadowCasterPass";
import { RenderTexture } from "../resource/RenderTexture";
import { RenderTargetFormat } from "../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Color } from "../math/Color";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderData } from "../../RenderEngine/RenderShader/ShaderData";
import { ShaderDefine } from "../../RenderEngine/RenderShader/ShaderDefine";
import { UnifromBufferData } from "../../RenderEngine/UniformBufferData";
import { UniformBufferObject } from "../../RenderEngine/UniformBufferObject";
import { Vector4 } from "../math/Vector4";
import { Viewport } from "../math/Viewport";
import { RenderClearFlag } from "../../RenderEngine/RenderEnum/RenderClearFlag";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { Stat } from "../../utils/Stat";


/**
 * 深度贴图模式
 */
export enum DepthTextureMode {
    /**不生成深度贴图 */
    None = 0,
    /**生成深度贴图 */
    Depth = 1,
    /**生成深度+法线贴图 */
    DepthNormals = 2,
    /**是否应渲染运动矢量  TODO*/
    MotionVectors = 4
}
/**
 * <code>ShadowCasterPass</code> 类用于实现阴影渲染管线
 */
export class DepthPass {
    private static SHADOW_BIAS: Vector4 = new Vector4();
    /** @internal */
    static DEPTHPASS: ShaderDefine;
    /** @internal */
    static DEFINE_SHADOW_BIAS: number;
    /**@internal */
    static DEPTHTEXTURE: number;
    /**@internal */
    static DEPTHNORMALSTEXTURE: number;
    /**@internal */
    static DEPTHZBUFFERPARAMS: number;
    /**@internal */
    static SHADOWUNIFORMBLOCK: number;


    static __init__() {
        DepthPass.DEPTHPASS = Shader3D.getDefineByName("DEPTHPASS");
        DepthPass.DEFINE_SHADOW_BIAS = Shader3D.propertyNameToID("u_ShadowBias");
        DepthPass.DEPTHTEXTURE = Shader3D.propertyNameToID("u_CameraDepthTexture");
        DepthPass.DEPTHNORMALSTEXTURE = Shader3D.propertyNameToID("u_CameraDepthNormalsTexture");
        DepthPass.DEPTHZBUFFERPARAMS = Shader3D.propertyNameToID("u_ZBufferParams");
        DepthPass.SHADOWUNIFORMBLOCK = Shader3D.propertyNameToID(UniformBufferObject.UBONAME_SHADOW);
    }

    /**@internal */
    private _depthTexture: RenderTexture;
    /**@internal */
    private _depthNormalsTexture: RenderTexture;
    /**@internal */
    private _viewPort: Viewport;
    /**@internal */
    private _camera: Camera;
    /** @internal */
    private _castDepthData: UnifromBufferData;
    /** @internal */
    private _castDepthUBO: UniformBufferObject;
    /**@internal */
    //private _castDepthBuffer:
    private _defaultNormalDepthColor = new Color(0.5, 0.5, 1.0, 0.0);
    // Values used to linearize the Z buffer (http://www.humus.name/temp/Linearize%20depth.txt)
    // x = 1-far/near
    // y = far/near
    // z = x/far
    // w = y/far
    // or in case of a reversed depth buffer (UNITY_REVERSED_Z is 1)
    // x = -1+far/near
    // y = 1
    // z = x/far
    // w = 1/far
    /**@internal */
    private _zBufferParams: Vector4 = new Vector4();

    constructor() {
        if (Config3D._uniformBlock) {
            this._castDepthData = ShadowCasterPass.createDepthCasterUniformBlock();
            this._castDepthUBO = UniformBufferObject.getBuffer(UniformBufferObject.UBONAME_SHADOW, 0);
            if (!this._castDepthUBO) {
                this._castDepthUBO = UniformBufferObject.create(UniformBufferObject.UBONAME_SHADOW, BufferUsage.Dynamic, this._castDepthData.getbyteLength(), true);
            }

        }
    }

    /**
     * 渲染深度更新
     * @param camera 
     * @param depthType 
     */
    update(camera: Camera, depthType: DepthTextureMode, depthTextureFormat: RenderTargetFormat): void {
        this._viewPort = camera.viewport;
        this._camera = camera;
        switch (depthType) {
            case DepthTextureMode.Depth:
                camera.depthTexture = this._depthTexture = RenderTexture.createFromPool(this._viewPort.width, this._viewPort.height, depthTextureFormat, RenderTargetFormat.None, false, 1);
                break;
            case DepthTextureMode.DepthNormals:
                camera.depthNormalTexture = this._depthNormalsTexture = RenderTexture.createFromPool(this._viewPort.width, this._viewPort.height, RenderTargetFormat.R8G8B8A8, depthTextureFormat, false, 1);
                break;
            case DepthTextureMode.MotionVectors:
                //TODO：
                break;
            default:
                throw ("there is UnDefined type of DepthTextureMode")
        }
    }

    /**
     * 渲染深度帧缓存
     * @param context 
     * @param depthType 
     */
    render(context: RenderContext3D, depthType: DepthTextureMode): void {
        var scene = context.scene;
        var shaderValues: ShaderData = scene._shaderValues;
        //this._castDepthUBO && shaderValues.setValueData(Shader3D.propertyNameToID(UniformBufferObject.UBONAME_SHADOW), this._castDepthUBO);
        switch (depthType) {
            case DepthTextureMode.Depth:
                context.pipelineMode = "ShadowCaster";
                shaderValues.addDefine(DepthPass.DEPTHPASS);
                shaderValues.setVector(DepthPass.DEFINE_SHADOW_BIAS, DepthPass.SHADOW_BIAS);
                //if (this._castDepthData) {
                // this._castDepthData._setData(DepthPass.DEFINE_SHADOW_BIAS, DepthPass.SHADOW_BIAS);
                // this._castDepthData._setData(BaseCamera.VIEWPROJECTMATRIX, context.projectionViewMatrix);
                // this._castDepthData.setVector3("u_ShadowLightDirection", Vector3._ZERO);
                //this._castDepthUBO && this._castDepthUBO.setDataByUniformBufferData(this._castDepthData);
                //shaderValues.setValueData(DepthPass.SHADOWUNIFORMBLOCK, this._castDepthUBO)
                //}
                var offsetX: number = this._viewPort.x;
                var offsetY: number = this._viewPort.y;
                this._depthTexture._start();
                LayaGL.renderEngine.viewport(offsetX, offsetY, this._viewPort.width, this._viewPort.height);
                LayaGL.renderEngine.scissor(offsetX, offsetY, this._viewPort.width, this._viewPort.height);
                LayaGL.renderEngine.clearRenderTexture(RenderClearFlag.Depth, null, 1);
                context.changeViewport(offsetX, offsetY, this._viewPort.width, this._viewPort.height);
                context.changeScissor(offsetX, offsetY, this._viewPort.width, this._viewPort.height);
                context.destTarget = this._depthTexture;
                Stat.depthCastDrawCall += scene._opaqueQueue.renderQueue(context);
                this._depthTexture._end();
                this._setupDepthModeShaderValue(depthType, this._camera);
                context.pipelineMode = context.configPipeLineMode;
                shaderValues.removeDefine(DepthPass.DEPTHPASS);
                break;
            case DepthTextureMode.DepthNormals:
                context.pipelineMode = "DepthNormal";
                this._depthNormalsTexture._start();
                //传入shader该传的值
                var offsetX: number = this._viewPort.x;
                var offsetY: number = this._viewPort.y;
                LayaGL.renderEngine.viewport(offsetX, offsetY, this._viewPort.width, this._viewPort.height);
                LayaGL.renderEngine.scissor(offsetX, offsetY, this._viewPort.width, this._viewPort.height);
                LayaGL.renderEngine.clearRenderTexture(RenderClearFlag.Color | RenderClearFlag.Depth, this._defaultNormalDepthColor, 1)
                context.destTarget = this._depthNormalsTexture;
                context.changeViewport(offsetX, offsetY, this._viewPort.width, this._viewPort.height);
                context.changeScissor(offsetX, offsetY, this._viewPort.width, this._viewPort.height);
                Stat.depthCastDrawCall += scene._opaqueQueue.renderQueue(context);
                this._depthNormalsTexture._end();
                this._setupDepthModeShaderValue(depthType, this._camera);
                context.pipelineMode = context.configPipeLineMode;
                break;
            case DepthTextureMode.MotionVectors:
                break;
            default:
                throw ("there is UnDefined type of DepthTextureMode")
        }
    }

    /**
     * 渲染完后传入使用的参数
     * @internal
     */
    _setupDepthModeShaderValue(depthType: DepthTextureMode, camera: Camera) {
        switch (depthType) {
            case DepthTextureMode.Depth:
                var far = camera.farPlane;
                var near = camera.nearPlane;
                this._zBufferParams.setValue(1.0 - far / near, far / near, (near - far) / (near * far), 1 / near);
                camera._shaderValues.setVector(DepthPass.DEFINE_SHADOW_BIAS, DepthPass.SHADOW_BIAS);
                camera._shaderValues.setTexture(DepthPass.DEPTHTEXTURE, this._depthTexture);
                camera._shaderValues.setVector(DepthPass.DEPTHZBUFFERPARAMS, this._zBufferParams);
                break;
            case DepthTextureMode.DepthNormals:
                camera._shaderValues.setTexture(DepthPass.DEPTHNORMALSTEXTURE, this._depthNormalsTexture);
                break;
            case DepthTextureMode.MotionVectors:
                break;
            default:
                throw ("there is UnDefined type of DepthTextureMode")
        }
    }

    /**
     * 清理深度数据
     * @internal
     */
    cleanUp(): void {
        this._depthTexture && RenderTexture.recoverToPool(this._depthTexture);
        this._depthNormalsTexture && RenderTexture.recoverToPool(this._depthNormalsTexture);
        this._depthTexture = null;
        this._depthNormalsTexture = null;
    }
}

