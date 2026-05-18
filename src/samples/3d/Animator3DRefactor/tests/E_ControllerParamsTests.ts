/**
 * Animator 重构回归示例 — E 组：Controller + 参数
 *
 * 6 项：
 *   E1 controller 资源加载
 *   E2 setParamsBool / setParamsNumber / setParamsTrigger
 *   E3 condition transition
 *   E4 exitTime 时间触发
 *   E5 isAndOperEnabled 多条件 AND
 *   E6 soloTransitions 优先级
 *
 * 全部用 danding（layer 0 已含 Stand/Run/Attack/Skill1/Skill2/Super/Stun），
 * 程序化用 addProgrammaticTransition 给现有 state 加 transition。
 */

import { TestCase } from "../core/TestCase";
import { TestRunner } from "../core/TestRunner";
import { Assert } from "../core/Assert";
import { SceneRig } from "../scene/SceneRig";
import { addProgrammaticTransition } from "../factories/ProgrammaticAssets";
import { AnimatorStateCondition } from "laya/components/AnimatorStateCondition";
import { AniStateConditionNumberCompressType } from "laya/components/AnimatorControllerParse";

export function registerControllerParamsTests(runner: TestRunner, rig: SceneRig): void {
    const cases: TestCase[] = [
        {
            id: "E1",
            group: "E_ControllerParams",
            title: "Controller 资源加载（danding 已绑）",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                await ctx.waitFrames(2);
                Assert.truthy(animator.controllerLayerCount > 0, "至少一个 layer");
                const layer = animator.getControllerLayer(0);
                Assert.truthy(layer.states.length >= 7, `Stand/Run/Attack/... 共 ≥7 个 state，实际 ${layer.states.length}`);
                Assert.truthy(layer.getAnimatorState("Stand"), "Stand state 存在");
                Assert.truthy(layer.getAnimatorState("Run"), "Run state 存在");
            },
        },
        {
            id: "E2",
            group: "E_ControllerParams",
            title: "setParamsBool / Number / Trigger",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                await ctx.waitFrames(2);
                animator.setParamsBool("E2_flag", true);
                animator.setParamsNumber("E2_num", 3.14);
                animator.setParamsTrigger("E2_trig");
                const idA = AnimatorStateCondition.conditionNameToID("E2_flag");
                const idB = AnimatorStateCondition.conditionNameToID("E2_num");
                const idC = AnimatorStateCondition.conditionNameToID("E2_trig");
                Assert.equal(animator.animatorParams[idA], true, "bool 已写入");
                Assert.approx(animator.animatorParams[idB] as number, 3.14, 1e-6, "number 已写入");
                Assert.equal(animator.animatorParams[idC], true, "trigger 已写入");
            },
        },
        {
            id: "E3",
            group: "E_ControllerParams",
            title: "条件 transition 触发切换",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                await ctx.waitFrames(2);
                const layer = animator.getControllerLayer(0);
                const stand = layer.getAnimatorState("Stand")!;
                const run = layer.getAnimatorState("Run")!;
                addProgrammaticTransition(stand, {
                    destState: run,
                    exitByTime: false,
                    transduration: 0.05,
                    conditions: [{ kind: "bool", name: "E3_goRun", expect: true }],
                });
                animator.play("Stand");
                await ctx.waitFrames(3);
                Assert.equal(layer.getCurrentPlayState().currentState!.name, "Stand", "初始 Stand");
                animator.setParamsBool("E3_goRun", true);
                await ctx.waitUntil(() => layer.getCurrentPlayState().currentState!.name === "Run", 3000);
            },
        },
        {
            id: "E4",
            group: "E_ControllerParams",
            title: "exitTime 时间触发 transition",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                await ctx.waitFrames(2);
                animator.speed = 5; // 加速，缩短等待
                const layer = animator.getControllerLayer(0);
                const run = layer.getAnimatorState("Run")!;
                const attack = layer.getAnimatorState("Attack")!;
                addProgrammaticTransition(run, {
                    destState: attack,
                    exitByTime: true,
                    exitTime: 0.3,
                    transduration: 0.05,
                });
                animator.play("Run");
                await ctx.waitUntil(
                    () => layer.getCurrentPlayState().currentState!.name === "Attack",
                    5000
                );
            },
        },
        {
            id: "E5",
            group: "E_ControllerParams",
            title: "isAndOperEnabled 多条件 AND",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                await ctx.waitFrames(2);
                const layer = animator.getControllerLayer(0);
                const stand = layer.getAnimatorState("Stand")!;
                const skill1 = layer.getAnimatorState("Skill1")!;
                addProgrammaticTransition(stand, {
                    destState: skill1,
                    exitByTime: false,
                    transduration: 0.05,
                    isAndOperEnabled: true,
                    conditions: [
                        { kind: "bool", name: "E5_X", expect: true },
                        { kind: "bool", name: "E5_Y", expect: true },
                    ],
                });
                animator.play("Stand");
                await ctx.waitFrames(3);
                animator.setParamsBool("E5_X", true);
                await ctx.waitFrames(10);
                Assert.equal(layer.getCurrentPlayState().currentState!.name, "Stand",
                    "AND 只满足一半时不切换");
                animator.setParamsBool("E5_Y", true);
                await ctx.waitUntil(() => layer.getCurrentPlayState().currentState!.name === "Skill1", 3000);
            },
        },
        {
            id: "E6",
            group: "E_ControllerParams",
            title: "soloTransitions 优先级",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                await ctx.waitFrames(2);
                const layer = animator.getControllerLayer(0);
                const stand = layer.getAnimatorState("Stand")!;
                const run = layer.getAnimatorState("Run")!;
                const attack = layer.getAnimatorState("Attack")!;
                // 普通 transition: Stand→Run on E6_R
                addProgrammaticTransition(stand, {
                    destState: run,
                    exitByTime: false,
                    transduration: 0.05,
                    conditions: [{ kind: "bool", name: "E6_R", expect: true }],
                });
                // solo transition: Stand→Attack on E6_A
                addProgrammaticTransition(stand, {
                    destState: attack,
                    exitByTime: false,
                    transduration: 0.05,
                    solo: true,
                    conditions: [{ kind: "bool", name: "E6_A", expect: true }],
                });
                animator.play("Stand");
                await ctx.waitFrames(3);
                // 普通条件单独满足应被 solo 屏蔽
                animator.setParamsBool("E6_R", true);
                await ctx.waitFrames(15);
                Assert.equal(layer.getCurrentPlayState().currentState!.name, "Stand",
                    "存在 solo 时普通 transition 不应触发");
                // solo 条件满足才切换
                animator.setParamsBool("E6_A", true);
                await ctx.waitUntil(() => layer.getCurrentPlayState().currentState!.name === "Attack", 3000);
            },
        },
    ];

    runner.registerAll(cases);
}
