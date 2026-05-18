/**
 * Animator 重构回归示例 — 程序化构造工厂
 *
 * 用代码而非资源文件搭建：
 *   - AnimatorController data（含参数 + 条件 transition）
 *   - AnimationClip（任意 KeyFrameValueType 的 KeyframeNode）
 *   - AnimationEvent 注入到现有 clip
 *
 * 覆盖现成资源无法测到的：E2-E6、F2、G7/G8/G10、I1 的辅助节点等。
 *
 * 所有反射访问都遵守"只 push、不重命名"原则——名字保持引擎现有 @internal 命名。
 */

import { AnimatorController } from "laya/d3/component/Animator/AnimatorController";
import { AnimatorControllerLayer } from "laya/d3/component/Animator/AnimatorControllerLayer";
import { AnimatorState } from "laya/d3/component/Animator/AnimatorState";
import { AnimatorTransition } from "laya/d3/component/Animator/AnimatorTransition";
import { AnimationClip } from "laya/d3/animation/AnimationClip";
import { AnimationEvent } from "laya/d3/animation/AnimationEvent";
import { KeyframeNode } from "laya/d3/animation/KeyframeNode";
import { KeyframeNodeList } from "laya/d3/animation/KeyframeNodeList";
import { KeyFrameValueType } from "laya/d3/component/Animator/KeyframeNodeOwner";
import {
    AnimatorStateBoolCondition,
    AnimatorStateNumberCondition,
    AnimatorStateTriggerCondition,
} from "laya/components/AnimatorStateCondition";
import {
    AniParmType,
    AniStateConditionNumberCompressType,
    TypeAnimatorControllerData,
} from "laya/components/AnimatorControllerParse";
import { FloatKeyframe } from "laya/maths/FloatKeyframe";
import { Vector3Keyframe } from "laya/maths/Vector3Keyframe";
import { Vector2Keyframe } from "laya/maths/Vector2Keyframe";
import { Vector4Keyframe } from "laya/maths/Vector4Keyframe";
import { QuaternionKeyframe } from "laya/maths/QuaternionKeyframe";
import { BooleanKeyframe } from "laya/maths/BooleanKeyframe";
import { Vector3 } from "laya/maths/Vector3";
import { Vector2 } from "laya/maths/Vector2";
import { Vector4 } from "laya/maths/Vector4";
import { Quaternion } from "laya/maths/Quaternion";

// ───────────────────────────────────────────────────────────
// Controller 构造
// ───────────────────────────────────────────────────────────

export interface ProgrammaticTransitionSpec {
    /** 目标 state 的 id（字符串数字 id） */
    toId: string;
    exitTime?: number;
    transduration?: number;
    transstartoffset?: number;
    exitByTime?: boolean;
    solo?: boolean;
    conditions?: Array<{ paramName: string; checkValue: number | boolean; numberCompare?: AniStateConditionNumberCompressType }>;
}

export interface ProgrammaticStateSpec {
    id: string;          // 形如 "0","1","2" — 业务 id（"-1" 进入、"-2" anyState、"-3" exit）
    name: string;
    clipUuid?: string;   // 关联的 clip uuid（由 Loader 暴露）— 若 undefined 表示进入/退出占位
    clipStart?: number;
    clipEnd?: number;
    speed?: number;
    soloTransitions?: ProgrammaticTransitionSpec[];
}

export interface ProgrammaticControllerSpec {
    layerName?: string;
    blendingMode?: number;   // 0 OVERRIDE, 1 ADDITIVE
    defaultWeight?: number;
    params?: Array<{ id: number; name: string; type: AniParmType; val: number | boolean }>;
    enterToId: string;       // 进入状态指向的目标 id
    states: ProgrammaticStateSpec[];
}

/**
 * 用 schema 构造一个 AnimatorController 实例，可直接 `animator.controller = ctrl` 挂载。
 * 注意：这里走 AnimatorControllerParse 的标准 JSON 路径，与 IDE 序列化资源一致。
 */
