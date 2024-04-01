import { Sprite3D } from "../../d3/core/Sprite3D";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
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
}