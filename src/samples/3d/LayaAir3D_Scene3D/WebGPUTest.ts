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

export class WebGPUTest {
    rotation: Vector3 = new Vector3(0, 0.01, 0);
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
            //Stat.show();

            await Laya.loader.load("res/testMaterial/UnLight.shader");

            const scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

            const camera: Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 100))));
            camera.transform.translate(new Vector3(0, 0.5, 1.5));
            camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
            camera.clearColor = Color.BLUE;
            camera.clearFlag = CameraClearFlags.SolidColor;
            camera.addComponent(CameraMoveScript);

            // const directlightSprite = new Sprite3D();
            // const dircom = directlightSprite.addComponent(DirectionLightCom);
            // scene.addChild(directlightSprite);
            // dircom.color.setValue(1, 1, 1, 1);

            const sphereMesh: Mesh = PrimitiveMesh.createSphere(0.5);
            const boxMesh = PrimitiveMesh.createBox(0.5, 0.5, 0.5);

            // const earth1 = scene.addChild(new Sprite3D());
            // const meshFilter1 = earth1.addComponent(MeshFilter);
            // const meshRenderer1 = earth1.addComponent(MeshRenderer);
            // meshFilter1.sharedMesh = sphereMesh;
            // earth1.transform.position = new Vector3(-0.5, 0, 0);
            // meshRenderer1.castShadow = false;
            // meshRenderer1.receiveShadow = false;

            const earth2 = scene.addChild(new Sprite3D());
            const meshFilter2 = earth2.addComponent(MeshFilter);
            const meshRenderer2 = earth2.addComponent(MeshRenderer);
            meshFilter2.sharedMesh = boxMesh;
            earth2.transform.position = new Vector3(0, 0, 0);

            //const material = new BlinnPhongMaterial();
            const material = new UnlitMaterial();
            //const material = new Material();
            //material.setShaderName('UnLight');
            //漫反射贴图
            Texture2D.load("res/threeDimen/texture/earth.jpg", Handler.create(this, (texture: Texture2D) => {
                material.albedoTexture = texture;
                //material.setTexture('u_AlbedoTexture', texture);
                //material.addDefine(Shader3D.getDefineByName('ALBEDOTEXTURE'));
            }));
            meshRenderer2.material = material;
            meshRenderer2.castShadow = false;
            meshRenderer2.receiveShadow = false;

            Laya.timer.frameLoop(1, this, () => {
                //earth1.transform.rotate(this.rotation, false);
                earth2.transform.rotate(this.rotation, false);
            });
        });
    }
}