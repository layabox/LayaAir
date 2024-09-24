import { Plane } from "../math/Plane";
import { BoundSphere } from "../math/BoundSphere";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector3 } from "../../maths/Vector3";
import { LayaGL } from "../../layagl/LayaGL";
import { BoundFrustum } from "../math/BoundFrustum";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Config3D } from "../../../Config3D";
import { UniformBufferObject } from "../../RenderEngine/UniformBufferObject";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { BaseCamera } from "../core/BaseCamera";
import { UnifromBufferData } from "../../RenderEngine/UniformBufferData";



/**
 * @en Camera culling information class.
 * @zh 摄像机裁剪信息类。
 */
export class CameraCullInfo {
    /**
     * @en Position of the camera in the scene.
     * @zh 摄像机在场景中的位置。
     */
    position: Vector3;
    /**
     * @en Whether to use occlusion culling.
     * @zh 是否遮挡剔除 
     */
    useOcclusionCulling: Boolean;
    /**
     * @en Frustum that bounds the camera's view.
     * @zh 摄像机视锥体的包围盒。
     */
    boundFrustum: BoundFrustum;
    /**
     * @en Occlusion Mask
     * @zh 遮挡标记 
     */
    cullingMask: number;
    /**
     * @en Static Mask
     * @zh 静态标记 
     */
    staticMask: number;

    /**
     * @en Create a new instance of CameraCullInfo.
     * @zh 创建 CameraCullInfo 类的新实例。
     */
    constructor() {
        this.boundFrustum = new BoundFrustum(new Matrix4x4());
    }
}

/**
 * @en Shadow culling information.
 * @zh 阴影裁剪信息
 */
export class ShadowCullInfo {
    /**
     * @en Position.
     * @zh 位置。
     */
    position: Vector3;
    /**
     * @en Direction.
     * @zh 方向。
     */
    direction: Vector3;
    /**
     * @en Array of planes used for culling.
     * @zh 用于裁剪的平面数组。
     */
    cullPlanes: Plane[];
    /**
     * @en Sphere used for culling.
     * @zh 用于裁剪的球体。
     */
    cullSphere: BoundSphere;
    /**
     * @en Number of culling planes.
     * @zh 裁剪平面的数量。
     */
    cullPlaneCount: number;
}


/**
 * @en Spotlight Shadow Data
 * @zh 聚光灯阴影数据
 */
export class ShadowSpotData {
    /**
     * @en The camera shader data.
     * @zh 摄像机着色器数据。
     */
    cameraShaderValue: ShaderData;
    /**
     * @en Position of the shadow.
     * @zh 阴影的位置。
     */
    position: Vector3 = new Vector3;
    /**
     * @en Offset on the X-axis for the shadow map.
     * @zh 阴影贴图在X轴上的偏移。
     */
    offsetX: number;
    /**
     * @en Offset on the Y-axis for the shadow map.
     * @zh 阴影贴图在Y轴上的偏移。
     */
    offsetY: number;
    /**
     * @en Resolution of the shadow map.
     * @zh 阴影贴图的分辨率。
     */
    resolution: number;
    /**
     * @en View matrix of the shadow.
     * @zh 阴影的视图矩阵。
     */
    viewMatrix: Matrix4x4 = new Matrix4x4();
    /**
     * @en Projection matrix of the shadow.
     * @zh 阴影的投影矩阵。
     */
    projectionMatrix: Matrix4x4 = new Matrix4x4();
    /**
     * @en Combined view and projection matrix of the shadow.
     * @zh 阴影的视图投影矩阵。
     */
    viewProjectMatrix: Matrix4x4 = new Matrix4x4();
    /**
     * @en Culling information for the shadow camera.
     * @zh 阴影摄像机的裁剪信息。
     */
    cameraCullInfo: CameraCullInfo;
    /**
     * @en Uniform buffer object for the camera.
     * @zh 摄像机的统一缓冲对象。
     */
    cameraUBO: UniformBufferObject;
    /**
     * @en Uniform buffer data for the camera.
     * @zh 摄像机的统一缓冲数据。
     */
    cameraUBData: UnifromBufferData;

