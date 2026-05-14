/**
 * Animator 重构回归示例 — D 组：AvatarMask
 *
 * 1 项：用 maskUp.lavm 实际 mask 数据，挂到程序化新建的 layer，验证：
 *   - layer.avatarMask 字段正确设置
 *   - mask 标记的开关骨骼路径与 maskUp.lavm 一致
 *   - 该 layer 在 update 中能正常推进（不因 mask 而崩）
 */

import { Loader } from "laya/net/Loader";
import { AnimationClip } from "laya/d3/animation/AnimationClip";
import { AnimatorControllerLayer } from "laya/d3/component/Animator/AnimatorControllerLayer";
import { AnimatorState } from "laya/d3/component/Animator/AnimatorState";
import { AvatarMask } from "laya/d3/component/Animator/AvatarMask";
import { Laya } from "Laya";
import { TestCase } from "../core/TestCase";
import { TestRunner } from "../core/TestRunner";
import { Assert } from "../core/Assert";
import { SceneRig } from "../scene/SceneRig";
import { Resources } from "../scene/ResourceManifest";

async function loadMaskFromLavm(url: string): Promise<AvatarMask> {
    // .lavm 是 JSON 文件，直接 fetch。bin/sample-resource/ 已是 URL.basePath。
    const resp = await fetch(`sample-resource/${url}`);
    if (!resp.ok) throw new Error(`fetch maskUp.lavm 失败: ${resp.status}`);
    const data = await resp.json();
    const mask = new AvatarMask();
    const map = data._avatarPathMap ?? {};
    for (const path in map) {
        mask.setTransformActive(path, map[path]);
    }
    return mask;
}

async function getMaskClip(): Promise<AnimationClip> {
    let clip = Loader.getRes(Resources.maskWalk.clip) as AnimationClip;
    if (!clip) {
        await Laya.loader.load([Resources.maskWalk.clip]);
        clip = Loader.getRes(Resources.maskWalk.clip) as AnimationClip;
    }
    if (!clip) throw new Error(`无法加载 clip: ${Resources.maskWalk.clip}`);
    return clip;
}

export function registerAvatarMaskTests(runner: TestRunner, rig: SceneRig): void {
    const cases: TestCase[] = [
        {
            id: "D1",
            group: "D_AvatarMask",
            title: "AvatarMask 上半身遮罩（maskUp.lavm）",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnMaskWalk();
                await ctx.waitFrames(2);
                const clip = await getMaskClip();
                const mask = await loadMaskFromLavm(Resources.maskWalk.maskUp);

                const layer = new AnimatorControllerLayer("MaskedLayer");
                layer.avatarMask = mask;
                const state = new AnimatorState();
                state.name = "ProgState_D";
                state.clip = clip;
                layer.addState(state);
                layer.defaultState = state;
                animator.addControllerLayer(layer);
                const layerIndex = animator.controllerLayerCount - 1;
                animator.play("ProgState_D", layerIndex);
                await ctx.waitFrames(5);

                Assert.truthy(layer.avatarMask, "layer.avatarMask 已挂载");
                // maskUp.lavm 中已知：Hips=true，Spine2=false
                Assert.equal(mask.getTransformActive("mixamorig:Hips"), true, "Hips 应通过");
                const spine2 = "mixamorig:Hips/mixamorig:Spine/mixamorig:Spine1/mixamorig:Spine2";
                Assert.equal(mask.getTransformActive(spine2), false, "Spine2 应被 mask 关闭");
                Assert.truthy(layer.getCurrentPlayState()._normalizedTime > 0, "masked layer 应推进");
                ctx.log(`mask 已生效，layer.normalizedTime=${layer.getCurrentPlayState()._normalizedTime}`);
            },
        },
    ];

    runner.registerAll(cases);
}
