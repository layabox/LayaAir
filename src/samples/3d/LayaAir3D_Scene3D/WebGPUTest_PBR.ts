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
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Vector3 } from "laya/maths/Vector3";
import { Stat } from "laya/utils/Stat";
import { MeshFilter } from "laya/d3/core/MeshFilter";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { Color } from "laya/maths/Color";
import { WebGPUStatis } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUStatis/WebGPUStatis";
import { Config3D } from "Config3D";
import { WebGPURenderEngine } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPURenderEngine";
import { Loader } from "laya/net/Loader";
import { WebGLRender2DProcess } from "laya/RenderDriver/WebGLDriver/2DRenderPass/WebGLRender2DProcess";
import { WebGPURender2DProcess } from "laya/RenderDriver/WebGPUDriver/2DRenderPass/WebGPURender2DProcess";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { PostProcess } from "laya/d3/component/PostProcess";
import { BloomEffect } from "laya/d3/core/render/PostEffect/BloomEffect";
import { SkyProceduralMaterial } from "laya/d3/core/material/SkyProceduralMaterial";
import { SkyDome } from "laya/d3/resource/models/SkyDome";
import { MeshAddTangent } from "laya/RenderDriver/WebGPUDriver/RenderDevice/Utils/MeshEditor";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";

export class WebGPUTest_PBR {
    useWebGPU: boolean = true;

