import { Sprite3D } from "../../d3/core/Sprite3D";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { Ease } from "../../utils/Ease";
import { Handler } from "../../utils/Handler";
import { Tween } from "../../utils/Tween";
import { TransUtils } from "./TransUtils";

/**
 * 
 * @ brief: BPEAction
 * @ author: zyh
 * @ data: 2024-04-01 17:14
 */
export class BPEAction {
    static translation(item: Sprite3D, isself: boolean, x: number = 0, y: number = 0, z: number = 0) {
        let realValue: Vector3;
        if (isself) {
            let value = TransUtils.tmpV1.setValue(x, y, z);
            item.transform.translate(value, isself);
            realValue = item.transform.localPosition;
        } else {
            realValue = item.transform.position;
            realValue.setValue(x, y, z);
        }
        const key = isself ? "localxyz" : "xyz";
        TransUtils.setTransformProperty(item, key, realValue);
    }

    static rotation(item: Sprite3D, isself: boolean, x: number = 0, y: number = 0, z: number = 0) {
        let realValue: Vector3;
        const key = isself ? "localrotation" : "rotation";
        if (isself) {
            const radian = Math.PI / 180;
            Quaternion.createFromYawPitchRoll(y * radian || 0, x * radian || 0, z * radian || 0, Quaternion.TEMP);
            Quaternion.multiply(item.transform.localRotation, Quaternion.TEMP, Quaternion.TEMP);
            item.transform.localRotation = Quaternion.TEMP;
        } else {
            realValue = item.transform.rotationEuler;
            realValue.setValue(x, y, z);
            TransUtils.setTransformProperty(item, key, realValue);
        }
    }

    static scale(item: Sprite3D, isself: boolean, x: number = 0, y: number = 0, z: number = 0) {
        let realValue = isself ? item.transform.localScale : item.transform.getWorldLossyScale();
        const key = isself ? "localscale" : "scale";
        if (isself) {
            let value = TransUtils.tmpV1.setValue(x, y, z);
            Vector3.add(realValue, value, realValue);
        } else {
            realValue.setValue(x, y, z);
        }
        if (realValue.x < 0) realValue.x = 0.01;
        if (realValue.y < 0) realValue.y = 0.01;
        if (realValue.z < 0) realValue.z = 0.01;
        TransUtils.setTransformProperty(item, key, realValue);
    }

    static translationTween(target: Sprite3D, isSelf: boolean, ease: EEaseFunctions, duration: number, completed: Function, tagValueX?: number, tagValueY?: number, tagValueZ?: number): Tween {
        let transVar = isSelf ? target.transform.localPosition : target.transform.position;
        let propertyKey = isSelf ? "localxyz" : "xyz";
        let x: number, y: number, z: number;
        if (isSelf) {
            let out = TransUtils.tmpV1;
            Vector3.transformQuat(TransUtils.tmpV2.setValue(tagValueX || 0, tagValueY || 0, tagValueZ || 0), target.transform.localRotation, out);
            x = transVar.x + out.x;
            y = transVar.y + out.y;
            z = transVar.z + out.z;
        } else {
            x = tagValueX === undefined ? transVar.x : tagValueX;
            y = tagValueY === undefined ? transVar.y : tagValueY;
            z = tagValueZ === undefined ? transVar.z : tagValueZ;
        }
        return BPEAction.tweenTransform(target, transVar, x, y, z, propertyKey, ease, duration, completed);
    }

    static rotationTween(target: Sprite3D, isSelf: boolean, ease: EEaseFunctions, duration: number, completed: Function, tagValueX?: number, tagValueY?: number, tagValueZ?: number): Tween {
        let transVar = isSelf ? target.transform.localRotationEuler : target.transform.rotationEuler;
        let propertyKey = isSelf ? "localrotation" : "rotation";
        let x: number, y: number, z: number;
        if (isSelf) {
            x = transVar.x + (tagValueX || 0);
            y = transVar.y + (tagValueY || 0);
            z = transVar.z + (tagValueZ || 0);
        } else {
            x = tagValueX === undefined ? transVar.x : tagValueX;
            y = tagValueY === undefined ? transVar.y : tagValueY;
            z = tagValueZ === undefined ? transVar.z : tagValueZ;
        }
        return BPEAction.tweenTransform(target, transVar, x, y, z, propertyKey, ease, duration, completed);
    }
    
    static scaleTween(target: Sprite3D, isSelf: boolean, ease: EEaseFunctions, duration: number, completed: Function, tagValueX?: number, tagValueY?: number, tagValueZ?: number): Tween {
        let transVar = isSelf ? target.transform.localScale : target.transform.getWorldLossyScale();
        let propertyKey = isSelf ? "localscale" : "scale";
        let x: number, y: number, z: number;
        if (isSelf) {
            x = transVar.x + (tagValueX || 0);
            y = transVar.y + (tagValueY || 0);
            z = transVar.z + (tagValueZ || 0);
        } else {
            x = tagValueX === undefined ? transVar.x : tagValueX;
            y = tagValueY === undefined ? transVar.y : tagValueY;
            z = tagValueZ === undefined ? transVar.z : tagValueZ;
        }
        return BPEAction.tweenTransform(target, transVar, x, y, z, propertyKey, ease, duration, completed);
    }

    /** @internal */
    static tweenTransform(target: Sprite3D, transVar: Vector3, x: number, y: number, z: number, propertyKey: string, tweentype: EEaseFunctions, duration: number, completed: Function): Tween {
        if (!target || target.destroyed) {
            completed && completed();
            return null;
        }
        if (duration <= 0 || !tweentype) {
            transVar.setValue(x, y, z);
            TransUtils.setTransformProperty(target, propertyKey, transVar);
            completed && completed();
            return null;
        } else {
            //@ts-ignore
            const tween = Tween.to(transVar, { x: x, y: y, z: z }, duration * 1000, Ease[tweentype], Handler.create(this, () => {
                completed && completed();
            }));
            tween.update = new Handler(this, () => {
                if (target && !target.destroyed && target.transform) {
                    TransUtils.setTransformProperty(target, propertyKey, transVar);
                } else {
                    tween && tween.clear();
                    completed && completed();
                    console.log("节点被销毁---->清理tween");
                }
            });
            return tween;
        }
    }
}