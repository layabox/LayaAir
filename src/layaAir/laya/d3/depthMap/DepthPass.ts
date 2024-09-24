import { Config3D } from "../../../Config3D";
import { Camera } from "../core/Camera";
import { RenderTargetFormat } from "../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { UnifromBufferData } from "../../RenderEngine/UniformBufferData";
import { UniformBufferObject } from "../../RenderEngine/UniformBufferObject";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DepthCasterData } from "./DepthCasterData";
import { Vector4 } from "../../maths/Vector4";
import { DepthTextureMode, RenderTexture } from "../../resource/RenderTexture";
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Viewport } from "../../maths/Viewport";

/**
 * @en The `DepthPass` class is responsible for handling depth rendering and shadow mapping in a 3D scene.
 * @zh `DepthPass` 类负责处理3D场景中的深度渲染和阴影映射。
 */
export class DepthPass {
    static SHADOW_BIAS: Vector4 = new Vector4();
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

    private _zBufferParams: Vector4;

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
    /** @ignore */
    constructor() {
        if (Config3D._uniformBlock) {
            this._castDepthData = DepthCasterData.createDepthCasterUniformBlock();
            this._castDepthUBO = UniformBufferObject.getBuffer(UniformBufferObject.UBONAME_SHADOW, 0);
            if (!this._castDepthUBO) {
                this._castDepthUBO = UniformBufferObject.create(UniformBufferObject.UBONAME_SHADOW, BufferUsage.Dynamic, this._castDepthData.getbyteLength(), true);
            }

        }
    }

    /**
     * @en Creates and assigns the appropriate render texture for capturing depth information based on the specified depth texture mode. This method configures the camera's properties to hold newly created textures prepared for depth or depth normals rendering.
     * @param camera The camera for which the depth texture is being prepared.
     * @param depthType The type of depth texture to create, which determines the kind of data the texture will capture (e.g., depth only, depth and normals).
     * @param depthTextureFormat The format of the depth texture, defining how the data is represented.
     * @zh 根据指定的深度纹理模式创建并分配相应的渲染纹理，用于捕捉深度信息。
     * 此方法配置相机的属性，以保存为深度或深度法线渲染准备的新创建的纹理。
     * @param camera 准备深度纹理的相机。
     * @param depthType 要创建的深度纹理类型，决定纹理将捕捉的数据种类（如仅深度，深度加法线等）。
     * @param depthTextureFormat 深度纹理的格式，定义数据的表示方式。
     */
    getTarget(camera: Camera, depthType: DepthTextureMode, depthTextureFormat: RenderTargetFormat): void {
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
     * @internal
     * @en Parameters passed after rendering is complete.
     * @zh 渲染完后传入使用的参数。
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
            default:
                throw ("there is UnDefined type of DepthTextureMode")
        }
    }

    /**
     * @internal
     * @en Clear the depth data.
     * @zh 清理深度数据
     */
    cleanUp(): void {
        (this._depthTexture instanceof RenderTexture) && this._depthTexture && RenderTexture.recoverToPool(this._depthTexture);
        this._depthNormalsTexture && RenderTexture.recoverToPool(this._depthNormalsTexture);
        this._depthTexture = null;
        this._depthNormalsTexture = null;
    }
}