export function buildController(spec: ProgrammaticControllerSpec): AnimatorController {
    const layerStates: any[] = [
        { x: 10, y: 100, id: "-1", name: "进入", soloTransitions: [{ id: spec.enterToId }] },
        { x: 600, y: 100, id: "-2", name: "任何状态" },
    ];
    for (const s of spec.states) {
        layerStates.push({
            x: 200, y: 200,
            id: s.id,
            name: s.name,
            clip: s.clipUuid ? { _$uuid: s.clipUuid } : undefined,
            clipEnd: s.clipEnd ?? 1,
            speed: s.speed ?? 1,
            soloTransitions: (s.soloTransitions ?? []).map(t => ({
                id: t.toId,
                exitTime: t.exitTime,
                transduration: t.transduration,
                transstartoffset: t.transstartoffset,
                exitByTime: t.exitByTime,
                solo: t.solo,
                conditions: (t.conditions ?? []).map(c => ({
                    id: spec.params?.find(p => p.name === c.paramName)?.id,
                    name: c.paramName,
                    checkValue: c.checkValue,
                    type: c.numberCompare,
                })),
            })),
        });
    }

    const data: TypeAnimatorControllerData = {
        layerW: 150,
        controllerLayers: [{
            name: spec.layerName ?? "Base Layer",
            blendingMode: spec.blendingMode ?? 0,
            defaultWeight: spec.defaultWeight ?? 1,
            playOnWake: false,   // 测试主动 play，避免被默认播覆盖
            states: layerStates,
        }],
        animatorParams: spec.params,
    };

    return new AnimatorController(data);
}

// ───────────────────────────────────────────────────────────
// AnimationEvent 注入
// ───────────────────────────────────────────────────────────

/** 在给定 clip 的指定时间点插入一个 AnimationEvent。eventName = owner 上 component 的方法名。 */
export function injectAnimationEvent(clip: AnimationClip, time: number, eventName: string, params: any[] = []): AnimationEvent {
    const ev = new AnimationEvent();
    ev.time = time;
    ev.eventName = eventName;
    ev.params = params;
    const events: AnimationEvent[] = (clip as any)._animationEvents;
    events.push(ev);
    // 保持时间排序，引擎 _eventScript 假设有序
    events.sort((a, b) => a.time - b.time);
    return ev;
}

// ───────────────────────────────────────────────────────────
// AnimatorState 程序化构造（绕过 controller，直接拼 AnimatorState）
// ───────────────────────────────────────────────────────────

/** 给一个 AnimatorState 添加一条 transition（程序化创建，不通过 controller schema）。 */
export function addProgrammaticTransition(state: AnimatorState, spec: {
    destState: AnimatorState;
    exitTime?: number;
    transduration?: number;
    transstartoffset?: number;
    exitByTime?: boolean;
    solo?: boolean;
    isAndOperEnabled?: boolean;
    conditions?: Array<
        | { kind: "bool"; name: string; expect: boolean }
        | { kind: "number"; name: string; expect: number; compare: AniStateConditionNumberCompressType }
        | { kind: "trigger"; name: string }
    >;
}): AnimatorTransition {
    const t = new AnimatorTransition();
    t.destState = spec.destState;
    if (spec.exitTime !== undefined) t.exitTime = spec.exitTime;
    if (spec.transduration !== undefined) t.transduration = spec.transduration;
    if (spec.transstartoffset !== undefined) t.transstartoffset = spec.transstartoffset;
    if (spec.exitByTime !== undefined) t.exitByTime = spec.exitByTime;
    if (spec.isAndOperEnabled !== undefined) t.isAndOperEnabled = spec.isAndOperEnabled;
    for (const c of spec.conditions ?? []) {
        if (c.kind === "bool") {
            const bc = new AnimatorStateBoolCondition(c.name);
            bc.compareFlag = c.expect;
            t.addCondition(bc);
        } else if (c.kind === "number") {
            const nc = new AnimatorStateNumberCondition(c.name);
            nc.numberValue = c.expect;
            nc.compareFlag = c.compare;
            t.addCondition(nc);
        } else {
            t.addCondition(new AnimatorStateTriggerCondition(c.name));
        }
    }
    if (spec.solo) state.soloTransitions.unshift(t);
    else state.transitions.unshift(t);
    return t;
}

// ───────────────────────────────────────────────────────────
// AnimationClip 程序化构造（覆盖 G 组 KeyFrame 类型）
// ───────────────────────────────────────────────────────────

export interface ProgrammaticClipNodeSpec {
    /** 节点路径（owner path 链，最后一项空串表示挂在 root）— 通常 [""] 即 owner 自身 */
    ownerPath: string[];
    /** 属性路径（如 ["localPosition"] 或 ["someChild","customProp"]） */
    property: string[];
    /** propertyOwner —— "transform" 表示 owner.transform；为空表示直接 owner */
    propertyOwner?: string;
    type: KeyFrameValueType;
    /** 关键帧值列表（time → value），按 type 解释 */
    keyframes: Array<{ time: number; value: any }>;
}

export interface ProgrammaticClipSpec {
    duration: number;
    frameRate?: number;
    islooping?: boolean;
    nodes: ProgrammaticClipNodeSpec[];
}

