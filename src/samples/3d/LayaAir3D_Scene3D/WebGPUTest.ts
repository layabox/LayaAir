import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Laya3DRender } from "laya/d3/RenderObjs/Laya3DRender";
import { WebUnitRenderModuleDataFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/WebUnitRenderModuleDataFactory"
import { Web3DRenderModuleFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/3D/Web3DRenderModuleFactory"
import { WebGLRenderEngineFactory } from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderEngineFactory";
import { WebGL3DRenderPassFactory } from "laya/RenderDriver/WebGLDriver/3DRenderPass/WebGL3DRenderPassFactory"
import { WebGLRenderDeviceFactory } from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderDeviceFactory"
import { LengencyRenderEngine3DFactory } from "laya/RenderDriver/DriverDesign/3DRenderPass/LengencyRenderEngine3DFactory"
import { LayaGL } from "laya/layagl/LayaGL";
import { WebGPURenderDeviceFactory } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPURenderDeviceFactory";
import { WebGPU3DRenderPassFactory } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPU3DRenderPassFactory";
import { WebGPURenderEngineFactory } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPURenderEngineFactory";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Vector3 } from "laya/maths/Vector3";
import { Texture2D } from "laya/resource/Texture2D";
import { Stat } from "laya/utils/Stat";
import { MeshFilter } from "laya/d3/core/MeshFilter";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { Color } from "laya/maths/Color";
import { Material } from "laya/resource/Material";
import { Quaternion } from "laya/maths/Quaternion";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ScreenQuad } from "laya/d3/core/render/ScreenQuad";
import { WebGPUStatis } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUStatis/WebGPUStatis";
import { Config3D } from "Config3D";

export class WebGPUTest {
    rotation1: Vector3 = new Vector3(0, 0.01, 0);
    rotation2: Vector3 = new Vector3(0, 0.02, 0);
    useWebGPU: boolean = true;

    constructor() {
        LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
        Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
        Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();

        if (this.useWebGPU) {
            LayaGL.renderOBJCreate = new WebGPURenderEngineFactory();
            LayaGL.renderDeviceFactory = new WebGPURenderDeviceFactory();
            Laya3DRender.Render3DPassFactory = new WebGPU3DRenderPassFactory();
        } else {
            LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
            LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
            Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
        }

        Laya.init(0, 0).then(async () => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Config3D.enableDynamicBatch = false;
            //Stat.show();

            await Laya.loader.load("res/testMaterial/UnLight.shader");

            const scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

            const camera: Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 200))));
            camera.transform.translate(new Vector3(0, 0.5, 5));
            camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
            camera.clearColor = Color.BLUE;
            camera.clearFlag = CameraClearFlags.SolidColor;
            camera.addComponent(CameraMoveScript);

            // const directlightSprite = new Sprite3D();
            // const dircom = directlightSprite.addComponent(DirectionLightCom);
            // scene.addChild(directlightSprite);
            // dircom.color.setValue(1, 1, 1, 1);

            const sphereMesh1 = PrimitiveMesh.createSphere(0.15, 16, 16);
            const boxMesh1 = PrimitiveMesh.createBox(0.2, 0.2, 0.2);
            const boxMesh2 = PrimitiveMesh.createBox(0.6, 0.6, 0.6);

            const material1 = new UnlitMaterial();
            const material2 = new UnlitMaterial();

            const boxS3D = [];
            const sphereS3D = [];

            const n = 5;
            const m = 5;
            const l = 5;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < m; j++) {
                    for (let k = 0; k < l; k++) {
                        const bs3d = scene.addChild(new Sprite3D());
                        boxS3D.push(bs3d);
                        bs3d.transform.position = new Vector3(i - n * 0.5, j - m * 0.5, k - l * 0.5);
                        bs3d.addComponent(MeshFilter).sharedMesh = boxMesh1;
                        bs3d.addComponent(MeshRenderer).material = material1;
                        //@ts-ignore
                        bs3d.rotate = new Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02);
                    }
                }
            }
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < m; j++) {
                    for (let k = 0; k < l; k++) {
                        const sp3d = scene.addChild(new Sprite3D());
                        sphereS3D.push(sp3d);
                        sp3d.transform.position = new Vector3(i - n * 0.5 - 0.5, j - m * 0.5, k - l * 0.5);
                        sp3d.addComponent(MeshFilter).sharedMesh = sphereMesh1;
                        sp3d.addComponent(MeshRenderer).material = material2;
                        //@ts-ignore
                        sp3d.rotate = new Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02);
                    }
                }
            }

            // const earth1 = scene.addChild(new Sprite3D());
            // earth1.transform.position = new Vector3(0, 0, 0);
            // const meshFilter1 = earth1.addComponent(MeshFilter);
            // const meshRenderer1 = earth1.addComponent(MeshRenderer);
            // meshFilter1.sharedMesh = boxMesh1;
            // meshRenderer1.castShadow = false;
            // meshRenderer1.receiveShadow = false;

            // const earth2 = scene.addChild(new Sprite3D());
            // earth2.transform.position = new Vector3(0.5, 0, 0);
            // const meshFilter2 = earth2.addComponent(MeshFilter);
            // const meshRenderer2 = earth2.addComponent(MeshRenderer);
            // meshFilter2.sharedMesh = sphereMesh1;
            // meshRenderer2.castShadow = false;
            // meshRenderer2.receiveShadow = false;

            Texture2D.load("res/threeDimen/texture/earth.jpg", Handler.create(this, (texture: Texture2D) => {
                material1.albedoTexture = texture;
            }));
            Texture2D.load("res/threeDimen/texture/brick.jpg", Handler.create(this, (texture: Texture2D) => {
                material2.albedoTexture = texture;
            }));

            Laya.timer.frameLoop(1, this, () => {
                for (let i = boxS3D.length - 1; i > -1; i--) {
                    boxS3D[i].transform.rotate(boxS3D[i].rotate, false);
                }
                for (let i = sphereS3D.length - 1; i > -1; i--) {
                    sphereS3D[i].transform.rotate(sphereS3D[i].rotate, false);
                }
            });

            Laya.timer.once(5000, this, () => { WebGPUStatis.printStatisticsAsTable(); });
        });
    }
}