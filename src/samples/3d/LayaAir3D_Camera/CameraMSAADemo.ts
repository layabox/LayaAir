/**
description
 多重采样抗锯齿(MSAA)演示Demo,创建3D场景并添加几何体,提供开启/关闭MSAA功能
 */
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import Client from "../../Client";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Event } from "laya/events/Event";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { MeshFilter } from "laya/d3/core/MeshFilter";

/**
 * ...
 * @author miner
 */
export class CameraMSAADemo {
    /**实例类型*/
    private btype: any = "CameraMSAADemo";
    /**场景内按钮类型*/
    /**场景内按钮类型*/
    private stype: any = 0;
    private button: Button;


    scene: Scene3D;
    camera: Camera;

    isMaster: any;
    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;

            Stat.show();
            this.onResComplate();
        });
    }

    onResComplate() {
        this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
        //this.scene.ambientColor = new Vector3(1, 1, 1);
        var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 1000)));
        camera.transform.translate(new Vector3(0, 1, 5));
        camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
        camera.addComponent(CameraMoveScript);
        this.camera = camera;
        let directionLight = new Sprite3D();
        let dircom = directionLight.addComponent(DirectionLightCom);
        this.scene.addChild(directionLight);

        //方向光的颜色
        dircom.color.setValue(0.5, 0.5, 0.5, 1);
        //设置平行光的方向
        var mat: Matrix4x4 = directionLight.transform.worldMatrix;
        mat.setForward(new Vector3(-1.0, -1.0, -1.0));
        directionLight.transform.worldMatrix = mat;
        this.addObjectInScene(this.scene);
        camera.msaa = true;
        this.loadUI();
    }

    /**
   * 场景添加测试对象
   * @param scene 
   */
    addObjectInScene(scene: Scene3D) {

        let sprite: Sprite3D = new Sprite3D();
        scene.addChild(sprite);

        let planeMesh: Mesh = PrimitiveMesh.createPlane(10, 10, 1, 1);
        let plane: Sprite3D = new Sprite3D();
        let planerendere: MeshRenderer = plane.addComponent(MeshRenderer);
        let planefilter: MeshFilter = plane.addComponent(MeshFilter);
        planefilter.sharedMesh = planeMesh;

        scene.addChild(plane);

        let cubeMesh: Mesh = PrimitiveMesh.createBox();
        let sphere: Mesh = PrimitiveMesh.createSphere(0.3);

        let cube0: Sprite3D = new Sprite3D();
        let cube0render: MeshRenderer = cube0.addComponent(MeshRenderer);
        let cube0filter: MeshFilter = cube0.addComponent(MeshFilter);
        cube0filter.sharedMesh = cubeMesh;

        let cube1: Sprite3D = new Sprite3D();
        let cube1render: MeshRenderer = cube1.addComponent(MeshRenderer);
        let cube1filter: MeshFilter = cube1.addComponent(MeshFilter);
        cube1filter.sharedMesh = cubeMesh;

        let cube2: Sprite3D = new Sprite3D();
        let cube2render: MeshRenderer = cube2.addComponent(MeshRenderer);
        let cube2filter: MeshFilter = cube2.addComponent(MeshFilter);
        cube2filter.sharedMesh = cubeMesh;

        let cube3: Sprite3D = new Sprite3D();
        let cube3render: MeshRenderer = cube3.addComponent(MeshRenderer);
        let cube3filter: MeshFilter = cube3.addComponent(MeshFilter);
        cube3filter.sharedMesh = cubeMesh;

        let sphere0: Sprite3D = new Sprite3D();
        let sphere0render: MeshRenderer = sphere0.addComponent(MeshRenderer);
        let sphere0filter: MeshFilter = sphere0.addComponent(MeshFilter);
        sphere0filter.sharedMesh = sphere;

        let sphere1: Sprite3D = new Sprite3D();
        let sphere1render: MeshRenderer = sphere1.addComponent(MeshRenderer);
        let sphere1filter: MeshFilter = sphere1.addComponent(MeshFilter);
        sphere1filter.sharedMesh = sphere;

        let sphere2: Sprite3D = new Sprite3D();
        let sphere2render: MeshRenderer = sphere2.addComponent(MeshRenderer);
        let sphere2filter: MeshFilter = sphere2.addComponent(MeshFilter);
        sphere2filter.sharedMesh = sphere;

        let sphere3: Sprite3D = new Sprite3D();
        let sphere3render: MeshRenderer = sphere3.addComponent(MeshRenderer);
        let sphere3filter: MeshFilter = sphere3.addComponent(MeshFilter);
        sphere3filter.sharedMesh = sphere;

        cube0render.sharedMaterial = new BlinnPhongMaterial;

        sprite.addChild(cube0);
        sprite.addChild(cube1);
        sprite.addChild(cube2);
        sprite.addChild(cube3);
        sprite.addChild(sphere0);
        sprite.addChild(sphere1);
        sprite.addChild(sphere2);
        sprite.addChild(sphere3);




        cube1.transform.position = new Vector3(-1, 0, 0);
        cube2.transform.position = new Vector3(-1, 0, 1);
        cube3.transform.position = new Vector3(-1, 1, 0);

        sphere0.transform.position = new Vector3(-3, 0, 0);
        sphere1.transform.position = new Vector3(2, 0, 0);
        sphere2.transform.position = new Vector3(2, 0.5, 0);
        sphere3.transform.position = new Vector3(-1, 0, 2);


    }

    /**
   *@private
   */
    loadUI(): void {
        Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {
            this.button = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "关闭MSAA"));
            this.button.size(200, 40);
            this.button.labelBold = true;
            this.button.labelSize = 30;
            this.button.sizeGrid = "4,4,4,4";
            this.button.scale(Browser.pixelRatio, Browser.pixelRatio);
            this.button.pos(Laya.stage.width / 2 - this.button.width * Browser.pixelRatio / 2, Laya.stage.height - 60 * Browser.pixelRatio);
            this.button.on(Event.CLICK, this, this.stypeFun0);

        }));
    }

    stypeFun0(label: string = "关闭MSAA"): void {
        var enableHDR: boolean = !!this.camera.msaa;
        if (enableHDR) {
            this.button.label = "开启MSAA";
            this.camera.msaa = false;

        }
        else {
            this.button.label = "关闭MSAA";
            this.camera.msaa = true;
        }
        label = this.button.label;
        Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
    }

}