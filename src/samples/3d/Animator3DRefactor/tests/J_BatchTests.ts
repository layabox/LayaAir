/**
 * Animator 重构回归示例 — J 组：批量化
 *
 * 1 项：同场景 N 份 danding 同时跑，所有 animator 各自正常推进。
 *
 * 这是后续 AnimatorManager 接管后批量调度收益的验证基线 —— 重构每阶段跑此 case
 * 应得到一致的 final normalizedTime（行为不变）。
 */

import { Vector3 } from "laya/maths/Vector3";
import { TestCase } from "../core/TestCase";
import { TestRunner } from "../core/TestRunner";
import { Assert } from "../core/Assert";
import { SceneRig } from "../scene/SceneRig";

const BATCH_COUNT = 1000;

export function registerBatchTests(runner: TestRunner, rig: SceneRig): void {
    const cases: TestCase[] = [
        {
            id: "J1",
            group: "J_Batch",
            title: `${BATCH_COUNT} 份 danding 同步播放`,
            run: async (ctx) => {
                rig.clearSpawned();
                const animators = [];
                for (let i = 0; i < BATCH_COUNT; i++) {
                    const x = (i % 4) * 1.5 - 2.25;
                    const z = Math.floor(i / 4) * 1.5;
                    const { animator } = rig.spawnDanding(new Vector3(x, 0, z));
                    animator.play("Run");
                    animators.push(animator);
                }
                await ctx.waitFrames(8);
                for (let i = 0; i < BATCH_COUNT; i++) {
                    const ps = animators[i].getControllerLayer(0).getCurrentPlayState();
                    Assert.truthy(ps._normalizedTime > 0,
                        `第 ${i} 个 animator 应推进，实际 ${ps._normalizedTime}`);
                }
                // 所有 animator 推进量应大致一致（同步性）
                const times = animators.map(a => a.getControllerLayer(0).getCurrentPlayState()._normalizedTime);
                const minT = Math.min(...times);
                const maxT = Math.max(...times);
                ctx.log(`min=${minT.toFixed(4)} max=${maxT.toFixed(4)} spread=${(maxT - minT).toFixed(4)}`);
                Assert.truthy(maxT - minT < 0.5,
                    `所有 animator 推进应大致同步, spread=${(maxT - minT).toFixed(4)}`);
            },
        },
    ];

    runner.registerAll(cases);
}
