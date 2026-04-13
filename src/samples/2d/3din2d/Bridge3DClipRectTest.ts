/**
 * Bridge3D 在带 scrollRect（裁剪矩形）的 Sprite 下的效果验证
 * 用于验证：当 Bridge3DSprite 作为设置了 scrollRect 的 Sprite 的子节点时，3D 内容应被正确裁剪到该矩形内。
 */
import { Laya } from "Laya";
import { Bridge3DSprite } from "laya/bridge/Bridge3DSprite";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Scene } from "laya/display/Scene";
import { Sprite } from "laya/display/Sprite";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Rectangle } from "laya/maths/Rectangle";
import { Vector3 } from "laya/maths/Vector3";
import { Main } from "../../Main";
import { Script } from "laya/components/Script";

class SpriteAngleScript extends Script {
    speed: number = 10;
    onUpdate(): void {
        (this.owner as Sprite).rotation += this.speed;
    }
}

class Sprite3DAxisRotScript extends Script {
    axis: Vector3 = new Vector3(0, 1, 0);
    onUpdate(): void {
        (this.owner as Sprite3D).transform.rotate(this.axis, true);
    }
}

const CLIP_W = 280;
const CLIP_H = 280;
const CONTAINER_X = 100;
const CONTAINER_Y = 100;

export class Bridge3DClipRectTest {
    constructor(maincls: typeof Main) {
        this.run(maincls);
    }

