/**
 * Animator 重构回归示例 — G 组：KeyFrame 类型
 *
 * 10 项：Float / Position / Rotation / Scale / RotationEuler / Vector2/3/4 / Color / Boolean / PathPoint / Material
 *
 * 每个 case：dummy sprite + 程序化 clip + 一个 KeyFrameValueType。
 * 断言：跑完 clip duration 后目标属性接近 keyframe[1].value。
 *
 * 已知坑：Animator._addKeyframeNodeOwner 内 `if (!property) break;` 把数值 0/false
 * 当作 falsy 终止链式访问 — 自定义属性初值必须非 0 / 非 false / 非空字符串。
 *
 * SKIP：
 *   G9 PathPoint  — 需要特殊 transform 结构（pos+rotation 组合），现行 evaluate 写回路径只支持 sprite 子节点形态
 *   G10 Material   — 需要构造完整 shader + Material 子系统，超出本期 TS 重构边界
 */

import { Animator } from "laya/d3/component/Animator/Animator";
import { AnimatorControllerLayer } from "laya/d3/component/Animator/AnimatorControllerLayer";
import { AnimatorState } from "laya/d3/component/Animator/AnimatorState";
import { KeyFrameValueType } from "laya/d3/component/Animator/KeyframeNodeOwner";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Color } from "laya/maths/Color";
import { Quaternion } from "laya/maths/Quaternion";
import { Vector2 } from "laya/maths/Vector2";
import { Vector3 } from "laya/maths/Vector3";
import { Vector4 } from "laya/maths/Vector4";
import { TestCase } from "../core/TestCase";
import { TestRunner } from "../core/TestRunner";
import { Assert } from "../core/Assert";
import { SceneRig } from "../scene/SceneRig";
import { buildClip, ProgrammaticClipNodeSpec } from "../factories/ProgrammaticAssets";

const SHORT_DURATION = 0.3; // clip 时长（秒）— 跑短点等帧少

function attachAndPlay(animator: Animator, clip: any): AnimatorControllerLayer {
    const layer = new AnimatorControllerLayer("G_Layer");
    layer.defaultWeight = 1;
    const state = new AnimatorState();
    state.name = "G_State";
    state.clip = clip;
    layer.addState(state);
    layer.defaultState = state;
    animator.addControllerLayer(layer);
    animator.play("G_State", animator.controllerLayerCount - 1);
    return layer;
}

