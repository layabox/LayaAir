/**
 * Animator 重构回归示例 — C 组：多层混合
 *
 * 6 项：多 Layer / OVERRIDE / ADDITIVE / defaultWeight / layer.enable / resetAdditiveBaseValues
 *
 * 用 MaskModelTest 的 Drunk Walk 角色。每个 case 程序化新增第二个 layer，与
 * prefab 自带 layer 共存。
 */

import { Laya } from "Laya";
import { Loader } from "laya/net/Loader";
import { AnimationClip } from "laya/d3/animation/AnimationClip";
import { Animator } from "laya/d3/component/Animator/Animator";
import { AnimatorControllerLayer } from "laya/d3/component/Animator/AnimatorControllerLayer";
import { AnimatorState } from "laya/d3/component/Animator/AnimatorState";
import { TestCase } from "../core/TestCase";
import { TestRunner } from "../core/TestRunner";
import { Assert } from "../core/Assert";
import { SceneRig } from "../scene/SceneRig";
import { Resources } from "../scene/ResourceManifest";

async function getMaskClip(): Promise<AnimationClip> {
    let clip = Loader.getRes(Resources.maskWalk.clip) as AnimationClip;
    if (!clip) {
        await Laya.loader.load([Resources.maskWalk.clip]);
        clip = Loader.getRes(Resources.maskWalk.clip) as AnimationClip;
    }
    if (!clip) throw new Error(`无法加载 clip: ${Resources.maskWalk.clip}`);
    return clip;
}

/**
 * 给 animator 添加第二个 layer，复用同一个 clip。
 * 返回新 layer 的索引（addControllerLayer 后是 layers.length - 1）。
 */
function attachSecondLayer(animator: Animator, clip: AnimationClip, blendingMode: number = 0, weight: number = 1): {
    layer: AnimatorControllerLayer;
    layerIndex: number;
    state: AnimatorState;
} {
    const layer = new AnimatorControllerLayer("ProgrammaticLayer");
    layer.blendingMode = blendingMode;
    layer.defaultWeight = weight;
    const state = new AnimatorState();
    state.name = "ProgState_C";
    state.clip = clip;
    layer.addState(state);
    layer.defaultState = state;
    animator.addControllerLayer(layer);
    const layerIndex = animator.controllerLayerCount - 1;
    return { layer, layerIndex, state };
}

export function registerLayerBlendTests(runner: TestRunner, rig: SceneRig): void {
    const cases: TestCase[] = [
        {
            id: "C1",
            group: "C_LayerBlend",
            title: "多 Layer：addControllerLayer 计数",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnMaskWalk();
                await ctx.waitFrames(2);
                const baseCount = animator.controllerLayerCount;
                const clip = await getMaskClip();
                attachSecondLayer(animator, clip);
                Assert.equal(animator.controllerLayerCount, baseCount + 1, "layer 数 +1");
            },
        },
        {
            id: "C2",
            group: "C_LayerBlend",
            title: "BLENDINGMODE_OVERRIDE",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnMaskWalk();
                await ctx.waitFrames(2);
                const clip = await getMaskClip();
                const { layer, layerIndex } = attachSecondLayer(animator, clip,
                    AnimatorControllerLayer.BLENDINGMODE_OVERRIDE, 1.0);
                animator.play("ProgState_C", layerIndex);
                await ctx.waitFrames(5);
                Assert.equal(layer.blendingMode, AnimatorControllerLayer.BLENDINGMODE_OVERRIDE, "blendingMode 字段");
                const ps = layer.getCurrentPlayState();
                Assert.truthy(ps.currentState, "layer1 currentState 已就绪");
                Assert.truthy(ps._normalizedTime > 0, "layer1 应在推进");
            },
        },
        {
            id: "C3",
            group: "C_LayerBlend",
            title: "BLENDINGMODE_ADDITIVE",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnMaskWalk();
                await ctx.waitFrames(2);
                const clip = await getMaskClip();
                const { layer, layerIndex } = attachSecondLayer(animator, clip,
                    AnimatorControllerLayer.BLENDINGMODE_ADDTIVE, 1.0);
                animator.play("ProgState_C", layerIndex);
                await ctx.waitFrames(5);
                Assert.equal(layer.blendingMode, AnimatorControllerLayer.BLENDINGMODE_ADDTIVE, "blendingMode 字段");
                Assert.truthy(layer.getCurrentPlayState()._normalizedTime > 0, "additive layer 应推进");
            },
        },
        {
            id: "C4",
            group: "C_LayerBlend",
            title: "defaultWeight 调节",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnMaskWalk();
                await ctx.waitFrames(2);
                const clip = await getMaskClip();
                const { layer, layerIndex } = attachSecondLayer(animator, clip,
                    AnimatorControllerLayer.BLENDINGMODE_OVERRIDE, 0.0);
                animator.play("ProgState_C", layerIndex);
                await ctx.waitFrames(3);
                Assert.approx(layer.defaultWeight, 0, 1e-6, "初始 weight=0");
                layer.defaultWeight = 0.5;
                await ctx.waitFrames(3);
                Assert.approx(layer.defaultWeight, 0.5, 1e-6, "weight=0.5");
                layer.defaultWeight = 1.0;
                await ctx.waitFrames(3);
                Assert.approx(layer.defaultWeight, 1.0, 1e-6, "weight=1");
                // 没崩 + 字段读写一致即视为通过；权重对最终 transform 影响在视觉上验证
            },
        },
        {
            id: "C5",
            group: "C_LayerBlend",
            title: "layer.enable 开关",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnMaskWalk();
                await ctx.waitFrames(2);
                const clip = await getMaskClip();
                const { layer, layerIndex } = attachSecondLayer(animator, clip);
                animator.play("ProgState_C", layerIndex);
                await ctx.waitFrames(3);
                const ps = layer.getCurrentPlayState();
                const tBefore = ps._normalizedTime;
                layer.enable = false;
                await ctx.waitFrames(5);
                const tAfterDisable = ps._normalizedTime;
                Assert.approx(tAfterDisable, tBefore, 1e-3,
                    `disable 后 normalizedTime 不应推进 before=${tBefore} after=${tAfterDisable}`);
                layer.enable = true;
                await ctx.waitFrames(5);
                const tAfterEnable = ps._normalizedTime;
                Assert.truthy(tAfterEnable > tAfterDisable, "重新 enable 后应推进");
            },
        },
        {
            id: "C6",
            group: "C_LayerBlend",
            title: "resetAdditiveBaseValues 调用",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnMaskWalk();
                await ctx.waitFrames(2);
                const clip = await getMaskClip();
                const { layerIndex } = attachSecondLayer(animator, clip,
                    AnimatorControllerLayer.BLENDINGMODE_ADDTIVE, 1.0);
                animator.play("ProgState_C", layerIndex);
                await ctx.waitFrames(3);
                const ownersBefore = (animator as any)._keyframeNodeOwners.length;
                Assert.truthy(ownersBefore > 0, "应已建立 KeyframeNodeOwner 索引");
                animator.resetAdditiveBaseValues();
                await ctx.waitFrames(2);
                const ownersAfter = (animator as any)._keyframeNodeOwners.length;
                Assert.equal(ownersAfter, ownersBefore, "resetAdditiveBaseValues 不应改变 owner 数量");
            },
        },
    ];

    runner.registerAll(cases);
}
