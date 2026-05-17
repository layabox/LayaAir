/**
 * Animator 重构回归示例 — 场景搭建与角色加载
 *
 * 单 Scene3D，相机 + 平行光固定；角色按需克隆/创建/复用。
 */

import { Laya } from "Laya";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Camera } from "laya/d3/core/Camera";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Loader } from "laya/net/Loader";
import { Animator } from "laya/d3/component/Animator/Animator";
import { Resources } from "./ResourceManifest";

export class SceneRig {
    scene: Scene3D;
    camera: Camera;
    light: Sprite3D;

    private _spawned: Sprite3D[] = [];

    constructor() {
        this.scene = new Scene3D();
        Laya.stage.addChild(this.scene);
        this.scene.ambientColor = new Color(0.5, 0.5, 0.5);

        this.camera = new Camera(0, 0.1, 100);
        this.camera.transform.translate(new Vector3(0, 2, 4));
        this.camera.transform.rotate(new Vector3(-20, 0, 0), true, false);
        this.scene.addChild(this.camera);

        this.light = new Sprite3D();
        const lit = this.light.addComponent(DirectionLightCom);
        const mat: Matrix4x4 = this.light.transform.worldMatrix;
        mat.setForward(new Vector3(-1, -1, -1));
        this.light.transform.worldMatrix = mat;
        this.scene.addChild(this.light);
    }

    /** 创建一份 danding 实例（已加载 prefab 前提下），追加到 _spawned。返回 Animator */
    spawnDanding(position?: Vector3): { sprite: Sprite3D; animator: Animator } {
        const root = Loader.createNodes(Resources.danding.prefab) as Sprite3D;
        this.scene.addChild(root);
        if (position) root.transform.position = position;
        this._spawned.push(root);
        const animator = this._findAnimator(root);
        if (!animator) throw new Error("danding prefab 没找到 Animator");
        return { sprite: root, animator };
    }

    /**
     * 创建一个空白 Sprite3D，自动挂 Animator（无任何 controllerLayer）。
     * 用于 G/I/J 组：程序化构造 clip / layer 后挂上去测试。
     */
    spawnDummy(position?: Vector3): { sprite: Sprite3D; animator: Animator } {
        const root = new Sprite3D();
        this.scene.addChild(root);
        if (position) root.transform.position = position;
        this._spawned.push(root);
        const animator = root.addComponent(Animator);
        return { sprite: root, animator };
    }

    /** 创建一份 Drunk Walk 实例 */
    spawnMaskWalk(position?: Vector3): { sprite: Sprite3D; animator: Animator } {
        const root = Loader.createNodes(Resources.maskWalk.prefab) as Sprite3D;
        this.scene.addChild(root);
        if (position) root.transform.position = position;
        this._spawned.push(root);
        const animator = this._findAnimator(root);
        if (!animator) throw new Error("maskWalk prefab 没找到 Animator");
        return { sprite: root, animator };
    }

    /** 清空所有 spawn 出来的角色（case 间复位） */
    clearSpawned(): void {
        for (const s of this._spawned) s.destroy();
        this._spawned.length = 0;
    }

    private _findAnimator(root: Sprite3D): Animator | null {
        const direct = root.getComponent(Animator);
        if (direct) return direct;
        for (let i = 0; i < root.numChildren; i++) {
            const child = root.getChildAt(i) as Sprite3D;
            const a = child.getComponent(Animator);
            if (a) return a;
            const deeper = this._findAnimator(child);
            if (deeper) return deeper;
        }
        return null;
    }
}