/**
 * 构造一个 AnimationClip，KeyframeNode + KeyframeNodeList 全程序化挂载。
 *
 * 关键 @internal 字段保持原名：_duration / _frameRate / _nodes / _nodesDic / _nodesMap / _animationEvents。
 * KeyframeNode 通过 @internal 方法 _setOwnerPathByIndex / _setPropertyByIndex / _setKeyframeByIndex 设置。
 */
export function buildClip(spec: ProgrammaticClipSpec): AnimationClip {
    const clip = new AnimationClip();
    const anyClip = clip as any;
    anyClip._duration = spec.duration;
    anyClip._frameRate = spec.frameRate ?? 30;
    clip.islooping = spec.islooping ?? true;

    const nodeList = anyClip._nodes as KeyframeNodeList;
    nodeList.count = spec.nodes.length;
    anyClip._nodesDic = {} as Record<string, KeyframeNode>;
    anyClip._nodesMap = {} as Record<string, KeyframeNode[]>;

    for (let i = 0; i < spec.nodes.length; i++) {
        const ns = spec.nodes[i];
        const node = new KeyframeNode();
        const anyNode = node as any;

        // ownerPath
        node._setOwnerPathCount(ns.ownerPath.length);
        for (let k = 0; k < ns.ownerPath.length; k++) {
            node._setOwnerPathByIndex(k, ns.ownerPath[k]);
        }

        // property
        node._setPropertyCount(ns.property.length);
        for (let k = 0; k < ns.property.length; k++) {
            node._setPropertyByIndex(k, ns.property[k]);
        }

        anyNode.type = ns.type;
        anyNode.propertyOwner = ns.propertyOwner ?? "";
        anyNode._indexInList = i;

        // fullPath / nodePath：引擎 AnimationClipParser04 内部计算，这里手工拼
        const nodePath = node._joinOwnerPath("/");
        const propertyPath = node._joinProperty(".");
        anyNode.nodePath = nodePath;
        anyNode.fullPath = `${nodePath}#${ns.propertyOwner ?? ""}#${propertyPath}#${ns.type}`;

        // 构造 keyframes
        node._setKeyframeCount(ns.keyframes.length);
        for (let k = 0; k < ns.keyframes.length; k++) {
            const kf = ns.keyframes[k];
            const concrete = _makeKeyframeOf(ns.type, kf.time, kf.value);
            node._setKeyframeByIndex(k, concrete);
        }

        nodeList.setNodeByIndex(i, node);

        // index 维护
        anyClip._nodesDic[anyNode.fullPath] = node;
        if (!anyClip._nodesMap[nodePath]) anyClip._nodesMap[nodePath] = [];
        anyClip._nodesMap[nodePath].push(node);
    }

    return clip;
}

function _makeKeyframeOf(type: KeyFrameValueType, time: number, value: any) {
    switch (type) {
        case KeyFrameValueType.Float: {
            const k = new FloatKeyframe();
            k.time = time;
            k.value = value;
            k.inTangent = 0;
            k.outTangent = 0;
            return k;
        }
        case KeyFrameValueType.Boolean: {
            const k = new BooleanKeyframe();
            k.time = time;
            (k as any).value = value;
            return k;
        }
        case KeyFrameValueType.Position:
        case KeyFrameValueType.Scale:
        case KeyFrameValueType.RotationEuler:
        case KeyFrameValueType.Vector3: {
            const k = new Vector3Keyframe();
            k.time = time;
            (value as Vector3).cloneTo(k.value);
            (k.inTangent as Vector3).setValue(0, 0, 0);
            (k.outTangent as Vector3).setValue(0, 0, 0);
            return k;
        }
        case KeyFrameValueType.Vector2: {
            const k = new Vector2Keyframe();
            k.time = time;
            (value as Vector2).cloneTo(k.value);
            (k.inTangent as Vector2).setValue(0, 0);
            (k.outTangent as Vector2).setValue(0, 0);
            return k;
        }
        case KeyFrameValueType.Vector4:
        case KeyFrameValueType.Color: {
            const k = new Vector4Keyframe();
            k.time = time;
            (value as Vector4).cloneTo(k.value);
            (k.inTangent as Vector4).setValue(0, 0, 0, 0);
            (k.outTangent as Vector4).setValue(0, 0, 0, 0);
            return k;
        }
        case KeyFrameValueType.Rotation: {
            const k = new QuaternionKeyframe();
            k.time = time;
            (value as Quaternion).cloneTo(k.value);
            return k;
        }
        default:
            throw new Error(`buildClip: unsupported KeyFrameValueType ${type}`);
    }
}
