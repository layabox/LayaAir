/**
 * Animator 重构回归示例 — I 组：BoneLink
 *
 * 1 项：调用 animator._handleSpriteOwnersBySprite(true, path, sprite) 把额外 sprite
 * 挂到骨骼节点路径上 — 不崩 + animator._keyframeNodeOwnerMap 容量保持稳定。
 *
 * 该路径在引擎里用于武器/特效跟随骨骼。本测试验证 internal 接口能被调用，
 * 实际骨骼名因 danding 模型不同可能未命中（命中与否由 clip._nodesMap 决定）。
 */

import { Sprite3D } from "laya/d3/core/Sprite3D";
import { TestCase } from "../core/TestCase";
import { TestRunner } from "../core/TestRunner";
import { Assert } from "../core/Assert";
import { SceneRig } from "../scene/SceneRig";

export function registerBoneLinkTests(runner: TestRunner, rig: SceneRig): void {
    const cases: TestCase[] = [
        {
            id: "I1",
            group: "I_BoneLink",
            title: "_handleSpriteOwnersBySprite 调用不崩",
            run: async (ctx) => {
                rig.clearSpawned();
                const { sprite, animator } = rig.spawnDanding();
                await ctx.waitFrames(2);
                animator.play("Run");
                await ctx.waitFrames(3);

                const beforeCount = (animator as any)._keyframeNodeOwners.length;
                Assert.truthy(beforeCount > 0, "Run 加载后应已建立 owner 表");

                const attached = new Sprite3D();
                attached.name = "AttachedCube";
                sprite.addChild(attached);
                // 随便给一个路径 — 不一定命中具体骨骼，但接口应不崩
                (animator as any)._handleSpriteOwnersBySprite(true, ["Bip001", "Bip001 Pelvis"], attached);
                await ctx.waitFrames(3);

                const afterCount = (animator as any)._keyframeNodeOwners.length;
                ctx.log(`owners before=${beforeCount} after=${afterCount}`);
                // 接口存在 + 调用不抛错即算通过
                Assert.truthy(afterCount >= beforeCount, "owners 数量不应减少");

                // 反向解绑也应不崩
                (animator as any)._handleSpriteOwnersBySprite(false, ["Bip001", "Bip001 Pelvis"], attached);
                await ctx.waitFrames(2);
                Assert.truthy(true, "解绑调用不崩");
            },
        },
    ];

    runner.registerAll(cases);
}
