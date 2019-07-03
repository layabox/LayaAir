import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
/**
 * @internal
 * <code>KeyframeNodeOwner</code> 类用于保存帧节点的拥有者信息。
 */
export class KeyframeNodeOwner {
    /**
     * 创建一个 <code>KeyframeNodeOwner</code> 实例。
     */
    constructor() {
        /**@internal */
        this.indexInList = -1;
        /**@internal */
        this.referenceCount = 0;
        /**@internal */
        this.updateMark = -1;
        /**@internal */
        this.type = -1;
        /**@internal */
        this.fullPath = null;
        /**@internal */
        this.propertyOwner = null;
        /**@internal */
        this.property = null;
        /**@internal */
        this.defaultValue = null;
        /**@internal */
        this.crossFixedValue = null;
    }
    /**
     * @internal
     */
    saveCrossFixedValue() {
        var pro = this.propertyOwner;
        if (pro) {
            switch (this.type) {
                case 0:
                    var proPat = this.property;
                    var m = proPat.length - 1;
                    for (var j = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) //属性可能或被置空
                            break;
                    }
                    this.crossFixedValue = pro[proPat[m]];
                    break;
                case 1:
                    var locPos = pro.localPosition;
                    this.crossFixedValue || (this.crossFixedValue = new Vector3());
                    this.crossFixedValue.x = locPos.x;
                    this.crossFixedValue.y = locPos.y;
                    this.crossFixedValue.z = locPos.z;
                    break;
                case 2:
                    var locRot = pro.localRotation;
                    this.crossFixedValue || (this.crossFixedValue = new Quaternion());
                    this.crossFixedValue.x = locRot.x;
                    this.crossFixedValue.y = locRot.y;
                    this.crossFixedValue.z = locRot.z;
                    this.crossFixedValue.w = locRot.w;
                    break;
                case 3:
                    var locSca = pro.localScale;
                    this.crossFixedValue || (this.crossFixedValue = new Vector3());
                    this.crossFixedValue.x = locSca.x;
                    this.crossFixedValue.y = locSca.y;
                    this.crossFixedValue.z = locSca.z;
                    break;
                case 4:
                    var locEul = pro.localRotationEuler;
                    this.crossFixedValue || (this.crossFixedValue = new Vector3());
                    this.crossFixedValue.x = locEul.x;
                    this.crossFixedValue.y = locEul.y;
                    this.crossFixedValue.z = locEul.z;
                    break;
                default:
                    throw "Animator:unknown type.";
            }
        }
    }
}