    private run(maincls: typeof Main): void {
        // console.log("Bridge3D ClipRect (scrollRect) Test - Started");
        Laya.stage.bgColor = "#232628";

        const scene2D = new Scene();
        maincls.box2D.addChild(scene2D);

        // 1. 父级 scrollRect：容器 Sprite 设置裁剪矩形
        const container = new Sprite();
        container.pos(CONTAINER_X, CONTAINER_Y);
        container.scrollRect = new Rectangle(0, 0, CLIP_W, CLIP_H);
        scene2D.addChild(container);

        // 左上角绿圆（部分会被裁掉）
        const letSprite = new Sprite();
        letSprite.pos(0, 0);
        letSprite.graphics.drawCircle(0, 0, 51, null, "#00aa00");
        container.addChild(letSprite);

        // 右下角黄圆（部分会被裁掉）
        const rightBottomCircle = new Sprite();
        rightBottomCircle.pos(CLIP_W - 40, CLIP_H - 40);
        rightBottomCircle.graphics.drawCircle(0, 0, 45, null, "#ddcc00");
        container.addChild(rightBottomCircle);

        // 右侧竖条（一半在裁剪区内）
        const rightBar = new Sprite();
        rightBar.pos(CLIP_W - 15, 0);
        rightBar.graphics.drawRect(0, 0, 30, CLIP_H + 60, "#ff6600", null);
        container.addChild(rightBar);

        // 底部横条（一半在裁剪区内）
        const bottomBar = new Sprite();
        bottomBar.pos(0, CLIP_H - 12);
        bottomBar.graphics.drawRect(0, 0, CLIP_W + 50, 24, "#aa44ff", null);
        container.addChild(bottomBar);

        // 中心小方块
        const centerRect = new Sprite();
        centerRect.pos(CLIP_W / 2 - 25, CLIP_H / 2 - 25);
        centerRect.graphics.drawRect(0, 0, 50, 50, "#00cccc", "#006666", 1);
        container.addChild(centerRect);

        // 标出裁剪区域边框（绿色）
        container.graphics.drawRect(0, 0, CLIP_W, CLIP_H, null, "#00aa00", 2);

        // Bridge3DSprite 放在容器内，球体半径 50，会有一部分超出 scrollRect 左/上边界
        const bridge = new Bridge3DSprite();
        bridge.pos(0, 0);
        bridge.pixelsPerUnit = 1;
        container.addChild(bridge);

        (scene2D as any)._bridge3DInternal.scene3d.ambientColor = new Color(1, 1, 1, 1);

        // 平行光（复用 Bridge3DTest 方式）
        const lightSprite = new Bridge3DSprite();
        scene2D.addChild(lightSprite);
        const directionLight = new Sprite3D();
        const dircom = directionLight.addComponent(DirectionLightCom);
        lightSprite.addChild(directionLight);
        dircom.color = new Color(1, 0.95, 0.9, 1);
        const mat: Matrix4x4 = directionLight.transform.worldMatrix;
        mat.setForward(new Vector3(-1.0, -1.0, -1.0));
        directionLight.transform.worldMatrix = mat;

        // 3D 球体（红）
        const sphere = new MeshSprite3D(PrimitiveMesh.createSphere(50));
        const material = new BlinnPhongMaterial();
        material.albedoColor = new Color(0.8, 0.3, 0.3, 1.0);
        sphere.meshRenderer.material = material;
        bridge.addChild(sphere);

        // 3D 立方体（偏右下方，部分会出裁剪区）
        const cube = new MeshSprite3D(PrimitiveMesh.createBox(25, 25, 25));
        const matCube = new BlinnPhongMaterial();
        matCube.albedoColor = new Color(0.2, 0.8, 0.4, 1.0);
        cube.meshRenderer.material = matCube;
        cube.transform.localPosition = new Vector3(20, -80, 0);  // Y-up: relative to bridge; (20 right, 80 down)
        bridge.addChild(cube);

        // 2. 自身 scrollRect：另一个 Bridge3DSprite 自己设置 scrollRect
        const selfClipW = 180;
        const selfClipH = 180;
        const bridgeSelf = new Bridge3DSprite();
        bridgeSelf.pos(450, 120);
        bridgeSelf.pixelsPerUnit = 1;
        // bridgeSelf.scrollRect = new Rectangle(0, 0, selfClipW, selfClipH);
        scene2D.addChild(bridgeSelf);
        bridgeSelf.graphics.drawRect(0, 0, selfClipW, selfClipH, null, "#0088ff", 2);

        // 右侧区域：若干 2D 精灵做背景
        const bgRect = new Sprite();
        bgRect.pos(448, 118);
        bgRect.graphics.drawRect(0, 0, selfClipW + 4, selfClipH + 4, "#220044", "#0088ff", 1);
        scene2D.addChild(bgRect);
        bridgeSelf.zOrder = 1;

        const dot1 = new Sprite();
        dot1.pos(455, 130);
        dot1.graphics.drawCircle(0, 0, 8, null, "#ff88ff");
        scene2D.addChild(dot1);
        const dot2 = new Sprite();
        dot2.pos(600, 250);
        dot2.graphics.drawCircle(0, 0, 12, null, "#88ff88");
        scene2D.addChild(dot2);

        const sphere2 = new MeshSprite3D(PrimitiveMesh.createSphere(40));
        const mat2 = new BlinnPhongMaterial();
        mat2.albedoColor = new Color(0.3, 0.5, 0.9, 1.0);
        sphere2.meshRenderer.material = mat2;
        bridgeSelf.addChild(sphere2);

        // 第二个 Bridge 内再加一个小立方体
        const cube2 = new MeshSprite3D(PrimitiveMesh.createBox(20, 20, 20));
        const matCube2 = new BlinnPhongMaterial();
        matCube2.albedoColor = new Color(0.9, 0.6, 0.2, 1.0);
        cube2.meshRenderer.material = matCube2;
        cube2.transform.localPosition = new Vector3(100, -50, -30);  // Y-up: relative to bridgeSelf; (100 right, 50 down)
        bridgeSelf.addChild(cube2);

        // 3. 第三个裁剪区：多个 2D 精灵 + 说明用图形
        const clip3W = 200;
        const clip3H = 160;
        const container3 = new Sprite();
        container3.pos(100, 420);
        container3.scrollRect = new Rectangle(0, 0, clip3W, clip3H);
        scene2D.addChild(container3);
        container3.graphics.drawRect(0, 0, clip3W, clip3H, null, "#cc4400", 2);
        for (let i = 0; i < 5; i++) {
            const s = new Sprite();
            s.pos(20 + i * 45, 20 + (i % 3) * 45);
            s.graphics.drawRect(0, 0, 35, 35, "#3366" + (i * 22).toString(16).padStart(2, "0"), null);
            container3.addChild(s);
        }
        const strip = new Sprite();
        strip.pos(-20, clip3H / 2 - 15);
        strip.graphics.drawRect(0, 0, clip3W + 80, 30, "#00aacc", null);
        container3.addChild(strip);

        // 旋转动画，便于观察裁剪边界是否稳定
        const rot1 = bridge.addComponent(SpriteAngleScript);
        rot1.speed = 10;
        const rot2 = bridgeSelf.addComponent(SpriteAngleScript);
        rot2.speed = -8;
        const cubeRot = cube.addComponent(Sprite3DAxisRotScript);
        cubeRot.axis = new Vector3(0, 2, 1);
        const cube2Rot = cube2.addComponent(Sprite3DAxisRotScript);
        cube2Rot.axis = new Vector3(1, 0, 2);

        console.log("Bridge3D ClipRect Test - 左上方：父级 scrollRect 裁剪（2D+3D）；右方：自身 scrollRect 裁剪；下方：纯 2D 多精灵裁剪");
    }
}
