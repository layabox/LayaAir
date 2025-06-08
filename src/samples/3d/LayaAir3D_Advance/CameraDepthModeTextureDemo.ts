/**
description
 演示相机深度和深度法线纹理的3D场景加载和渲染
 */
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Loader } from "laya/net/Loader";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { DepthMaterial } from "./DepthNormalShader/DepthMaterial";
import { DepthNormalsMaterial } from "./DepthNormalShader/DepthNormalsMaterial";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { DepthTextureMode } from "laya/resource/RenderTexture";

/**
 * 示例用来展示获得的深度、深度法线贴图
 * @author miner 
 */
export class CameraDepthModeTextureDemo {
    private scene: Scene3D;
    private depthPlane: MeshSprite3D;
private depthNormalPlane: MeshSprite3D;
    constructor() {
        //初始化引擎
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            //显示性能面板
            Stat.show();
            Shader3D.debugMode = true;
            DepthMaterial.init();
            DepthNormalsMaterial.init();
            this.PreloadingRes();
        });
    }

    //批量预加载方式
    PreloadingRes() {
        //预加载所有资源
        var resource: any[] = ["res/threeDimen/LayaScene_depthNormalScene/Conventional/depthNormalPlane.lh",
            "res/threeDimen/LayaScene_depthNormalScene/Conventional/depthPlane.lh",
            "res/threeDimen/LayaScene_depthNormalScene/Conventional/depthscene.lh",
            "res/threeDimen/LayaScene_depthNormalScene/Conventional/Main Camera.lh",
        ];
        Laya.loader.load(resource, Handler.create(this, this.onPreLoadFinish));
    }

    onPreLoadFinish() {
        this.scene = Laya.stage.addChild(new Scene3D()) as Scene3D;
        this.scene.ambientColor = new Color(0.858, 0.858, 0.858);
        this.depthNormalPlane = this.scene.addChild(Loader.createNodes("res/threeDimen/LayaScene_depthNormalScene/Conventional/depthNormalPlane.lh")) as MeshSprite3D;
        this.depthPlane = this.scene.addChild(Loader.createNodes("res/threeDimen/LayaScene_depthNormalScene/Conventional/depthPlane.lh")) as MeshSprite3D;
        this.scene.addChild(Loader.createNodes("res/threeDimen/LayaScene_depthNormalScene/Conventional/depthscene.lh"));
        var camera = this.scene.addChild(Loader.createNodes("res/threeDimen/LayaScene_depthNormalScene/Conventional/Main Camera.lh")) as Camera;
        camera.depthTextureMode |= DepthTextureMode.Depth;
        this.depthPlane.getComponent(MeshRenderer).sharedMaterial = new DepthMaterial();

        camera.depthTextureMode |= DepthTextureMode.DepthNormals;
        this.depthNormalPlane.getComponent(MeshRenderer).sharedMaterial = new DepthNormalsMaterial();
    }
}