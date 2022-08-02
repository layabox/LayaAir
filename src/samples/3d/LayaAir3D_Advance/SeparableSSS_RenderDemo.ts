import { Laya } from "Laya";
import { Camera, CameraEventFlags } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector2 } from "laya/d3/math/Vector2";
import { Vector4 } from "laya/d3/math/Vector4";
import { Viewport } from "laya/d3/math/Viewport";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { SeparableSSS_BlitMaterial } from "./SeparableSSSRender/Material/SeparableSSS_BlitMaterial";
import { SeparableSSSRenderMaterial } from "./SeparableSSSRender/Material/SeparableSSS_RenderMaterial";
import { Event } from "laya/events/Event";
import Client from "../../Client";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { FilterMode } from "laya/RenderEngine/RenderEnum/FilterMode";
import { Color } from "laya/d3/math/Color";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";

export class SeparableSSS_RenderDemo {
    scene: Scene3D;
    mainCamera: Camera;
    blinnphongCharacter: MeshSprite3D;
    SSSSSCharacter: MeshSprite3D;
    characterBlinnphongMaterial: BlinnPhongMaterial;
    pbrCharacter: MeshSprite3D;
    pbrMaterial: PBRStandardMaterial;
    //testPlane
    planeMat: UnlitMaterial;
    sssssBlitMaterail: SeparableSSS_BlitMaterial;
    sssssRenderMaterial: SeparableSSSRenderMaterial;

    /**实例类型*/
    private btype: any = "SeparableSSS_RenderDemo";
    /**场景内按钮类型*/
    private stype: any = 0;
    private changeActionButton: Button;

    //reference:https://github.com/iryoku/separable-sss 
    //流程：分别渲染皮肤Mesh的漫反射部分以及渲染皮肤Mesh的高光部分,分别存储在不同的FrameBuffer中
    //进行两次根据kenerl的高斯采样模拟多极子光照模型
    //再将高光部分与模糊好的地方重新相加
    constructor() {
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        Shader3D.debugMode = true;
        SeparableSSS_BlitMaterial.init();
        SeparableSSSRenderMaterial.init();

        this.sssssBlitMaterail = new SeparableSSS_BlitMaterial();
        this.sssssRenderMaterial = new SeparableSSSRenderMaterial();
        this.PreloadingRes();
    }

    //批量预加载方式
    PreloadingRes() {
        //预加载所有资源
        let resource: any[] = ["res/threeDimen/LayaScene_separable-sss/Conventional/separable-sss.ls",
            "res/threeDimen/LayaScene_separable-sss/Conventional/HeadBlinnphong.lh"];
        Laya.loader.load(resource, Handler.create(this, this.onPreLoadFinish));
    }

    onPreLoadFinish() {
        this.scene = Loader.createNodes("res/threeDimen/LayaScene_separable-sss/Conventional/separable-sss.ls");
        Laya.stage.addChild(this.scene);
        //获取场景中的相机
        this.mainCamera = (<Camera>this.scene.getChildByName("Main Camera"));
        this.mainCamera.addComponent(CameraMoveScript);


        //打开depthTexture
        this.blinnphongCharacter = Loader.createNodes("res/threeDimen/LayaScene_separable-sss/Conventional/HeadBlinnphong.lh");
        this.characterBlinnphongMaterial = <BlinnPhongMaterial>this.blinnphongCharacter.getComponent(MeshRenderer).sharedMaterial.clone();
        //增加Mesh节点
        let buf = this.createCommandBuffer(this.mainCamera, this.blinnphongCharacter.meshFilter.sharedMesh);
        this.mainCamera.addCommandBuffer(CameraEventFlags.BeforeForwardOpaque, buf);
        this.sssssBlitMaterail.cameraFiledOfView = this.mainCamera.fieldOfView;

        //增加节点
        this.SSSSSCharacter = <MeshSprite3D>this.blinnphongCharacter.clone();
        this.SSSSSCharacter.getComponent(MeshRenderer).sharedMaterial = this.sssssRenderMaterial;
        this.scene.addChild(this.SSSSSCharacter);
        this.scene.addChild(this.blinnphongCharacter);
        this.blinnphongCharacter.active = false;

        this.loadUI();
    }

