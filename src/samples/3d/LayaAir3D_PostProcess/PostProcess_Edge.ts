import { Laya } from "Laya";
import { Laya3D } from "Laya3D";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Handler } from "laya/utils/Handler";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { CameraMoveScript } from "../../3d/common/CameraMoveScript";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { PostProcess } from "laya/d3/component/PostProcess";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Loader } from "laya/net/Loader";
import { HSlider } from "laya/ui/HSlider";
import { Button } from "laya/ui/Button";
import { DepthTextureMode } from "laya/d3/depthMap/DepthPass";
import { EdgeEffect, EdgeMode } from "./PostProcess_Edge/EdgeEffect";
import { Browser } from "laya/utils/Browser";
import { Event } from "laya/events/Event";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Quaternion } from "laya/maths/Quaternion";
import { Vector3 } from "laya/maths/Vector3";

export class PostProcess_Edge {

    scene: Scene3D;
    camera: Camera;

    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;

            Stat.show();

            Shader3D.debugMode = true;

            this.scene = <Scene3D>Laya.stage.addChild(new Scene3D);
            this.camera = <Camera>this.scene.addChild(new Camera(0, 0.2, 50));
            this.camera.addComponent(CameraMoveScript);
            this.camera.transform.position = new Vector3(0, 4, 10);
            this.camera.transform.rotation = new Quaternion(-0.2, 0, 0, 0.97);

            this.addLight();

            let res: string[] = [
                "res/threeDimen/skinModel/dude/dude.lh",
            ];

            Laya.loader.load(res, Handler.create(this, this.onResComplate));
        });
    }

    onResComplate(): void {

        let sphere: MeshSprite3D = new MeshSprite3D(PrimitiveMesh.createSphere(1), "Sphere");
        this.scene.addChild(sphere);
        sphere.transform.position = new Vector3(0, 1, 0);

        let plane: MeshSprite3D = new MeshSprite3D(PrimitiveMesh.createPlane(), "Plane");
        this.scene.addChild(plane);
        plane.transform.position = new Vector3(0, -0.5, 0);

        let cube: MeshSprite3D = new MeshSprite3D(PrimitiveMesh.createBox(1, 1, 1), "Cube");
        this.scene.addChild(cube);
        cube.transform.position = new Vector3(0, 3, 0);
        
        this.camera.depthTextureMode |= DepthTextureMode.DepthNormals;

        let dude: Sprite3D = Loader.createNodes("res/threeDimen/skinModel/dude/dude.lh");
        this.scene.addChild(dude);
        dude.transform.position = new Vector3(1.5, 0, 0);
        dude.transform.rotationEuler = new Vector3(0, 180, 0);

        let postProcess: PostProcess = new PostProcess();
        this.camera.postProcess = postProcess;

        let edgeEffect: EdgeEffect = new EdgeEffect();
        postProcess.addEffect(edgeEffect);

        this.addUI(edgeEffect);
    }

    addLight(): void {

        let dirLightDirections: Vector3[] = [new Vector3(-1, -1, -1), new Vector3(1, -1, -1)]
        let lightColor: Color = new Color(0.6, 0.6, 0.6, 1.0);
        for (let index = 0; index < dirLightDirections.length; index++) {
            let dir: Vector3 = dirLightDirections[index];
            Vector3.normalize(dir, dirLightDirections[index]);
            let dirLight: DirectionLight = new DirectionLight();
            this.scene.addChild(dirLight);
            var mat: Matrix4x4 = dirLight.transform.worldMatrix;
            mat.setForward(dirLightDirections[index]);
            dirLight.transform.worldMatrix = mat;
            dirLight.color = lightColor;
        }

    }

    addUI(edgeEffect: EdgeEffect): void {
        Laya.loader.load(["res/ui/hslider.png", "res/threeDimen/ui/button.png", "res/ui/hslider$bar.png", "res/ui/colorPicker.png"], Handler.create(this, function () {

            let colorButton: Button = this.addButton(100, 250, 160, 30, "color edge", 20, function () {
                edgeEffect.edgeMode = EdgeMode.ColorEdge;
                colorSlider.visible = true;
                normalSlider.visible = false;
                depthSlider.visible = false;
            });

            let colorSlider: HSlider = this.addSlider(100, 290, 300, 0.01, 1, 0.7, 0.01, function (value: number) {
                edgeEffect.colorHold = value;
            });

            let normalFunc: Function = function () {
                edgeEffect.edgeMode = EdgeMode.NormalEdge;
                colorSlider.visible = false;
                normalSlider.visible = true;
                depthSlider.visible = false;
            };
            let normalButton: Button = this.addButton(100, 330, 160, 30, "normal edge", 20, normalFunc);

            let normalSlider: HSlider = this.addSlider(100, 370, 300, 0.01, 1, 0.7, 0.01, function (value: number) {
                edgeEffect.normalHold = value;
            });

            let depthButton: Button = this.addButton(100, 410, 160, 30, "depth edge", 20, function () {
                edgeEffect.edgeMode = EdgeMode.DepthEdge;
                colorSlider.visible = false;
                normalSlider.visible = false;
                depthSlider.visible = true;
            });

            let depthSlider: HSlider = this.addSlider(100, 450, 300, 0.01, 1, 0.7, 0.01, function (value: number) {
                edgeEffect.depthHold = value;
            });

            let source: Button = this.addButton(100, 490, 160, 30, "show source", 20, function () {
                edgeEffect.showSource = !edgeEffect.showSource;
            });

            normalFunc();

        }));
    }

    addButton(x: number, y: number, width: number, height: number, text: string, size: number, clickFunc: Function) {
        let button: Button = <Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", text));
        button.size(width, height);
        button.labelBold = true;
        button.labelSize = size;
        button.sizeGrid = "4,4,4,4";
        button.scale(Browser.pixelRatio, Browser.pixelRatio);
        button.pos(x, y);
        button.on(Event.CLICK, this, clickFunc);
        return button;
    }

    addSlider(x: number, y: number, width: number, min: number, max: number, value: number, tick: number, changeFunc: Function) {
        let slider: HSlider = <HSlider>Laya.stage.addChild(new HSlider("res/ui/hslider.png"));
        slider.width = width;
        slider.pos(x, y);
        slider.min = min;
        slider.max = max;
        slider.value = value;
        slider.tick = tick;
        slider.changeHandler = Handler.create(this, changeFunc, [], false);

        slider.visible = false;

        return slider;
    }



}
