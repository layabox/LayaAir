import { AnimatorBindContext } from "../AnimatorBindContext";
import { AnimatorState } from "../../AnimatorState";
import { AnimatorResource } from "../../AnimatorResource";
import { KeyframeNode } from "../../../../animation/KeyframeNode";
import { KeyframeNodeOwner, KeyFrameValueType } from "../../KeyframeNodeOwner";
import { AnimationClip } from "../../../../animation/AnimationClip";
import { Material } from "../../../../../resource/Material";
import { Sprite3D } from "../../../../core/Sprite3D";
import { Vector4 } from "../../../../../maths/Vector4";

/**
 * Animator 数据准备的 Web 实现，全部为 module-level 无状态函数。
 * 所有入口接受 AnimatorBindContext 作窄上下文，不依赖 Animator 本体；ownerMap / ownerList 共享在 ctx 里。
 */

/**
 * 增量绑定一个 KeyframeNodeOwner 到 ctx。
 * 步骤：
 *   1) 命中 ownerMap[fullPath] → refCount++ 复用；
 *   2) 否则沿 node.property 链解析到目标对象（Material 分支走 shaderData getX）；
 *   3) 新建 KeyframeNodeOwner，填字段、按 type 分配 defaultValue/value/crossFixedValue；
 *   4) 写入 ownerMap、ownerList、clipOwners[nodeIndex]。
 */
export function addKeyframeNodeOwner(
    ctx: AnimatorBindContext,
    clipOwners: KeyframeNodeOwner[],
    node: KeyframeNode,
    propertyOwner: any
): void {
    const nodeIndex = node._indexInList;
    const fullPath = node.fullPath;
    const ownerMap = ctx.ownerMap;
    const ownerList = ctx.owners;
    let keyframeNodeOwner = ownerMap[fullPath];
    let mat = false;
    if (keyframeNodeOwner) {
        keyframeNodeOwner.referenceCount++;
        clipOwners[nodeIndex] = keyframeNodeOwner;
        return;
    }

    let property: any = propertyOwner;
    for (let i = 0, n = node.propertyCount; i < n; i++) {
        if (mat) {
            const shaderPropId = node.getMaterialPropertyId(i);
            switch (node.type) {
                case KeyFrameValueType.Color:
                    const color = property.shaderData.getColor(shaderPropId);
                    property = new Vector4(color.r, color.g, color.b, color.a);
                    break;
                case KeyFrameValueType.Vector2:
                    property = property.shaderData.getVector2(shaderPropId);
                    break;
                case KeyFrameValueType.Vector3:
                    property = property.shaderData.getVector3(shaderPropId);
                    break;
                case KeyFrameValueType.Vector4:
                    property = property.shaderData.getVector(shaderPropId);
                    break;
                case KeyFrameValueType.Float:
                    property = property.shaderData.getNumber(shaderPropId);
                    break;
                case KeyFrameValueType.Boolean:
                    property = property.shaderData.getBool(shaderPropId);
                    break;
            }
        } else {
            property = property[node.getPropertyByIndex(i)];
        }
        if (property instanceof Material) mat = true;
        if (!property) break;
    }

    keyframeNodeOwner = ownerMap[fullPath] = new KeyframeNodeOwner();
    keyframeNodeOwner.isMaterial = mat;
    keyframeNodeOwner.fullPath = fullPath;
    keyframeNodeOwner.indexInList = ownerList.length;
    keyframeNodeOwner.referenceCount = 1;
    keyframeNodeOwner.propertyOwner = propertyOwner;
    keyframeNodeOwner.nodePath = node.nodePath;
    keyframeNodeOwner.callbackFunData = node.callbackFunData;
    keyframeNodeOwner.callParams = node.callParams;
    keyframeNodeOwner.getCallbackNode();
    const propertyCount = node.propertyCount;
    const propertys: string[] = [];
    for (let i = 0; i < propertyCount; i++) propertys[i] = node.getPropertyByIndex(i);
    keyframeNodeOwner.property = propertys;
    keyframeNodeOwner.type = node.type;

    if (property) {
        if (node.type === KeyFrameValueType.Float || node.type === KeyFrameValueType.Boolean || node.type === KeyFrameValueType.PathPoint) {
            keyframeNodeOwner.defaultValue = property;
        } else {
            const defaultValue = new property.constructor();
            property.cloneTo(defaultValue);
            keyframeNodeOwner.defaultValue = defaultValue;
            keyframeNodeOwner.value = new property.constructor();
            keyframeNodeOwner.crossFixedValue = new property.constructor();
        }
    }

    ownerList.push(keyframeNodeOwner);
    clipOwners[nodeIndex] = keyframeNodeOwner;
}

