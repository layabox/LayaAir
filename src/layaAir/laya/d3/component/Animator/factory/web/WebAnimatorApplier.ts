import { AnimatorControllerLayer } from "../../AnimatorControllerLayer";
import { AnimatorState } from "../../AnimatorState";
import { KeyframeNodeOwner, KeyFrameValueType } from "../../KeyframeNodeOwner";
import { AnimationClip } from "../../../../animation/AnimationClip";
import { Material } from "../../../../../resource/Material";
import { Color } from "../../../../../maths/Color";
import { Quaternion } from "../../../../../maths/Quaternion";
import { Vector2 } from "../../../../../maths/Vector2";
import { Vector3 } from "../../../../../maths/Vector3";
import { Vector4 } from "../../../../../maths/Vector4";
import { Utils3D } from "../../../../utils/Utils3D";
import { isTransformType } from "../isTransformType";
import { LayerTask } from "../TaskSlot";

/** RT 路径下复用 Web applier 时，'non-transform-only' 跳过 Transform 类型让 Native 处理。 */
export type WebAnimatorApplierScope = 'all' | 'non-transform-only';

const _tempVector31: Vector3 = new Vector3();
const _tempColor: Color = new Color();
const _tempQuaternion1: Quaternion = new Quaternion();

/**
 * Animator 数据回写的 Web 实现（WebAnimatorFactory 内部 helper）。
 * factory 在 flushApply 时遍历 activeList，逐 layer 按 type 调对应 apply*。
 */
export class WebAnimatorApplier {

    _scope: WebAnimatorApplierScope = 'all';

    private _currentUpdateMark: number = 0;

    /**
     * clip → 非 Transform curve 的索引桶。scope='non-transform-only' 时让 _applyNormal /
     * revertDefaultKeyframeNodes 用桶替代「全表扫描 + 内层 isTransformType 判断」。
     * Clip 是只读资源，桶一次构建后稳定。'all' 路径不使用桶。
     */
    private _nonTransformIdxCache: WeakMap<AnimationClip, Int32Array> = new WeakMap();

    /** 取 clip 的非 Transform 索引桶，缺则按 clip._nodes 构建并缓存。 */
    private _getNonTransformIndices(clip: AnimationClip): Int32Array {
        let cached = this._nonTransformIdxCache.get(clip);
        if (cached) return cached;
        const nodes = (clip as any)._nodes;
        if (!nodes) {
            cached = new Int32Array(0);
        } else {
            const count = nodes.count;
            const tmp: number[] = [];
            for (let i = 0; i < count; i++) {
                if (!isTransformType(nodes.getNodeByIndex(i).type)) tmp.push(i);
            }
            cached = new Int32Array(tmp);
        }
        this._nonTransformIdxCache.set(clip, cached);
        return cached;
    }

    applyNormal(layerTask: LayerTask, controllerLayer: AnimatorControllerLayer, isFirstLayer: boolean, updateMark: number): void {
        this._applyNormal(controllerLayer, layerTask.state!, /*additive*/controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE, layerTask.weight, isFirstLayer, updateMark, this._scope === 'non-transform-only');
    }

    applyCross(layerTask: LayerTask, controllerLayer: AnimatorControllerLayer, isFirstLayer: boolean, updateMark: number): void {
        this._applyCross(controllerLayer, layerTask.state!, layerTask.destState!, layerTask.crossWeight, isFirstLayer, updateMark, this._scope === 'non-transform-only');
    }

    applyFixedCross(layerTask: LayerTask, controllerLayer: AnimatorControllerLayer, isFirstLayer: boolean, updateMark: number): void {
        this._applyFixedCross(controllerLayer, layerTask.destState!, layerTask.crossWeight, isFirstLayer, updateMark, this._scope === 'non-transform-only');
    }