    createCommandBuffer(camera: Camera, character: Mesh): CommandBuffer {
        //记录一下最开始的漫反射颜色和高光颜色
        let oriColor = this.characterBlinnphongMaterial.albedoColor;
        let oriSpec = this.characterBlinnphongMaterial.specularColor;

        let buf: CommandBuffer = new CommandBuffer();
        let viewPort: Viewport = camera.viewport;

        //在延迟渲染管线中  可以一下把三张图直接搞出来
        //在我们前向渲染管线中  多浪费了几次drawMesh的性能
        //深度贴图
        let depthTexture = RenderTexture.createFromPool(viewPort.width, viewPort.height, RenderTargetFormat.DEPTH_16, RenderTargetFormat.None, false, 1);
        buf.setRenderTarget(depthTexture);
        buf.clearRenderTarget(true, true, new Color(0.5, 0.5, 0.5, 1.0));
        buf.drawMesh(character, this.blinnphongCharacter.transform.worldMatrix, this.characterBlinnphongMaterial, 0, 0);
        //将漫反射和高光分别画到两个RenderTexture
        //漫反射颜色
        let diffuseRenderTexture = RenderTexture.createFromPool(viewPort.width, viewPort.height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.DEPTH_16, false, 1);
        buf.setRenderTarget(diffuseRenderTexture);
        buf.clearRenderTarget(true, true, new Color(0.5, 0.5, 0.5, 1.0));
        //@ts-ignore
        buf.setShaderDataVector(this.characterBlinnphongMaterial.shaderData, BlinnPhongMaterial.ALBEDOCOLOR, oriColor);
        //@ts-ignore
        buf.setShaderDataVector(this.characterBlinnphongMaterial.shaderData, BlinnPhongMaterial.MATERIALSPECULAR, new Vector4(0.0, 0.0, 0.0, 0.0));
        buf.drawMesh(character, this.blinnphongCharacter.transform.worldMatrix, this.characterBlinnphongMaterial, 0, 0);
        // //高光颜色
        let specRrenderTexture = RenderTexture.createFromPool(viewPort.width, viewPort.height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.DEPTH_16, false, 1);
        buf.setRenderTarget(specRrenderTexture);
        buf.clearRenderTarget(true, true, new Color(1.0, 0.0, 0.0, 0.0));
        //@ts-ignore
        buf.setShaderDataVector(this.characterBlinnphongMaterial.shaderData, BlinnPhongMaterial.MATERIALSPECULAR, oriSpec);
        //@ts-ignore
        buf.setShaderDataVector(this.characterBlinnphongMaterial.shaderData, BlinnPhongMaterial.ALBEDOCOLOR, new Vector4(0.0, 0.0, 0.0, 0.0));
        buf.drawMesh(character, this.blinnphongCharacter.transform.worldMatrix, this.characterBlinnphongMaterial, 0, 0);
        //buf.blitScreenQuad(specRrenderTexture,null);

        //拿到三张图片后，对diffuse贴图进行高斯核模糊
        buf.setShaderDataTexture(this.sssssBlitMaterail.shaderData, SeparableSSS_BlitMaterial.SHADERVALUE_DEPTHTEX, depthTexture);
        let blurRenderTexture = RenderTexture.createFromPool(viewPort.width, viewPort.height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None, false, 1);
        buf.setShaderDataVector2(this.sssssBlitMaterail.shaderData, SeparableSSS_BlitMaterial.SHADERVALUE_BLURDIR, new Vector2(10.0, 0.0));
        buf.blitScreenQuadByMaterial(diffuseRenderTexture, blurRenderTexture, new Vector4(0, 0, 1.0, 1.0), this.sssssBlitMaterail, 0);
        buf.setShaderDataVector2(this.sssssBlitMaterail.shaderData, SeparableSSS_BlitMaterial.SHADERVALUE_BLURDIR, new Vector2(0.0, 10.0));
        buf.blitScreenQuadByMaterial(blurRenderTexture, diffuseRenderTexture, new Vector4(0.0, 0.0, 0.0, 0.0), this.sssssBlitMaterail, 0);


        buf.setGlobalTexture(Shader3D.propertyNameToID("sssssDiffuseTexture"), diffuseRenderTexture);
        this.sssssRenderMaterial.shaderData.setTexture(Shader3D.propertyNameToID("sssssSpecularTexture"), specRrenderTexture);
        diffuseRenderTexture.filterMode = FilterMode.Point;
        specRrenderTexture.filterMode = FilterMode.Point;


        return buf;
    }


    curStateIndex: number = 0;
    //按钮
    private loadUI(): void {

        Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {

            this.changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "次表面散射模式"));
            this.changeActionButton.size(160, 40);
            this.changeActionButton.labelBold = true;
            this.changeActionButton.labelSize = 30;
            this.changeActionButton.sizeGrid = "4,4,4,4";
            this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
            this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
            this.changeActionButton.on(Event.CLICK, this, this.stypeFun0);
        }));
    }

    stypeFun0(label: string = "次表面散射模式"): void {
        if (++this.curStateIndex % 2 == 1) {
            this.blinnphongCharacter.active = true;
            this.SSSSSCharacter.active = false;
            this.changeActionButton.label = "正常模式";
        } else {
            this.blinnphongCharacter.active = false;
            this.SSSSSCharacter.active = true;
            this.changeActionButton.label = "次表面散射模式";
        }
        label = this.changeActionButton.label;
        Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
    }
}