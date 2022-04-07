
import { Laya} from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Material } from "laya/d3/core/material/Material";
import { Loader } from "laya/net/Loader";
import { Vector4 } from "laya/d3/math/Vector4";
import { TextureCube } from "laya/d3/resource/TextureCube";
import { Vector3 } from "laya/d3/math/Vector3";
import { GlassRefractionMaterial } from "./GlassRefractionDemo/GlassRefractionMaterial";

export class GlassRefractionDemo {
	mat:GlassRefractionMaterial;
    camera: Camera;
    glassrefract: MeshSprite3D;
    constructor() {
		//初始化引擎
		Laya3D.init(100, 100);
		Stat.show();
		Shader3D.debugMode = true;
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		
		//材质初始化
		GlassRefractionMaterial.initShader();
        this.mat = new GlassRefractionMaterial();
        this.mat.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
        Laya.loader.create(["res/GlassRefraction/Conventional/Assets/Materials/normal2.jpg", "res/GlassRefraction/Conventional/Assets/Materials/Glass.jpg"], Handler.create(this, function(){
            //加载场景
            Scene3D.load("res/GlassRefraction/Conventional/glassReflect.ls", Handler.create(this, function (scene: Scene3D): void {
                Laya.stage.addChild(scene);
                // 开启相机的屏幕采样
                this.camera = scene.getChildByName("Main Camera") as Camera;
                (this.camera as Camera).opaquePass = true;
                this.camera.addComponent(CameraMoveScript);
                this.glassReflect = scene.getChildByName("glassreflect") as MeshSprite3D;
                Laya.timer.frameLoop(1, this, function () {
                    this.glassReflect.transform.rotate(new Vector3(0, 0.01, 0), false);
                    this.glassReflect.getChildAt(0).transform.rotate(new Vector3(0, -0.02, 0), false);
                });

                (this.mat as GlassRefractionMaterial).bumpTexture = Loader.getRes("res/GlassRefraction/Conventional/Assets/Materials/normal2.jpg");
                (this.mat as GlassRefractionMaterial).mainTexture = Loader.getRes("res/GlassRefraction/Conventional/Assets/Materials/grendwall.jpg");
                TextureCube.load("res/GlassRefraction/Conventional/Assets/Scenes/glassReflectGIReflection.ltcb.ls", Handler.create(this, function(cubemap){
                    (this.mat as GlassRefractionMaterial).cubeTexture = cubemap;
                }));
                (this.mat as GlassRefractionMaterial).distortion = 100;
                (this.mat as GlassRefractionMaterial).refractAmount = 1.0;
                (this.mat as GlassRefractionMaterial).refractiontelsize = new Vector4(0.002, 0.001, 600.0, 550.0);
                // 替换cube的材质
                this.glassReflect.meshRenderer.sharedMaterial = this.mat;
            }));
        }));
		
	}
}