    updateDefaultValues(owners: KeyframeNodeOwner[]): void {
        const skipTransform = this._scope === 'non-transform-only';
        for (let i = 0, n = owners.length; i < n; i++) {
            const nodeOwner = owners[i];
            if (!nodeOwner || !nodeOwner.propertyOwner || !nodeOwner.property) continue;
            if (skipTransform && isTransformType(nodeOwner.type)) continue;

            let pro = nodeOwner.propertyOwner;

            switch (nodeOwner.type) {
                case KeyFrameValueType.Float:
                case KeyFrameValueType.Boolean:
                    var proPat = nodeOwner.property;
                    var m = proPat.length - 1;
                    for (var j = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    if (pro && !nodeOwner.isMaterial) {
                        nodeOwner.defaultValue = pro[proPat[m]];
                    }
                    break;

                case KeyFrameValueType.Position:
                    if (pro.localPosition && nodeOwner.defaultValue) {
                        pro.localPosition.cloneTo(nodeOwner.defaultValue);
                    }
                    break;

                case KeyFrameValueType.Rotation:
                    if (pro.localRotation && nodeOwner.defaultValue) {
                        pro.localRotation.cloneTo(nodeOwner.defaultValue);
                    }
                    break;

                case KeyFrameValueType.Scale:
                    if (pro.localScale && nodeOwner.defaultValue) {
                        pro.localScale.cloneTo(nodeOwner.defaultValue);
                    }
                    break;

                case KeyFrameValueType.RotationEuler:
                    if (pro.localRotationEuler && nodeOwner.defaultValue) {
                        pro.localRotationEuler.cloneTo(nodeOwner.defaultValue);
                    }
                    break;

                case KeyFrameValueType.Vector2:
                case KeyFrameValueType.Vector3:
                case KeyFrameValueType.Vector4:
                case KeyFrameValueType.Color:
                    proPat = nodeOwner.property;
                    m = proPat.length - 1;
                    for (j = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    if (pro && !nodeOwner.isMaterial && nodeOwner.defaultValue) {
                        let value = pro[proPat[m]];
                        if (value && value.cloneTo) {
                            value.cloneTo(nodeOwner.defaultValue);
                        }
                    }
                    break;
            }
        }
    }

    revertDefaultKeyframeNodes(state: AnimatorState): void {
        const skipTransform = this._scope === 'non-transform-only';
        const nodeOwners: KeyframeNodeOwner[] = state._nodeOwners;
        const clip = state._clip;
        // skipTransform 且 clip 在 → 用桶；clip 缺失走原全量 + 内层 isTransformType 兜底
        const indices: Int32Array | null = (skipTransform && clip) ? this._getNonTransformIndices(clip) : null;
        const loopCount = indices !== null ? indices.length : nodeOwners.length;
        for (let k = 0; k < loopCount; k++) {
            const i = indices !== null ? indices[k] : k;
            const nodeOwner = nodeOwners[i];
            if (!nodeOwner) continue;
            if (skipTransform && indices === null && isTransformType(nodeOwner.type)) continue;
            let pro: any = nodeOwner.propertyOwner;
            let value: string;
            if (!pro) continue;
            switch (nodeOwner.type) {
                case KeyFrameValueType.PathPoint:
                    console.log("Animator:PathPoint not support2");
                    break;
                case KeyFrameValueType.Boolean:
                    console.log("Animator:Boolean not support2");
                    break;
                case KeyFrameValueType.Float:
                    var proPat: string[] = nodeOwner.property!;
                    var m: number = proPat.length - 1;
                    for (var j: number = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    let lastpro = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[lastpro] = nodeOwner.defaultValue);
                        if (nodeOwner.callbackFun) {
                            nodeOwner.animatorDataSetCallBack();
                        }
                    } else {
                        pro && (pro as Material).setFloat(lastpro, nodeOwner.defaultValue);
                    }
                    break;
                case KeyFrameValueType.Position:
                    var locPos: Vector3 = pro.localPosition;
                    var def: Vector3 = nodeOwner.defaultValue;
                    locPos.x = def.x;
                    locPos.y = def.y;
                    locPos.z = def.z;
                    pro.localPosition = locPos;
                    break;
                case KeyFrameValueType.Rotation:
                    var locRot: Quaternion = pro.localRotation;
                    var defQua: Quaternion = nodeOwner.defaultValue;
                    locRot.x = defQua.x;
                    locRot.y = defQua.y;
                    locRot.z = defQua.z;
                    locRot.w = defQua.w;
                    pro.localRotation = locRot;
                    break;
                case KeyFrameValueType.Scale:
                    var locSca: Vector3 = pro.localScale;
                    def = nodeOwner.defaultValue;
                    locSca.x = def.x;
                    locSca.y = def.y;
                    locSca.z = def.z;
                    pro.localScale = locSca;
                    break;
                case KeyFrameValueType.RotationEuler:
                    var locEul: Vector3 = pro.localRotationEuler;
                    def = nodeOwner.defaultValue;
                    locEul.x = def.x;
                    locEul.y = def.y;
                    locEul.z = def.z;
                    pro.localRotationEuler = locEul;
                    break;
                case KeyFrameValueType.Vector2:
                    proPat = nodeOwner.property!;
                    m = proPat.length - 1;
                    for (j = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    value = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[value] = nodeOwner.defaultValue);
                        if (nodeOwner.callbackFun) {
                            nodeOwner.animatorDataSetCallBack();
                        }
                    } else {
                        pro && pro.getVector2(value) && (pro as Material).setVector2(value, nodeOwner.defaultValue);
                    }
                    break;
                case KeyFrameValueType.Vector3:
                    proPat = nodeOwner.property!;
                    m = proPat.length - 1;
                    for (j = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    value = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[value] = nodeOwner.defaultValue);
                        if (nodeOwner.callbackFun) {
                            nodeOwner.animatorDataSetCallBack();
                        }
                    } else {
                        pro && pro.getVector3(value) && (pro as Material).setVector3(value, nodeOwner.defaultValue);
                    }
                    break;
                case KeyFrameValueType.Vector4:
                    proPat = nodeOwner.property!;
                    m = proPat.length - 1;
                    for (j = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    value = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[value] = nodeOwner.defaultValue);
                        if (nodeOwner.callbackFun) {
                            nodeOwner.animatorDataSetCallBack();
                        }
                    } else {
                        pro && pro.getVector3(value) && (pro as Material).setVector3(value, nodeOwner.defaultValue);
                    }
                    break;
                case KeyFrameValueType.Color:
                    proPat = nodeOwner.property!;
                    m = proPat.length - 1;
                    for (j = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    value = proPat[m];
                    if (!nodeOwner.defaultValue) break;
                    _tempColor.r = nodeOwner.defaultValue.x;
                    _tempColor.g = nodeOwner.defaultValue.y;
                    _tempColor.b = nodeOwner.defaultValue.z;
                    _tempColor.a = nodeOwner.defaultValue.w;
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[value] = _tempColor);
                        if (nodeOwner.callbackFun) {
                            nodeOwner.animatorDataSetCallBack();
                        }
                    } else {
                        pro && pro.getColor(value) && (pro as Material).setColor(value, _tempColor);
                    }
                    break;
                default:
                    throw "Animator:unknown type.";
            }
        }
    }

    private _applyNormal(
        controllerLayer: AnimatorControllerLayer,
        stateInfo: AnimatorState,
        additive: boolean,
        weight: number,
        isFirstLayer: boolean,
        updateMark: number,
        skipTransform: boolean
    ): void {
        this._currentUpdateMark = updateMark;
        const realtimeDatas = stateInfo._realtimeDatas;
        const clip = stateInfo._clip!;
        const nodes = clip._nodes!;
        const nodeOwners: KeyframeNodeOwner[] = stateInfo._nodeOwners;
        // skipTransform 走非 Transform 索引桶替代全表扫描；scope='all' 走原全量循环
        const indices: Int32Array | null = skipTransform ? this._getNonTransformIndices(clip) : null;
        const loopCount = indices !== null ? indices.length : nodes.count;
        for (let k = 0; k < loopCount; k++) {
            const i = indices !== null ? indices[k] : k;
            const nodeOwner: KeyframeNodeOwner = nodeOwners[i];
            if (!nodeOwner) continue;
            const node = nodes.getNodeByIndex(i);
            if (controllerLayer.avatarMask && (!controllerLayer.avatarMask.getTransformActive(node.nodePath))) continue;
            let pro: any = nodeOwner.propertyOwner;
            let value: string;
            if (!pro) continue;
            switch (nodeOwner.type) {
                case KeyFrameValueType.PathPoint:
                    const realData = realtimeDatas[i] as { pos: Vector3, rotation: Vector3 };
                    const pos = realData.pos;
                    const rotation = realData.rotation;
                    if (rotation) {
                        const ro = pro.transform.localRotationEuler;
                        ro.x = rotation.x;
                        ro.y = rotation.y;
                        ro.z = rotation.z;
                        pro.transform.localRotationEuler = ro;
                    }
                    const position = pro.transform.position;
                    position.x = pos.x;
                    position.y = pos.y;
                    position.z = pos.z;
                    pro.transform.position = position;
                    break;
                case KeyFrameValueType.Boolean: {
                    const proPat: string[] = nodeOwner.property!;
                    const m: number = proPat.length - 1;
                    for (let j: number = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    const lastBoolPro = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[lastBoolPro] = realtimeDatas[i])
                    }
                    break;
                }
                case KeyFrameValueType.Float: {
                    const proPat: string[] = nodeOwner.property!;
                    const m: number = proPat.length - 1;
                    for (let j: number = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    const lastpro = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[lastpro] = this._applyFloat(pro[lastpro], nodeOwner, additive, weight, isFirstLayer, <number>realtimeDatas[i]));
                        if (nodeOwner.callbackFun) {
                            nodeOwner.animatorDataSetCallBack();
                        }
                    } else {
                        pro && (pro as Material).setFloat(lastpro, this._applyFloat(0, nodeOwner, additive, weight, isFirstLayer, <number>realtimeDatas[i]));
                    }
                    break;
                }
                case KeyFrameValueType.Position: {
                    const localPos: Vector3 = pro.localPosition;
                    this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, <Vector3>realtimeDatas[i], localPos);
                    pro.localPosition = localPos;
                    break;
                }
                case KeyFrameValueType.Rotation: {
                    const localRot: Quaternion = pro.localRotation;
                    this._applyRotation(nodeOwner, additive, weight, isFirstLayer, <Quaternion>realtimeDatas[i], localRot);
                    pro.localRotation = localRot;
                    break;
                }
                case KeyFrameValueType.Scale: {
                    const localSca: Vector3 = pro.localScale;
                    this._applyScale(nodeOwner, additive, weight, isFirstLayer, <Vector3>realtimeDatas[i], localSca);
                    pro.localScale = localSca;
                    break;
                }
                case KeyFrameValueType.RotationEuler: {
                    const localEuler: Vector3 = pro.localRotationEuler;
                    this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, <Vector3>realtimeDatas[i], localEuler);
                    pro.localRotationEuler = localEuler;
                    break;
                }
                case KeyFrameValueType.Vector2: {
                    const proPat: string[] = nodeOwner.property!;
                    const m: number = proPat.length - 1;
                    for (let j: number = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    value = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[value] = this._applyVec2(pro[value], nodeOwner, additive, weight, isFirstLayer, <Vector2>realtimeDatas[i]));
                        if (nodeOwner.callbackFun) {
                            nodeOwner.animatorDataSetCallBack();
                        }
                    } else {
                        pro && pro.getVector2(value) && (pro as Material).setVector2(value, this._applyVec2(pro.getVector2(value), nodeOwner, additive, weight, isFirstLayer, <Vector2>realtimeDatas[i]));
                    }
                    break;
                }
                case KeyFrameValueType.Vector3: {
                    const proPat: string[] = nodeOwner.property!;
                    const m: number = proPat.length - 1;
                    for (let j: number = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    value = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[value] = this._applyVec3(pro[value], nodeOwner, additive, weight, isFirstLayer, <Vector3>realtimeDatas[i]));
                        if (nodeOwner.callbackFun) {
                            nodeOwner.animatorDataSetCallBack();
                        }
                    } else {
                        pro && pro.getVector3(value) && (pro as Material).setVector3(value, this._applyVec3(pro.getVector3(value), nodeOwner, additive, weight, isFirstLayer, <Vector3>realtimeDatas[i]));
                    }
                    break;
                }
                case KeyFrameValueType.Vector4: {
                    const proPat: string[] = nodeOwner.property!;
                    const m: number = proPat.length - 1;
                    for (let j: number = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    value = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[value] = this._applyVec4(pro[value], nodeOwner, additive, weight, isFirstLayer, <Vector4>realtimeDatas[i]));
                        if (nodeOwner.callbackFun) {
                            nodeOwner.animatorDataSetCallBack();
                        }
                    } else {
                        pro && pro.getVector4(value) && (pro as Material).setVector4(value, this._applyVec4(pro.getVector4(value), nodeOwner, additive, weight, isFirstLayer, <Vector4>realtimeDatas[i]));
                    }
                    break;
                }
                case KeyFrameValueType.Color: {
                    const proPat: string[] = nodeOwner.property!;
                    const m: number = proPat.length - 1;
                    for (let j: number = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    value = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[value] = this._applyColor(pro[value], nodeOwner, additive, weight, isFirstLayer, <Vector4>realtimeDatas[i]));
                        if (nodeOwner.callbackFun) {
                            nodeOwner.animatorDataSetCallBack();
                        }
                    } else {
                        const color = pro.getColor(value);
                        if (pro && color) {
                            _tempColor.r = color.r;
                            _tempColor.g = color.g;
                            _tempColor.b = color.b;
                            _tempColor.a = color.a;
                            (pro as Material).setColor(value, this._applyColor(_tempColor, nodeOwner, additive, weight, isFirstLayer, <Vector4>realtimeDatas[i]));
                        }
                    }
                    break;
                }
            }
            nodeOwner.updateMark = this._currentUpdateMark;
        }
    }

    private _applyCross(
        controllerLayer: AnimatorControllerLayer,
        srcState: AnimatorState,
        destState: AnimatorState,
        crossWeight: number,
        isFirstLayer: boolean,
        updateMark: number,
        skipTransform: boolean
    ): void {
        this._currentUpdateMark = updateMark;
        const nodeOwners: KeyframeNodeOwner[] = controllerLayer._crossNodesOwners;
        const ownerCount: number = controllerLayer._crossNodesOwnersCount;
        const additive: boolean = controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
        const weight: number = controllerLayer.defaultWeight;

        const destRealtimeDatas = destState._realtimeDatas;
        const destDataIndices: number[] = controllerLayer._destCrossClipNodeIndices;
        const destNodeOwners: KeyframeNodeOwner[] = destState._nodeOwners;
        const srcRealtimeDatas = srcState._realtimeDatas;
        const srcDataIndices: number[] = controllerLayer._srcCrossClipNodeIndices;
        const srcNodeOwners: KeyframeNodeOwner[] = srcState._nodeOwners;

        for (let i: number = 0; i < ownerCount; i++) {
            const nodeOwner: KeyframeNodeOwner = nodeOwners[i];
            if (!nodeOwner) continue;
            if (skipTransform && isTransformType(nodeOwner.type)) continue;
            const srcIndex: number = srcDataIndices[i];
            const destIndex: number = destDataIndices[i];
            if (-1 == srcIndex && -1 == destIndex) continue;
            let srcValue: any = srcIndex !== -1 ? srcRealtimeDatas[srcIndex] : destNodeOwners[destIndex].defaultValue;
            if (null == srcValue) continue;
            let desValue: any = destIndex !== -1 ? destRealtimeDatas[destIndex] : srcNodeOwners[srcIndex].defaultValue;
            if (!desValue) {
                desValue = srcNodeOwners[srcIndex].defaultValue;
            }
            if (null == desValue) continue;
            if (!controllerLayer.avatarMask || controllerLayer.avatarMask.getTransformActive(nodeOwner.nodePath)) {
                this._applyCrossData(nodeOwner, additive, weight, isFirstLayer, srcValue, desValue, crossWeight);
            }
        }
    }

    private _applyFixedCross(
        controllerLayer: AnimatorControllerLayer,
        destState: AnimatorState,
        crossWeight: number,
        isFirstLayer: boolean,
        updateMark: number,
        skipTransform: boolean
    ): void {
        this._currentUpdateMark = updateMark;
        const nodeOwners: KeyframeNodeOwner[] = controllerLayer._crossNodesOwners;
        const ownerCount: number = controllerLayer._crossNodesOwnersCount;
        const additive: boolean = controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
        const weight: number = controllerLayer.defaultWeight;
        const destRealtimeDatas = destState._realtimeDatas;
        const destDataIndices: number[] = controllerLayer._destCrossClipNodeIndices;

        for (let i: number = 0; i < ownerCount; i++) {
            const nodeOwner: KeyframeNodeOwner = nodeOwners[i];
            if (!nodeOwner) continue;
            if (skipTransform && isTransformType(nodeOwner.type)) continue;
            const destIndex: number = destDataIndices[i];
            const srcValue: any = nodeOwner.crossFixedValue;
            let desValue;
            if (destIndex == -1 || !destRealtimeDatas[destIndex]) {
                desValue = nodeOwner.defaultValue;
            } else {
                desValue = destRealtimeDatas[destIndex];
            }
            this._applyCrossData(nodeOwner, additive, weight, isFirstLayer, srcValue, desValue, crossWeight);
        }
    }

    private _applyFloat(defaultValue: number, nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, data: number): number {
        if (nodeOwner.updateMark === this._currentUpdateMark) {
            if (additive) {
                defaultValue += weight * data;
            } else {
                var oriValue: number = defaultValue;
                defaultValue = oriValue + weight * (data - oriValue);
            }
        } else {
            if (isFirstLayer) {
                if (additive)
                    defaultValue = nodeOwner.defaultValue + data;
                else
                    defaultValue = data;
            } else {
                if (additive) {
                    defaultValue = nodeOwner.defaultValue + weight * (data);
                } else {
                    var defValue: number = nodeOwner.defaultValue;
                    defaultValue = defValue + weight * (data - defValue);
                }
            }
        }
        return defaultValue;
    }

    private _applyVec2(defaultValue: Vector2, nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, data: Vector2): Vector2 {
        if (!defaultValue) return null;

        if (nodeOwner.updateMark === this._currentUpdateMark) {
            if (additive) {
                defaultValue.x += weight * data.x;
                defaultValue.y += weight * data.y;
            } else {
                var oriValue = defaultValue;
                defaultValue.x = oriValue.x + weight * (data.x - oriValue.x);
                defaultValue.y = oriValue.y + weight * (data.y - oriValue.y);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    defaultValue.x = nodeOwner.defaultValue.x + data.x;
                    defaultValue.y = nodeOwner.defaultValue.y + data.y;
                }
                else
                    data.cloneTo(defaultValue);
            } else {
                if (additive) {
                    defaultValue.x = nodeOwner.defaultValue.x + weight * (data.x);
                    defaultValue.y = nodeOwner.defaultValue.y + weight * (data.y);
                } else {
                    var defValue: Vector2 = nodeOwner.defaultValue;
                    defaultValue.x = defValue.x + weight * (data.x - defValue.x);
                    defaultValue.y = defValue.y + weight * (data.y - defValue.y);
                }
            }
        }
        return defaultValue;
    }

    private _applyVec3(defaultValue: Vector3, nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, data: Vector3) {
        if (!defaultValue) return null;
        if (nodeOwner.updateMark === this._currentUpdateMark) {
            if (additive) {
                defaultValue.x += weight * data.x;
                defaultValue.y += weight * data.y;
                defaultValue.z += weight * data.z;
            } else {
                var oriValue = defaultValue;
                defaultValue.x = oriValue.x + weight * (data.x - oriValue.x);
                defaultValue.y = oriValue.y + weight * (data.y - oriValue.y);
                defaultValue.z = oriValue.z + weight * (data.z - oriValue.z);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    defaultValue.x = nodeOwner.defaultValue.x + data.x;
                    defaultValue.y = nodeOwner.defaultValue.y + data.y;
                    defaultValue.z = nodeOwner.defaultValue.z + data.z;
                }
                else
                    data.cloneTo(defaultValue);
            } else {
                if (additive) {
                    defaultValue.x = nodeOwner.defaultValue.x + weight * (data.x);
                    defaultValue.y = nodeOwner.defaultValue.y + weight * (data.y);
                    defaultValue.z = nodeOwner.defaultValue.z + weight * (data.z);
                } else {
                    var defValue: Vector3 = nodeOwner.defaultValue;
                    defaultValue.x = defValue.x + weight * (data.x - defValue.x);
                    defaultValue.y = defValue.y + weight * (data.y - defValue.y);
                    defaultValue.z = defValue.z + weight * (data.z - defValue.z);
                }
            }
        }
        return defaultValue;
    }

    private _applyVec4(defaultValue: Vector4, nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, data: Vector4) {
        if (!defaultValue) return null;
        if (nodeOwner.updateMark === this._currentUpdateMark) {
            if (additive) {
                defaultValue.x += weight * data.x;
                defaultValue.y += weight * data.y;
                defaultValue.z += weight * data.z;
                defaultValue.w += weight * data.w;
            } else {
                var oriValue = defaultValue;
                defaultValue.x = oriValue.x + weight * (data.x - oriValue.x);
                defaultValue.y = oriValue.y + weight * (data.y - oriValue.y);
                defaultValue.z = oriValue.z + weight * (data.z - oriValue.z);
                defaultValue.w = oriValue.w + weight * (data.w - oriValue.w);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    defaultValue.x = nodeOwner.defaultValue.x + data.x;
                    defaultValue.y = nodeOwner.defaultValue.y + data.y;
                    defaultValue.z = nodeOwner.defaultValue.z + data.z;
                    defaultValue.w = nodeOwner.defaultValue.w + data.w;
                }
                else
                    data.cloneTo(defaultValue);
            } else {
                if (additive) {
                    defaultValue.x = nodeOwner.defaultValue.x + weight * (data.x);
                    defaultValue.y = nodeOwner.defaultValue.y + weight * (data.y);
                    defaultValue.z = nodeOwner.defaultValue.z + weight * (data.z);
                    defaultValue.w = nodeOwner.defaultValue.w + weight * (data.w);
                } else {
                    var defValue: Vector4 = nodeOwner.defaultValue;
                    defaultValue.x = defValue.x + weight * (data.x - defValue.x);
                    defaultValue.y = defValue.y + weight * (data.y - defValue.y);
                    defaultValue.z = defValue.z + weight * (data.z - defValue.z);
                    defaultValue.w = defValue.w + weight * (data.w - defValue.w);
                }
            }
        }
        return defaultValue;
    }

    private _applyColor(defaultValue: Color, nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, data: Vector4) {
        if (!defaultValue) return null;
        if (!nodeOwner.defaultValue) nodeOwner.defaultValue = new Vector4(defaultValue.r, defaultValue.g, defaultValue.b, defaultValue.a);
        if (nodeOwner.updateMark === this._currentUpdateMark) {
            if (additive) {
                defaultValue.r += weight * data.x;
                defaultValue.g += weight * data.y;
                defaultValue.b += weight * data.z;
                defaultValue.a += weight * data.w;
            } else {
                var oriValue = defaultValue;
                defaultValue.r = oriValue.r + weight * (data.x - oriValue.r);
                defaultValue.g = oriValue.g + weight * (data.y - oriValue.g);
                defaultValue.b = oriValue.b + weight * (data.z - oriValue.b);
                defaultValue.a = oriValue.a + weight * (data.w - oriValue.a);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    defaultValue.r = nodeOwner.defaultValue.x + data.x;
                    defaultValue.g = nodeOwner.defaultValue.y + data.y;
                    defaultValue.b = nodeOwner.defaultValue.z + data.z;
                    defaultValue.a = nodeOwner.defaultValue.w + data.w;
                }
                else {
                    defaultValue.setValue(data.x, data.y, data.z, data.w);
                }
            } else {
                if (additive) {
                    defaultValue.r = nodeOwner.defaultValue.x + weight * (data.x);
                    defaultValue.g = nodeOwner.defaultValue.y + weight * (data.y);
                    defaultValue.b = nodeOwner.defaultValue.z + weight * (data.z);
                    defaultValue.a = nodeOwner.defaultValue.w + weight * (data.w);
                } else {
                    var defValue: Vector4 = nodeOwner.defaultValue;
                    defaultValue.r = defValue.x + weight * (data.x - defValue.x);
                    defaultValue.g = defValue.y + weight * (data.y - defValue.y);
                    defaultValue.b = defValue.z + weight * (data.z - defValue.z);
                    defaultValue.a = defValue.w + weight * (data.w - defValue.w);
                }
            }
        }
        return defaultValue;
    }

    private _applyPositionAndRotationEuler(nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, data: Vector3, out: Vector3): void {
        if (nodeOwner.updateMark === this._currentUpdateMark) {
            if (additive) {
                out.x += weight * data.x;
                out.y += weight * data.y;
                out.z += weight * data.z;
            } else {
                var oriX: number = out.x;
                var oriY: number = out.y;
                var oriZ: number = out.z;
                out.x = oriX + weight * (data.x - oriX);
                out.y = oriY + weight * (data.y - oriY);
                out.z = oriZ + weight * (data.z - oriZ);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    var defValue: Vector3 = nodeOwner.defaultValue;
                    out.x = defValue.x + data.x;
                    out.y = defValue.y + data.y;
                    out.z = defValue.z + data.z;
                } else {
                    out.x = data.x;
                    out.y = data.y;
                    out.z = data.z;
                }
            } else {
                defValue = nodeOwner.defaultValue;
                if (additive) {
                    out.x = defValue.x + weight * data.x;
                    out.y = defValue.y + weight * data.y;
                    out.z = defValue.z + weight * data.z;
                } else {
                    var defX: number = defValue.x;
                    var defY: number = defValue.y;
                    var defZ: number = defValue.z;
                    out.x = defX + weight * (data.x - defX);
                    out.y = defY + weight * (data.y - defY);
                    out.z = defZ + weight * (data.z - defZ);
                }
            }
        }
    }

    private _applyRotation(nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, clipRot: Quaternion, localRotation: Quaternion): void {
        if (nodeOwner.updateMark === this._currentUpdateMark) {
            if (additive) {
                Utils3D.quaternionWeight(clipRot, weight, _tempQuaternion1);
                _tempQuaternion1.normalize(_tempQuaternion1);
                Quaternion.multiply(localRotation, _tempQuaternion1, localRotation);
            } else {
                Quaternion.lerp(localRotation, clipRot, weight, localRotation);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    var defaultRot: Quaternion = nodeOwner.defaultValue;
                    Quaternion.multiply(defaultRot, clipRot, localRotation);
                } else {
                    localRotation.x = clipRot.x;
                    localRotation.y = clipRot.y;
                    localRotation.z = clipRot.z;
                    localRotation.w = clipRot.w;
                }
            } else {
                defaultRot = nodeOwner.defaultValue;
                if (additive) {
                    Utils3D.quaternionWeight(clipRot, weight, _tempQuaternion1);
                    _tempQuaternion1.normalize(_tempQuaternion1);
                    Quaternion.multiply(defaultRot, _tempQuaternion1, localRotation);
                } else {
                    Quaternion.lerp(defaultRot, clipRot, weight, localRotation);
                }
            }
        }
    }

    private _applyScale(nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, clipSca: Vector3, localScale: Vector3): void {
        if (nodeOwner.updateMark === this._currentUpdateMark) {
            if (additive) {
                Utils3D.scaleWeight(clipSca, weight, _tempVector31);
                localScale.x = localScale.x * _tempVector31.x;
                localScale.y = localScale.y * _tempVector31.y;
                localScale.z = localScale.z * _tempVector31.z;
            } else {
                Utils3D.scaleBlend(localScale, clipSca, weight, localScale);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    var defaultSca: Vector3 = nodeOwner.defaultValue;
                    localScale.x = defaultSca.x * clipSca.x;
                    localScale.y = defaultSca.y * clipSca.y;
                    localScale.z = defaultSca.z * clipSca.z;
                } else {
                    localScale.x = clipSca.x;
                    localScale.y = clipSca.y;
                    localScale.z = clipSca.z;
                }
            } else {
                defaultSca = nodeOwner.defaultValue;
                if (additive) {
                    Utils3D.scaleWeight(clipSca, weight, _tempVector31);
                    localScale.x = defaultSca.x * _tempVector31.x;
                    localScale.y = defaultSca.y * _tempVector31.y;
                    localScale.z = defaultSca.z * _tempVector31.z;
                } else {
                    Utils3D.scaleBlend(defaultSca, clipSca, weight, localScale);
                }
            }
        }
    }

    private _applyCrossData(nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, srcValue: any, desValue: any, crossWeight: number): void {
        var pro: any = nodeOwner.propertyOwner;
        let lastpro;
        if (pro) {
            switch (nodeOwner.type) {
                case KeyFrameValueType.PathPoint:
                    console.log("Animator:PathPoint not support3");
                    break;
                case KeyFrameValueType.Boolean:
                    console.log("Animator:Boolean not support3");
                    break;
                case KeyFrameValueType.Float:
                    var proPat: string[] = nodeOwner.property!;
                    var m: number = proPat.length - 1;
                    for (var j: number = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }

                    var crossValue: number = srcValue + crossWeight * (desValue - srcValue);
                    nodeOwner.value = crossValue;
                    lastpro = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[lastpro] = this._applyFloat(pro[lastpro], nodeOwner, additive, weight, isFirstLayer, crossValue));
                    } else {
                        pro && (pro as Material).setFloat(lastpro, this._applyFloat((pro as Material).getFloat(lastpro), nodeOwner, additive, weight, isFirstLayer, crossValue));
                    }
                    if (nodeOwner.callbackFun) {
                        nodeOwner.animatorDataSetCallBack();
                    }
                    break;
                case KeyFrameValueType.Position:
                    var localPos: Vector3 = pro.localPosition;
                    var position: Vector3 = nodeOwner.value;
                    var srcX: number = srcValue.x, srcY: number = srcValue.y, srcZ: number = srcValue.z;
                    position.x = srcX + crossWeight * (desValue.x - srcX);
                    position.y = srcY + crossWeight * (desValue.y - srcY);
                    position.z = srcZ + crossWeight * (desValue.z - srcZ);
                    this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, position, localPos);
                    pro.localPosition = localPos;
                    break;
                case KeyFrameValueType.Rotation:
                    var localRot: Quaternion = pro.localRotation;
                    var rotation: Quaternion = nodeOwner.value;
                    Quaternion.lerp(srcValue, desValue, crossWeight, rotation);
                    this._applyRotation(nodeOwner, additive, weight, isFirstLayer, rotation, localRot);
                    pro.localRotation = localRot;
                    break;
                case KeyFrameValueType.Scale:
                    var localSca: Vector3 = pro.localScale;
                    var scale: Vector3 = nodeOwner.value;
                    Utils3D.scaleBlend(srcValue, desValue, crossWeight, scale);
                    this._applyScale(nodeOwner, additive, weight, isFirstLayer, scale, localSca);
                    pro.localScale = localSca;
                    break;
                case KeyFrameValueType.RotationEuler:
                    var localEuler: Vector3 = pro.localRotationEuler;
                    var rotationEuler: Vector3 = nodeOwner.value;
                    srcX = srcValue.x, srcY = srcValue.y, srcZ = srcValue.z;
                    rotationEuler.x = srcX + crossWeight * (desValue.x - srcX);
                    rotationEuler.y = srcY + crossWeight * (desValue.y - srcY);
                    rotationEuler.z = srcZ + crossWeight * (desValue.z - srcZ);
                    this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, rotationEuler, localEuler);
                    pro.localRotationEuler = localEuler;
                    break;
                case KeyFrameValueType.Color:
                    proPat = nodeOwner.property!;
                    m = proPat.length - 1;
                    for (j = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    let v44 = nodeOwner.value as Vector4;
                    v44.x = srcValue.x + crossWeight * (desValue.x - srcValue.x);
                    v44.y = srcValue.y + crossWeight * (desValue.y - srcValue.y);
                    v44.z = srcValue.z + crossWeight * (desValue.z - srcValue.z);
                    v44.w = srcValue.w + crossWeight * (desValue.w - srcValue.w);
                    nodeOwner.value = v44;
                    lastpro = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[lastpro] = this._applyColor(pro[lastpro], nodeOwner, additive, weight, isFirstLayer, v44));
                    } else {
                        pro && (pro as Material).setColor(lastpro, this._applyColor((pro as Material).getColor(lastpro), nodeOwner, additive, weight, isFirstLayer, v44));
                    }
                    if (nodeOwner.callbackFun) {
                        nodeOwner.animatorDataSetCallBack();
                    }
                    break;
                case KeyFrameValueType.Vector2:
                    proPat = nodeOwner.property!;
                    m = proPat.length - 1;
                    for (j = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    let v2 = nodeOwner.value as Vector2;
                    v2.x = srcValue.x + crossWeight * (desValue.x - srcValue.x);
                    v2.y = srcValue.y + crossWeight * (desValue.y - srcValue.y);
                    nodeOwner.value = v2;
                    lastpro = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[lastpro] = this._applyVec2(pro[lastpro], nodeOwner, additive, weight, isFirstLayer, v2));
                    } else {
                        pro && (pro as Material).setVector2(lastpro, this._applyVec2((pro as Material).getVector2(lastpro), nodeOwner, additive, weight, isFirstLayer, v2));
                    }
                    if (nodeOwner.callbackFun) {
                        nodeOwner.animatorDataSetCallBack();
                    }
                    break;
                case KeyFrameValueType.Vector4:
                    proPat = nodeOwner.property!;
                    m = proPat.length - 1;
                    for (j = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    let v4 = nodeOwner.value as Vector4;
                    v4.x = srcValue.x + crossWeight * (desValue.x - srcValue.x);
                    v4.y = srcValue.y + crossWeight * (desValue.y - srcValue.y);
                    v4.z = srcValue.z + crossWeight * (desValue.z - srcValue.z);
                    v4.w = srcValue.w + crossWeight * (desValue.w - srcValue.w);
                    nodeOwner.value = v4;
                    lastpro = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[lastpro] = this._applyVec4(pro[lastpro], nodeOwner, additive, weight, isFirstLayer, v4));
                    } else {
                        pro && (pro as Material).setVector4(lastpro, this._applyVec4((pro as Material).getVector4(lastpro), nodeOwner, additive, weight, isFirstLayer, v4));
                    }
                    if (nodeOwner.callbackFun) {
                        nodeOwner.animatorDataSetCallBack();
                    }
                    break;
                case KeyFrameValueType.Vector3:
                    proPat = nodeOwner.property!;
                    m = proPat.length - 1;
                    for (j = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) break;
                    }
                    let v3 = nodeOwner.value as Vector3;
                    v3.x = srcValue.x + crossWeight * (desValue.x - srcValue.x);
                    v3.y = srcValue.y + crossWeight * (desValue.y - srcValue.y);
                    v3.z = srcValue.z + crossWeight * (desValue.z - srcValue.z);
                    nodeOwner.value = v3;
                    lastpro = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[lastpro] = this._applyVec3(pro[lastpro], nodeOwner, additive, weight, isFirstLayer, v3));
                    } else {
                        pro && (pro as Material).setVector3(lastpro, this._applyVec3((pro as Material).getVector3(lastpro), nodeOwner, additive, weight, isFirstLayer, v3));
                    }
                    if (nodeOwner.callbackFun) {
                        nodeOwner.animatorDataSetCallBack();
                    }
                    break;
            }
            nodeOwner.updateMark = this._currentUpdateMark;
        }
    }
}