    /**
     * @en Create a new instance of ShadowSpotData.
     * @zh 创建 ShadowSpotData 类的新实例。
     */
    constructor() {
        this.cameraShaderValue = LayaGL.renderDeviceFactory.createShaderData(null);

        if (Config3D._uniformBlock) {
            let cameraUBO = UniformBufferObject.getBuffer(UniformBufferObject.UBONAME_CAMERA, 0);
            let cameraUBData = BaseCamera.createCameraUniformBlock();

            if (!cameraUBO) {
                cameraUBO = UniformBufferObject.create(UniformBufferObject.UBONAME_CAMERA, BufferUsage.Dynamic, cameraUBData.getbyteLength(), false);
            }

            this.cameraShaderValue._addCheckUBO(UniformBufferObject.UBONAME_CAMERA, cameraUBO, cameraUBData);
            this.cameraShaderValue.setUniformBuffer(BaseCamera.CAMERAUNIFORMBLOCK, cameraUBO);

            this.cameraUBO = cameraUBO;
            this.cameraUBData = cameraUBData;
        }

        this.cameraCullInfo = new CameraCullInfo();

    }
}

/**
 * @internal
 * @en Shadow Slice Data.
 * @zh 阴影分割数据。
 */
export class ShadowSliceData {
    /**
     * @en Shader data associated with the shadow slice.
     * @zh 与阴影切片关联的着色器数据。
     */
    cameraShaderValue: ShaderData;

    /**
     * @en Uniform buffer object for the shadow slice camera.
     * @zh 阴影切片摄像机的统一缓冲对象。
     */
    cameraUBO: UniformBufferObject;

    /**
     * @en Uniform buffer data for the shadow slice camera.
     * @zh 阴影切片摄像机的统一缓冲数据。
     */
    cameraUBData: UnifromBufferData; 

    /**
     * @en Position of the shadow slice in world space.
     * @zh 阴影切片在世界空间中的位置。
     */
    position: Vector3 = new Vector3();

    /**
     * @en X-axis offset for the shadow map.
     * @zh 阴影贴图的X轴偏移。
     */
    offsetX: number;

    /**
     * @en Y-axis offset for the shadow map.
     * @zh 阴影贴图的Y轴偏移。
     */
    offsetY: number;

    /**
     * @en Resolution of the shadow map for the slice.
     * @zh 阴影切片的阴影贴图分辨率。
     */
    resolution: number;

    /**
     * @en View matrix of the shadow slice camera.
     * @zh 阴影切片摄像机的视图矩阵。
     */
    viewMatrix: Matrix4x4 = new Matrix4x4();

    /**
     * @en Projection matrix of the shadow slice camera.
     * @zh 阴影切片摄像机的投影矩阵。
     */
    projectionMatrix: Matrix4x4 = new Matrix4x4();

    /**
     * @en Combined view and projection matrix for the shadow slice camera.
     * @zh 阴影切片摄像机的视图投影矩阵。
     */
    viewProjectMatrix: Matrix4x4 = new Matrix4x4();

    /**
     * @en Array of planes used for culling in the shadow slice.
     * @zh 阴影切片中用于裁剪的平面数组。
     */
    cullPlanes: Array<Plane> = [new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0)];

    /**
     * @en Total count of culling planes.
     * @zh 裁剪平面的总数。
     */
    cullPlaneCount: number;

    /**
     * @en Bounding sphere for the shadow slice.
     * @zh 阴影切片的包围球体。
     */
    splitBoundSphere: BoundSphere = new BoundSphere(new Vector3(), 0.0);

    /**
     * @en Center Z coordinate of the bounding sphere for culling.
     * @zh 用于裁剪的包围球体的中心Z坐标。
     */
    sphereCenterZ: number;

    /**
     * @en Create a new instance of ShadowSliceData.
     * @zh 创建 ShadowSliceData 类的新实例。
     */
    constructor() {
        this.cameraShaderValue = LayaGL.renderDeviceFactory.createShaderData(null);

        if (Config3D._uniformBlock) {
            let cameraUBO = UniformBufferObject.getBuffer(UniformBufferObject.UBONAME_CAMERA, 0);
            let cameraUBData = BaseCamera.createCameraUniformBlock();

            if (!cameraUBO) {
                cameraUBO = UniformBufferObject.create(UniformBufferObject.UBONAME_CAMERA, BufferUsage.Dynamic, cameraUBData.getbyteLength(), false);
            }

            this.cameraShaderValue._addCheckUBO(UniformBufferObject.UBONAME_CAMERA, cameraUBO, cameraUBData);
            this.cameraShaderValue.setUniformBuffer(BaseCamera.CAMERAUNIFORMBLOCK, cameraUBO);

            this.cameraUBO = cameraUBO;
            this.cameraUBData = cameraUBData;
        }

    }
}
