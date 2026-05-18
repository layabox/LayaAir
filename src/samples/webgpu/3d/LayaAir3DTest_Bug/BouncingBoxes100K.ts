import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { CameraMoveScript } from "../../../3d/common/CameraMoveScript";
import { Stat } from "laya/utils/Stat";

export class BouncingBoxes100K {
    private static BOX_COUNT: number = 10000;
    private static HALF_BOUND: number = 50;
    private static BOX_SPEED: number = 0.02;
    /** true = 每个 box 独立材质（压测命令流 / 多线程录制）；false = 共用 8 色材质。 */
    private static UNIQUE_MATERIAL_PER_BOX: boolean = true;

    private _sprites: MeshSprite3D[];
    private _velocities: Float32Array;
    private _positions: Float32Array;
    private _tempPos: Vector3 = new Vector3();
    private _frameIdx: number = 0;

    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Stat.show();
            var scene: Scene3D = Laya.stage.addChild(new Scene3D()) as Scene3D;
            scene.ambientColor = Color.WHITE;

            var camera: Camera = scene.addChild(new Camera(0, 0.1, 500)) as Camera;
            camera.transform.position = new Vector3(0, 60, 120);
            camera.transform.rotate(new Vector3(-25, 0, 0), true, false);
            camera.clearFlag = CameraClearFlags.SolidColor;
            camera.clearColor = new Color(0.2, 0.5, 0.8, 1);
            camera.addComponent(CameraMoveScript);

            var directionLight: Sprite3D = scene.addChild(new Sprite3D()) as Sprite3D;
            var directionLightCom: DirectionLightCom = directionLight.addComponent(DirectionLightCom);
            directionLightCom.color = new Color(0.6, 0.6, 0.6, 1);
            var mat: Matrix4x4 = directionLight.transform.worldMatrix;
            mat.setForward(new Vector3(-1.0, -1.0, -1.0));
            directionLight.transform.worldMatrix = mat;

            this._createBoxes(scene);

            Laya.timer.frameLoop(1, this, this._logDelta);
        });
    }

    private _createBoxes(scene: Scene3D): void {
        const count = BouncingBoxes100K.BOX_COUNT;
        const halfBound = BouncingBoxes100K.HALF_BOUND;

        var boxMesh: Mesh = PrimitiveMesh.createBox(0.15, 0.15, 0.15);

        const unique = BouncingBoxes100K.UNIQUE_MATERIAL_PER_BOX;
        const colorCount = 8;
        var sharedMaterials: BlinnPhongMaterial[] = null;
        if (!unique) {
            var colors: Color[] = [
                new Color(1, 0.2, 0.2, 1),
                new Color(0.2, 1, 0.2, 1),
                new Color(0.2, 0.2, 1, 1),
                new Color(1, 1, 0.2, 1),
                new Color(1, 0.2, 1, 1),
                new Color(0.2, 1, 1, 1),
                new Color(1, 0.6, 0.2, 1),
                new Color(0.6, 0.2, 1, 1),
            ];
            sharedMaterials = [];
            for (var c = 0; c < colorCount; c++) {
                var sm: BlinnPhongMaterial = new BlinnPhongMaterial();
                sm.albedoColor = colors[c];
                sharedMaterials.push(sm);
            }
        }

        this._sprites = new Array(count);
        this._positions = new Float32Array(count * 3);
        this._velocities = new Float32Array(count * 3);

        var speed = BouncingBoxes100K.BOX_SPEED;

        for (var i = 0; i < count; i++) {
            var sprite: MeshSprite3D = new MeshSprite3D(boxMesh);
            if (unique) {
                var umat: BlinnPhongMaterial = new BlinnPhongMaterial();
                umat.albedoColor = new Color(Math.random(), Math.random(), Math.random(), 1);
                sprite.meshRenderer.sharedMaterial = umat;
            } else {
                sprite.meshRenderer.sharedMaterial = sharedMaterials[i % colorCount];
            }

            var i3 = i * 3;
            this._positions[i3] = (Math.random() - 0.5) * 2 * halfBound;
            this._positions[i3 + 1] = (Math.random() - 0.5) * 2 * halfBound;
            this._positions[i3 + 2] = (Math.random() - 0.5) * 2 * halfBound;

            this._velocities[i3] = (Math.random() - 0.5) * 2 * speed;
            this._velocities[i3 + 1] = (Math.random() - 0.5) * 2 * speed;
            this._velocities[i3 + 2] = (Math.random() - 0.5) * 2 * speed;

            sprite.transform.localPosition = new Vector3(
                this._positions[i3],
                this._positions[i3 + 1],
                this._positions[i3 + 2]
            );

            scene.addChild(sprite);
            this._sprites[i] = sprite;
        }
    }

    private _logDelta(): void {
        console.log(`frame ${this._frameIdx++} dt=${Laya.timer.delta.toFixed(2)}ms`);
    }

    private _onFrame(): void {
        const count = BouncingBoxes100K.BOX_COUNT;
        const halfBound = BouncingBoxes100K.HALF_BOUND;
        var dt = Laya.timer.delta;
        if (dt > 100) dt = 100;
        const positions = this._positions;
        const velocities = this._velocities;
        const sprites = this._sprites;
        const tempPos = this._tempPos;

        for (var i = 0; i < count; i++) {
            var i3 = i * 3;

            var px = positions[i3] + velocities[i3] * dt;
            var py = positions[i3 + 1] + velocities[i3 + 1] * dt;
            var pz = positions[i3 + 2] + velocities[i3 + 2] * dt;

            if (px > halfBound) { px = halfBound; velocities[i3] = -velocities[i3]; }
            else if (px < -halfBound) { px = -halfBound; velocities[i3] = -velocities[i3]; }

            if (py > halfBound) { py = halfBound; velocities[i3 + 1] = -velocities[i3 + 1]; }
            else if (py < -halfBound) { py = -halfBound; velocities[i3 + 1] = -velocities[i3 + 1]; }

            if (pz > halfBound) { pz = halfBound; velocities[i3 + 2] = -velocities[i3 + 2]; }
            else if (pz < -halfBound) { pz = -halfBound; velocities[i3 + 2] = -velocities[i3 + 2]; }

            positions[i3] = px;
            positions[i3 + 1] = py;
            positions[i3 + 2] = pz;

            tempPos.x = px;
            tempPos.y = py;
            tempPos.z = pz;
            sprites[i].transform.localPosition = tempPos;
        }
    }
}