    constructor() {
        LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
        Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
        Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();

        if (this.useWebGPU) {
            LayaGL.renderOBJCreate = new WebGPURenderEngineFactory();
            LayaGL.renderDeviceFactory = new WebGPURenderDeviceFactory();
            LayaGL.render2DRenderPassFactory = new WebGPURender2DProcess();
            Laya3DRender.Render3DPassFactory = new WebGPU3DRenderPassFactory();
        } else {
            LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
            LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
            LayaGL.render2DRenderPassFactory = new WebGLRender2DProcess();
            Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
        }

        Laya.init(0, 0).then(async () => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Config3D.enableDynamicBatch = false;
            //Stat.show();

            const scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

            //初始化天空渲染器
            // const skyRenderer = scene.skyRenderer;
            // //创建天空盒mesh
            // skyRenderer.mesh = SkyDome.instance;
            // //使用程序化天空盒
            // skyRenderer.material = new SkyProceduralMaterial();

            const camera: Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 300))));
            camera.transform.translate(new Vector3(0, 0.5, 5));
            camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
            camera.clearColor = Color.BLACK;
            camera.clearFlag = CameraClearFlags.SolidColor;
            camera.msaa = true;
            if (this.useWebGPU) {
                WebGPURenderEngine._instance._config.msaa = camera.msaa;
                camera.depthTextureFormat = RenderTargetFormat.DEPTHSTENCIL_24_8;
            }
            const move = camera.addComponent(CameraMoveScript);
            move.speed = 0.005;

            const directLight = new Sprite3D();
            const dirCom = directLight.addComponent(DirectionLightCom);
            scene.addChild(directLight);
            dirCom.color.setValue(1, 1, 1, 1);

            //打开后处理
            // if (true) {
            //     const postProcess = new PostProcess();
            //     const bloom = new BloomEffect();
            //     postProcess.addEffect(bloom);
            //     camera.postProcess = postProcess;
            //     camera.enableHDR = true;

            //     //设置泛光参数
            //     bloom.intensity = 5;
            //     bloom.threshold = 0.9;
            //     bloom.softKnee = 0.5;
            //     bloom.clamp = 65472;
            //     bloom.diffusion = 5;
            //     bloom.anamorphicRatio = 0.0;
            //     bloom.color = new Color(1, 1, 1, 1);
            //     bloom.fastMode = true;
            // }

            const boxMesh1 = PrimitiveMesh.createBox(0.2, 0.2, 0.2);
            const coneMesh1 = PrimitiveMesh.createCone(0.1, 0.3, 64);
            const sphereMesh1 = PrimitiveMesh.createSphere(0.25, 64, 64);
            MeshAddTangent(boxMesh1);
            MeshAddTangent(coneMesh1);
            MeshAddTangent(sphereMesh1);

            const material1 = new PBRStandardMaterial();
            const material2 = new PBRStandardMaterial();

            const boxS3D = [];
            const sphereS3D = [];
            const coneS3D_static = [];

            const res = [
                { url: "res/threeDimen/pbr/metal022/albedo.jpg", type: Loader.TEXTURE2D },
                { url: "res/threeDimen/pbr/metal022/normal.jpg", type: Loader.TEXTURE2D },
                { url: "res/threeDimen/pbr/metal022/metallicRoughness.png", type: Loader.TEXTURE2D },
                { url: "res/threeDimen/pbr/diamondPlate008C/albedo.jpg", type: Loader.TEXTURE2D },
                { url: "res/threeDimen/pbr/diamondPlate008C/normal.jpg", type: Loader.TEXTURE2D },
                { url: "res/threeDimen/pbr/diamondPlate008C/metallic.jpg", type: Loader.TEXTURE2D },
                { url: "res/threeDimen/texture/normal2.jpg", type: Loader.TEXTURE2D },
                { url: "res/threeDimen/texture/earthMap.jpg", type: Loader.TEXTURE2D },
                { url: "res/threeDimen/texture/九宫格512.jpg", type: Loader.TEXTURE2D },
            ];
            Laya.loader.load(res, Handler.create(this, () => {
                material1.albedoTexture = Laya.loader.getRes("res/threeDimen/pbr/metal022/albedo.jpg", Loader.TEXTURE2D);
                material1.normalTexture = Laya.loader.getRes("res/threeDimen/pbr/metal022/normal.jpg", Loader.TEXTURE2D);
                material1.metallicGlossTexture = Laya.loader.getRes("res/threeDimen/pbr/metal022/metallicRoughness.png", Loader.TEXTURE2D);
                material1.normalTextureScale = 1.2;
                material1.smoothnessTextureScale = 1.2;
                material2.albedoTexture = Laya.loader.getRes("res/threeDimen/pbr/diamondPlate008C/albedo.jpg", Loader.TEXTURE2D);
                material2.normalTexture = Laya.loader.getRes("res/threeDimen/pbr/diamondPlate008C/normal.jpg", Loader.TEXTURE2D);
                material2.metallicGlossTexture = Laya.loader.getRes("res/threeDimen/pbr/diamondPlate008C/metallic.jpg", Loader.TEXTURE2D);
            }));

            const n = 10;
            const m = 10;
            const l = 10;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < m; j++) {
                    for (let k = 0; k < l; k++) {
                        const bs3d = scene.addChild(new Sprite3D());
                        boxS3D.push(bs3d);
                        bs3d.transform.position = new Vector3(i - n * 0.5, j - m * 0.5, k - l * 0.5);
                        bs3d.addComponent(MeshFilter).sharedMesh = boxMesh1;
                        bs3d.addComponent(MeshRenderer).material = material2;
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
                        sp3d.addComponent(MeshRenderer).material = material1;
                        //@ts-ignore
                        sp3d.rotate = new Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02);
                    }
                }
            }
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < m; j++) {
                    for (let k = 0; k < l; k++) {
                        const co3d = scene.addChild(new Sprite3D('cone' + i + j + k, true));
                        coneS3D_static.push(co3d);
                        co3d.transform.position = new Vector3(i - n * 0.5, j - m * 0.5 - 0.5, k - l * 0.5);
                        co3d.addComponent(MeshFilter).sharedMesh = coneMesh1;
                        co3d.addComponent(MeshRenderer).material = material1;
                    }
                }
            }

            Laya.timer.frameLoop(1, this, () => {
                for (let i = boxS3D.length - 1; i > -1; i--)
                    boxS3D[i].transform.rotate(boxS3D[i].rotate, false);
                for (let i = sphereS3D.length - 1; i > -1; i--)
                    sphereS3D[i].transform.rotate(sphereS3D[i].rotate, false);
            });

            // if (this.useWebGPU) {
            //     Laya.timer.loop(3000, this, () => { WebGPUStatis.printFrameStatis(); });
            //     Laya.timer.once(5000, this, () => {
            //         WebGPUStatis.printStatisticsAsTable();
            //         WebGPUStatis.printTotalStatis();
            //         WebGPUStatis.printTextureStatis();
            //         console.log(WebGPURenderEngine._instance.gpuBufferMgr.namedBuffers.get('scene3D'));
            //         console.log(WebGPURenderEngine._instance.gpuBufferMgr.namedBuffers.get('camera'));
            //         console.log(WebGPURenderEngine._instance.gpuBufferMgr.namedBuffers.get('material'));
            //         console.log(WebGPURenderEngine._instance.gpuBufferMgr.namedBuffers.get('sprite3D'));
            //         console.log(WebGPURenderEngine._instance.gpuBufferMgr.namedBuffers.get('sprite3D_static'));
            //     });
            // }
        });
    }
}