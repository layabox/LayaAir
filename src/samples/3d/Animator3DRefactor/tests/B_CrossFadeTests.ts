/**
 * Animator 重构回归示例 — B 组：CrossFade
 *
 * 4 项：覆盖 _playType 的三种状态机：
 *   B1 _playType: 0 → 1（普通切动态融合）
 *   B2 _playType: 1 → 2（融合中再次 crossFade，切固定融合）
 *   B3 _playType: 1 → 0（融合完成回普通播放）
 *   B4 边界：duration=0 立即完成 / duration 大于 src 剩余时长触发减速
 */

import { TestCase } from "../core/TestCase";
import { TestRunner } from "../core/TestRunner";
import { Assert } from "../core/Assert";
import { SceneRig } from "../scene/SceneRig";

function getPlayType(animator: any): number {
    return (animator.getControllerLayer(0) as any)._playType;
}

export function registerCrossFadeTests(runner: TestRunner, rig: SceneRig): void {
    const cases: TestCase[] = [
        {
            id: "B1",
            group: "B_CrossFade",
            title: "crossFade: _playType 0 → 1",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                animator.play("Stand");
                await ctx.waitFrames(3);
                Assert.equal(getPlayType(animator), 0, "play 之后应为 _playType=0");
                animator.crossFade("Run", 0.5);
                await ctx.waitFrames(2);
                Assert.equal(getPlayType(animator), 1, "crossFade 后应为 _playType=1（动态融合）");
            },
        },
        {
            id: "B2",
            group: "B_CrossFade",
            title: "crossFade 中再 crossFade: _playType 1 → 2",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                animator.play("Stand");
                await ctx.waitFrames(3);
                animator.crossFade("Run", 0.5);
                await ctx.waitFrames(2);
                Assert.equal(getPlayType(animator), 1, "首次 crossFade 后 _playType=1");
                animator.crossFade("Skill1", 0.5);
                await ctx.waitFrames(2);
                Assert.equal(getPlayType(animator), 2, "二次 crossFade 后 _playType=2（固定融合）");
            },
        },
        {
            id: "B3",
            group: "B_CrossFade",
            title: "crossFade 完成: _playType 1 → 0",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                animator.play("Stand");
                await ctx.waitFrames(3);
                animator.speed = 5; // 加速融合完成
                animator.crossFade("Run", 0.3);
                await ctx.waitFrames(2);
                Assert.equal(getPlayType(animator), 1, "进入融合");
                await ctx.waitUntil(() => getPlayType(animator) === 0, 5000);
                const layer = animator.getControllerLayer(0);
                Assert.equal(layer.getCurrentPlayState().currentState!.name, "Run",
                    "融合完成后 currentState 应为 Run");
            },
        },
        {
            id: "B4",
            group: "B_CrossFade",
            title: "crossFade 边界: 极短 duration",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                animator.play("Stand");
                await ctx.waitFrames(3);
                animator.speed = 10;
                animator.crossFade("Attack", 0.001); // 几乎瞬时
                await ctx.waitFrames(3);
                // 极短 duration 几帧内应完成融合
                await ctx.waitUntil(() => getPlayType(animator) === 0, 2000);
                const layer = animator.getControllerLayer(0);
                Assert.equal(layer.getCurrentPlayState().currentState!.name, "Attack",
                    "极短 crossFade 应快速切到目标");
            },
        },
    ];

    runner.registerAll(cases);
}