/** decRef 一个 owner；refCount==0 时从 ownerMap/ownerList 删除，并把 nodeOwners[node._indexInList] 置 null。 */
export function removeKeyframeNodeOwner(
    ctx: AnimatorBindContext,
    nodeOwners: (KeyframeNodeOwner | null)[],
    node: KeyframeNode
): void {
    const fullPath = node.fullPath;
    const ownerMap = ctx.ownerMap;
    const ownerList = ctx.owners;
    const keyframeNodeOwner = ownerMap[fullPath];
    if (!keyframeNodeOwner) return;
    keyframeNodeOwner.referenceCount--;
    if (keyframeNodeOwner.referenceCount === 0) {
        delete ownerMap[fullPath];
        ownerList.splice(ownerList.indexOf(keyframeNodeOwner), 1);
    }
    nodeOwners[node._indexInList] = null;
}

/**
 * 解析 state._clip 的每条曲线到 state._nodeOwners。
 * 步骤：
 *   1) 把 state._nodeOwners 长度设为 frameNodes.count；
 *   2) 逐 node：沿 nodePath 在 sprite 树里 getChild 定位 propertyOwner；
 *   3) 若 node.propertyOwner（指定属性名）非空，再读一层；缺失则回退 AnimatorResource 注册表；
 *   4) 调 addKeyframeNodeOwner 建/复用 owner。
 */
export function prepareStateOwners(ctx: AnimatorBindContext, clipStateInfo: AnimatorState): void {
    if (!clipStateInfo._clip) return;

    const frameNodes = clipStateInfo._clip._nodes!;
    const frameNodesCount = frameNodes.count;
    const nodeOwners: KeyframeNodeOwner[] = clipStateInfo._nodeOwners;
    nodeOwners.length = frameNodesCount;
    for (let i = 0; i < frameNodesCount; i++) {
        const node: KeyframeNode = frameNodes.getNodeByIndex(i);
        let property: any = ctx.sprite;
        for (let j = 0, m = node.ownerPathCount; j < m; j++) {
            const ownPat: string = node.getOwnerPathByIndex(j);
            if (ownPat === "") break;
            property = property.getChild(ownPat);
            if (!property) break;
        }

        if (property) {
            const propertyOwner: string = node.propertyOwner;
            const oriProperty = property;
            (propertyOwner) && (property = property[propertyOwner]);
            if (!property) {
                property = AnimatorResource.getAnimatorResource(oriProperty, propertyOwner);
            }
            property && addKeyframeNodeOwner(ctx, nodeOwners, node, property);
        }
    }
}

/**
 * Sprite link/unlink 时，刷新所有 layer 上该 path 对应的 nodeOwner。
 * 步骤：遍历每个 enable 的 controllerLayer 的所有 state，在其 clip._nodesMap 里查 path 对应的
 * KeyframeNode 集合，逐个 add/removeKeyframeNodeOwner。
 */
export function handleSpriteOwnersBySprite(
    ctx: AnimatorBindContext,
    isLink: boolean,
    path: string[],
    sprite: Sprite3D
): void {
    const controllerLayers = ctx.layers;
    const nodePath: string = path.join("/");
    for (let i = 0, n = controllerLayers.length; i < n; i++) {
        if (!controllerLayers[i].enable) continue;
        const clipStateInfos: AnimatorState[] = controllerLayers[i]._states;
        for (let j = 0, m = clipStateInfos.length; j < m; j++) {
            const clip: AnimationClip = clipStateInfos[j]._clip!;
            const ownersNodes: KeyframeNode[] = clip._nodesMap[nodePath];
            if (!ownersNodes) continue;
            const nodeOwners: KeyframeNodeOwner[] = clipStateInfos[j]._nodeOwners;
            for (let k = 0, p = ownersNodes.length; k < p; k++) {
                if (isLink) addKeyframeNodeOwner(ctx, nodeOwners, ownersNodes[k], sprite);
                else removeKeyframeNodeOwner(ctx, nodeOwners, ownersNodes[k]);
            }
        }
    }
}