export function registerKeyframeTypeTests(runner: TestRunner, rig: SceneRig): void {
    const cases: TestCase[] = [
        // ─── G2 Position ────────────────────────────────────────
        {
            id: "G2",
            group: "G_KeyframeType",
            title: "Position keyframe (transform.localPosition)",
            run: async (ctx) => {
                rig.clearSpawned();
                const { sprite, animator } = rig.spawnDummy();
                const startVal = new Vector3(0, 0, 0);
                const endVal = new Vector3(5, 0, 0);
                const clip = buildClip({
                    duration: SHORT_DURATION,
                    islooping: false,
                    nodes: [{
                        ownerPath: [""],
                        propertyOwner: "transform",
                        property: ["localPosition"],
                        type: KeyFrameValueType.Position,
                        keyframes: [
                            { time: 0, value: startVal },
                            { time: SHORT_DURATION, value: endVal },
                        ],
                    }],
                });
                const layer = attachAndPlay(animator, clip);
                await ctx.waitUntil(() => layer.getCurrentPlayState()._finish, 3000);
                await ctx.waitFrames(2);
                Assert.approx(sprite.transform.localPosition.x, endVal.x, 0.5,
                    `localPosition.x 末值应≈${endVal.x}, 实际 ${sprite.transform.localPosition.x}`);
            },
        },
        // ─── G3 Rotation (Quaternion) ────────────────────────────
        {
            id: "G3",
            group: "G_KeyframeType",
            title: "Rotation keyframe (transform.localRotation, Quaternion)",
            run: async (ctx) => {
                rig.clearSpawned();
                const { sprite, animator } = rig.spawnDummy();
                const q0 = new Quaternion(0, 0, 0, 1);
                const q1 = new Quaternion();
                Quaternion.createFromYawPitchRoll(Math.PI / 2, 0, 0, q1);
                const clip = buildClip({
                    duration: SHORT_DURATION,
                    islooping: false,
                    nodes: [{
                        ownerPath: [""],
                        propertyOwner: "transform",
                        property: ["localRotation"],
                        type: KeyFrameValueType.Rotation,
                        keyframes: [
                            { time: 0, value: q0 },
                            { time: SHORT_DURATION, value: q1 },
                        ],
                    }],
                });
                const layer = attachAndPlay(animator, clip);
                await ctx.waitUntil(() => layer.getCurrentPlayState()._finish, 3000);
                await ctx.waitFrames(2);
                const r = sprite.transform.localRotation;
                // q1.y ≈ sin(π/4) ≈ 0.707
                Assert.approx(r.y, q1.y, 0.2, `Quat.y 末值应≈${q1.y.toFixed(3)}, 实际 ${r.y.toFixed(3)}`);
            },
        },
        // ─── G4 Scale ────────────────────────────────────────────
        {
            id: "G4",
            group: "G_KeyframeType",
            title: "Scale keyframe (transform.localScale)",
            run: async (ctx) => {
                rig.clearSpawned();
                const { sprite, animator } = rig.spawnDummy();
                const clip = buildClip({
                    duration: SHORT_DURATION,
                    islooping: false,
                    nodes: [{
                        ownerPath: [""],
                        propertyOwner: "transform",
                        property: ["localScale"],
                        type: KeyFrameValueType.Scale,
                        keyframes: [
                            { time: 0, value: new Vector3(1, 1, 1) },
                            { time: SHORT_DURATION, value: new Vector3(2, 2, 2) },
                        ],
                    }],
                });
                const layer = attachAndPlay(animator, clip);
                await ctx.waitUntil(() => layer.getCurrentPlayState()._finish, 3000);
                await ctx.waitFrames(2);
                Assert.approx(sprite.transform.localScale.x, 2, 0.3,
                    `localScale.x 末值应≈2, 实际 ${sprite.transform.localScale.x}`);
            },
        },
        // ─── G5 RotationEuler ────────────────────────────────────
        {
            id: "G5",
            group: "G_KeyframeType",
            title: "RotationEuler keyframe (transform.localRotationEuler)",
            run: async (ctx) => {
                rig.clearSpawned();
                const { sprite, animator } = rig.spawnDummy();
                const clip = buildClip({
                    duration: SHORT_DURATION,
                    islooping: false,
                    nodes: [{
                        ownerPath: [""],
                        propertyOwner: "transform",
                        property: ["localRotationEuler"],
                        type: KeyFrameValueType.RotationEuler,
                        keyframes: [
                            { time: 0, value: new Vector3(0, 0, 0) },
                            { time: SHORT_DURATION, value: new Vector3(0, 90, 0) },
                        ],
                    }],
                });
                const layer = attachAndPlay(animator, clip);
                await ctx.waitUntil(() => layer.getCurrentPlayState()._finish, 3000);
                await ctx.waitFrames(2);
                Assert.approx(sprite.transform.localRotationEuler.y, 90, 10,
                    `Euler.y 末值应≈90°, 实际 ${sprite.transform.localRotationEuler.y}`);
            },
        },
        // ─── G1 Float ────────────────────────────────────────────
        {
            id: "G1",
            group: "G_KeyframeType",
            title: "Float keyframe (sprite.floatProp)",
            run: async (ctx) => {
                rig.clearSpawned();
                const { sprite, animator } = rig.spawnDummy();
                // 初值非 0 — 否则 _addKeyframeNodeOwner 的 `!property` 检查会误判
                (sprite as any).floatProp = 0.001;
                const node: ProgrammaticClipNodeSpec = {
                    ownerPath: [""],
                    propertyOwner: "",
                    property: ["floatProp"],
                    type: KeyFrameValueType.Float,
                    keyframes: [
                        { time: 0, value: 0.001 },
                        { time: SHORT_DURATION, value: 7.5 },
                    ],
                };
                const clip = buildClip({ duration: SHORT_DURATION, islooping: false, nodes: [node] });
                const layer = attachAndPlay(animator, clip);
                await ctx.waitUntil(() => layer.getCurrentPlayState()._finish, 3000);
                await ctx.waitFrames(2);
                Assert.approx((sprite as any).floatProp, 7.5, 0.8,
                    `floatProp 末值应≈7.5, 实际 ${(sprite as any).floatProp}`);
            },
        },
        // ─── G6 Vector2 / Vector3 / Vector4 ──────────────────────
        {
            id: "G6",
            group: "G_KeyframeType",
            title: "Vector2/3/4 keyframe (sprite 自定义属性)",
            run: async (ctx) => {
                rig.clearSpawned();
                const { sprite, animator } = rig.spawnDummy();
                (sprite as any).v2 = new Vector2(0.01, 0.01);
                (sprite as any).v3 = new Vector3(0.01, 0.01, 0.01);
                (sprite as any).v4 = new Vector4(0.01, 0.01, 0.01, 0.01);
                const clip = buildClip({
                    duration: SHORT_DURATION,
                    islooping: false,
                    nodes: [
                        {
                            ownerPath: [""], propertyOwner: "", property: ["v2"],
                            type: KeyFrameValueType.Vector2,
                            keyframes: [
                                { time: 0, value: new Vector2(0.01, 0.01) },
                                { time: SHORT_DURATION, value: new Vector2(3, 4) },
                            ],
                        },
                        {
                            ownerPath: [""], propertyOwner: "", property: ["v3"],
                            type: KeyFrameValueType.Vector3,
                            keyframes: [
                                { time: 0, value: new Vector3(0.01, 0.01, 0.01) },
                                { time: SHORT_DURATION, value: new Vector3(5, 6, 7) },
                            ],
                        },
                        {
                            ownerPath: [""], propertyOwner: "", property: ["v4"],
                            type: KeyFrameValueType.Vector4,
                            keyframes: [
                                { time: 0, value: new Vector4(0.01, 0.01, 0.01, 0.01) },
                                { time: SHORT_DURATION, value: new Vector4(1, 2, 3, 4) },
                            ],
                        },
                    ],
                });
                const layer = attachAndPlay(animator, clip);
                await ctx.waitUntil(() => layer.getCurrentPlayState()._finish, 3000);
                await ctx.waitFrames(2);
                const v2 = (sprite as any).v2 as Vector2;
                const v3 = (sprite as any).v3 as Vector3;
                const v4 = (sprite as any).v4 as Vector4;
                Assert.approx(v2.x, 3, 0.5, `v2.x≈3 实际 ${v2.x}`);
                Assert.approx(v3.z, 7, 0.7, `v3.z≈7 实际 ${v3.z}`);
                Assert.approx(v4.w, 4, 0.5, `v4.w≈4 实际 ${v4.w}`);
            },
        },
        // ─── G7 Color ─────────────────────────────────────────────
        {
            id: "G7",
            group: "G_KeyframeType",
            title: "Color keyframe (sprite.color)",
            run: async (ctx) => {
                rig.clearSpawned();
                const { sprite, animator } = rig.spawnDummy();
                (sprite as any).color = new Color(0.01, 0.01, 0.01, 0.01);
                const clip = buildClip({
                    duration: SHORT_DURATION,
                    islooping: false,
                    nodes: [{
                        ownerPath: [""], propertyOwner: "", property: ["color"],
                        type: KeyFrameValueType.Color,
                        keyframes: [
                            { time: 0, value: new Vector4(0.01, 0.01, 0.01, 0.01) },
                            { time: SHORT_DURATION, value: new Vector4(1, 0.5, 0, 1) },
                        ],
                    }],
                });
                const layer = attachAndPlay(animator, clip);
                await ctx.waitUntil(() => layer.getCurrentPlayState()._finish, 3000);
                await ctx.waitFrames(2);
                const c = (sprite as any).color as Color;
                Assert.approx(c.r, 1, 0.3, `color.r≈1 实际 ${c.r}`);
                Assert.approx(c.g, 0.5, 0.3, `color.g≈0.5 实际 ${c.g}`);
            },
        },
        // ─── G8 Boolean ───────────────────────────────────────────
        {
            id: "G8",
            group: "G_KeyframeType",
            title: "Boolean keyframe (sprite.boolProp)",
            run: async (ctx) => {
                rig.clearSpawned();
                const { sprite, animator } = rig.spawnDummy();
                // 初值 true — false 是 falsy 会被 `!property` 截断
                (sprite as any).boolProp = true;
                const clip = buildClip({
                    duration: SHORT_DURATION,
                    islooping: false,
                    nodes: [{
                        ownerPath: [""], propertyOwner: "", property: ["boolProp"],
                        type: KeyFrameValueType.Boolean,
                        keyframes: [
                            { time: 0, value: true },
                            { time: SHORT_DURATION, value: false },
                        ],
                    }],
                });
                const layer = attachAndPlay(animator, clip);
                await ctx.waitUntil(() => layer.getCurrentPlayState()._finish, 3000);
                await ctx.waitFrames(2);
                Assert.equal((sprite as any).boolProp, false, "boolProp 末值应为 false");
            },
        },
        // ─── G9 / G10 SKIP ────────────────────────────────────────
        {
            id: "G9",
            group: "G_KeyframeType",
            title: "PathPoint keyframe",
            skip: true,
            skipReason: "PathPoint 需要特殊 pos+rotation 复合属性结构，留待后续补",
            run: async () => {},
        },
        {
            id: "G10",
            group: "G_KeyframeType",
            title: "Material 属性动画",
            skip: true,
            skipReason: "需构造完整 shader + Material 资源链，超出本期 TS 重构范围",
            run: async () => {},
        },
    ];

    runner.registerAll(cases);
}
