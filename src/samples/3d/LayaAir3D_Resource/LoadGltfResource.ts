import { Laya } from "Laya";
import { Laya3D } from "Laya3D";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Handler } from "laya/utils/Handler";
import { Camera } from "laya/d3/core/Camera";
import { Vector3 } from "laya/d3/math/Vector3";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { GLTFLoader } from "laya/gltf/GLTFLoader";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Loader } from "laya/net/Loader";
import { TextureCube } from "laya/d3/resource/TextureCube";
import { Quaternion } from "laya/d3/math/Quaternion";

export class LoadGltfRosource {

    scene: Scene3D;
    camera: Camera;

    constructor() {
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;

        Stat.show();

        Shader3D.debugMode = true;

        this.scene = <Scene3D>Laya.stage.addChild(new Scene3D);
        this.camera = <Camera>this.scene.addChild(new Camera);
        this.camera.addComponent(CameraMoveScript);

        this.camera.transform.position = new Vector3(0, 1, 7);
        // this.camera.transform.rotation = new Quaternion();

        //light
        var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
        directionLight.color = new Vector3(0.6, 0.6, 0.6);
        //设置平行光的方向
        var mat: Matrix4x4 = directionLight.transform.worldMatrix;
        mat.setForward(new Vector3(-1.0, -1.0, -1.0));
        directionLight.transform.worldMatrix = mat;

        // 配置环境反射贴图
        Laya.loader.create("res/threeDimen/LayaScene_depthNormalScene/Conventional/Assets/Scenes/depthNormalSceneGIReflection.ltcb.ls", Handler.create(this, function () {
            this.scene.ambientColor = new Vector3(0.858, 0.858, 0.858);
            this.scene.reflection = Loader.getRes("res/threeDimen/LayaScene_depthNormalScene/Conventional/Assets/Scenes/depthNormalSceneGIReflection.ltcb.ls") as TextureCube;
            this.scene.reflectionDecodingFormat = 1;
            this.scene.reflectionIntensity = 1;
        }))

        var gltfResource = [
            { url: "res/threeDimen/gltf/RiggedFigure/RiggedFigure.gltf", type: Loader.JSON },
            { url: "res/threeDimen/gltf/Duck/Duck.gltf", type: Loader.JSON },
            { url: "res/threeDimen/gltf/AnimatedCube/AnimatedCube.gltf", type: Loader.JSON },
        ];
        
        // 创建 gltf loader
        var gltfLoader: GLTFLoader = new GLTFLoader();
        gltfLoader.loadGLTF(gltfResource, Handler.create(this, this.onGLTFComplate));
    }

    onGLTFComplate(success: boolean): void {
        if (!success) {
            // 加载失败
            console.log("gltf load failed");
            return;
        }
        var RiggedFigure: Sprite3D = GLTFLoader.getRes("res/threeDimen/gltf/RiggedFigure/RiggedFigure.gltf");
        this.scene.addChild(RiggedFigure);
        RiggedFigure.transform.position = new Vector3(-2, 0, 0);
        console.log("RiggedFigure: This model is licensed under a Creative Commons Attribution 4.0 International License.");

        var duck: Sprite3D = GLTFLoader.getRes("res/threeDimen/gltf/Duck/Duck.gltf");
        this.scene.addChild(duck);

        var cube: Sprite3D = GLTFLoader.getRes("res/threeDimen/gltf/AnimatedCube/AnimatedCube.gltf");
        this.scene.addChild(cube);
        cube.transform.position = new Vector3(2.5, 0.6, 0);
        cube.transform.setWorldLossyScale(new Vector3(0.6, 0.6, 0.6));
    }

}