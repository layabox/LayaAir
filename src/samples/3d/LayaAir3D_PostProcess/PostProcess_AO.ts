import { Laya } from "Laya";
import { PostProcess } from "laya/d3/component/PostProcess";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { ScalableAO } from "./PostProcess_AO/ScalableAO";

export class ProstProcess_AO{
    scene:Scene3D;
    constructor(){
        Laya3D.init(0,0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;

        Stat.show();
        Shader3D.debugMode = true;
        this.onResComplate();
    }

    onResComplate() {

        this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		//this.scene.ambientColor = new Vector3(1, 1, 1);

		var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(new Vector3(0, 0.5, 1));
		camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
        camera.addComponent(CameraMoveScript);
        var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
		//方向光的颜色
		directionLight.color.setValue(0.5,0.5, 0.5);
		//设置平行光的方向
		var mat: Matrix4x4 = directionLight.transform.worldMatrix;
		mat.setForward(new Vector3(-1.0, -1.0, -1.0));
		directionLight.transform.worldMatrix = mat;
        this.addObjectInScene(this.scene);

        this.addPostProcess(camera);
    }

     /**
     * 场景添加测试对象
     * @param scene 
     */
      addObjectInScene(scene: Scene3D) {

        let sprite: Sprite3D = new Sprite3D();
        scene.addChild(sprite);

        let planeMesh: Mesh = PrimitiveMesh.createPlane(10, 10,1,1);
        let plane: MeshSprite3D = new MeshSprite3D(planeMesh);
        scene.addChild(plane);

        let cubeMesh: Mesh = PrimitiveMesh.createBox();
        let cube0: MeshSprite3D = new MeshSprite3D(cubeMesh);
        let cube1: MeshSprite3D = new MeshSprite3D(cubeMesh);
        let cube2: MeshSprite3D = new MeshSprite3D(cubeMesh);
        let cube3: MeshSprite3D = new MeshSprite3D(cubeMesh);

        cube0.meshRenderer.sharedMaterial = new BlinnPhongMaterial;

        sprite.addChild(cube0);
        sprite.addChild(cube1);
        sprite.addChild(cube2);
        sprite.addChild(cube3);

        cube1.transform.position = new Vector3(-1, 0, 0);
        cube2.transform.position = new Vector3(-1, 0, -1);
        cube3.transform.position = new Vector3(-1, 1, 0);

        sprite.transform.rotationEuler = new Vector3(0, 30, 0);
        
    }

    addPostProcess(camera: Camera) {
        let postProcess: PostProcess = new PostProcess();
        camera.postProcess = postProcess;

        let ao: ScalableAO = new ScalableAO();
        ao.radius = 0.15;
        ao.aoColor = new Vector3(0.0,0.0,0.0);
        ao.instance = 0.5;
        postProcess.addEffect(ao);
    }

}