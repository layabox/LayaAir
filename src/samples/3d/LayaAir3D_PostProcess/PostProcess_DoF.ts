import { Laya } from "Laya";
import { Laya3D } from "Laya3D";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Camera } from "laya/d3/core/Camera";
import { Vector3 } from "laya/d3/math/Vector3";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { CameraMoveScript } from "../../3d/common/CameraMoveScript";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { PostProcess } from "laya/d3/component/PostProcess";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { DepthTextureMode } from "laya/d3/depthMap/DepthPass";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { GaussianDoF } from "./PostProcess_DoF/GaussianDoF";

export class PostProcessDoF {

    scene: Scene3D;
    camera: Camera;

    constructor() {
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;

        Stat.show();

        Shader3D.debugMode = true;

        let scene: Scene3D = this.scene = new Scene3D();
        Laya.stage.addChild(scene);
        let directionLight: DirectionLight = new DirectionLight();
        scene.addChild(directionLight);
        directionLight.transform.rotationEuler = new Vector3(-50, -150, 0);
        let camera: Camera = this.camera = new Camera(0, 0.3, 100);
        camera.enableHDR = true;
        camera.transform.position = new Vector3(0, 1, -11);
        camera.transform.rotationEuler = new Vector3(0, -180, 0);
        camera.addComponent(CameraMoveScript);
        scene.addChild(camera);

        this.onComplate();

    }

    onComplate(): void {

        let scene: Scene3D = this.scene;
        let camera: Camera = this.camera;

        camera.depthTextureMode |= DepthTextureMode.Depth;

        this.buildTestScene(this.scene, this.camera);

        let postProcess: PostProcess = new PostProcess();
        camera.postProcess = postProcess;

        let gaussianDoF: GaussianDoF = new GaussianDoF();
        postProcess.addEffect(gaussianDoF);
        gaussianDoF.farStart = 10;
        gaussianDoF.farEnd = 20;
        gaussianDoF.maxRadius = 1.0;
    }

    buildTestScene(scene: Scene3D, camera: Camera) {

        let test: Sprite3D = new Sprite3D();
        scene.addChild(test);

        let boxMesh: Mesh = PrimitiveMesh.createBox();
        let sphereMesh: Mesh = PrimitiveMesh.createSphere();
        let capsuleMesh: Mesh = PrimitiveMesh.createCapsule();
        let ConeMesh: Mesh = PrimitiveMesh.createCone();

        let meshes: Mesh[] = [boxMesh, sphereMesh, capsuleMesh, ConeMesh];

        let material: PBRStandardMaterial = new PBRStandardMaterial();

        let range: number = 30;
        let step: number = 4;

        for (let x = -range; x <= range; x += step) {
            for (let y = -range; y <= range; y += step) {
                for (let z = -range; z <= range; z += step) {
                    let position: Vector3 = new Vector3(x, y, z);
                    let mesh: Mesh = meshes[Math.floor(Math.random() * 4)];
                    let sprite: MeshSprite3D = new MeshSprite3D(mesh);
                    test.addChild(sprite);
                    sprite.transform.position = position;
                    sprite.meshRenderer.sharedMaterial = material;
                }
            }
        }
    }

}
