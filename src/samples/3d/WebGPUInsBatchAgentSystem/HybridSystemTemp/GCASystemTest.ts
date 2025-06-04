import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../../common/CameraMoveScript";
import { hybridSystemUtil, testGCAShader } from "./TestUtil2";
import { Matrix4x4 } from "laya/maths/Matrix4x4";

export class GCASystemTest {
    private testSystem = new hybridSystemUtil();
    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Stat.hide();
            var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
            var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 500)));
            camera.transform.translate(new Vector3(0, 0, 0));
            camera.transform.rotate(new Vector3(0, 0, 0), true, false);
            camera.addComponent(CameraMoveScript);
            camera.clearColor = new Color(0.0, 0.0, 0.0, 1.0);
            console.log("test GCAAgent Demo");
            testGCAShader.initShader();
            this.testSystem._createMesh();
            this.testSystem._createMaterial();
            this.testSystem._creatResDatas();
        });

    }

    testAddIns() {

    }

    testAddRemove() {

    }

    changeLodTest() {

    }

    updateInstest() {

    }








}