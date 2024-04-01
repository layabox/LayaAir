import { Sprite3D } from "../../d3/core/Sprite3D";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";



export class TransUtils {
    static readonly tmpV1: Vector3 = new Vector3();
    static readonly tmpV2: Vector3 = new Vector3();
    /**
     * 读取对象内置属性
     * @param item 对象
     * @param key 属性名
     * @return 返回的属性值
     */
    static getItemProperty(item: Sprite3D, key: string): any {
        if (!item || item.destroyed || !key) {
            return null;
        }
        var value: any;
        const transform = item.transform;
        switch (key) {
            case 'xyz':
                value = transform.position.clone();
                break;
            case 'x':
                value = transform.position.x;
                break;
            case 'y':
                value = transform.position.y;
                break;
            case 'z':
                value = transform.position.z;
                break;
            case 'rotationY':
                value = transform.localRotationEulerY; //OnceUtil.formatRoation(transform.transform.localRotationEulerY);
                break;
            case 'scale':
                value = transform.getWorldLossyScale().clone();
                break;
            case 'scalex':
                value = transform.getWorldLossyScale().x;
                break;
            case 'scaley':
                value = transform.getWorldLossyScale().y;
                break;
            case 'scalez':
                value = transform.getWorldLossyScale().z;
                break;
            case 'rotation':
                value = transform.rotationEuler.clone();
                break;
            case 'rotationx':
                value = transform.rotationEuler.x;
                break;
            case 'rotationy':
                value = transform.rotationEuler.y;
                break;
            case 'rotationz':
                value = transform.rotationEuler.z;
                break;
            case 'boundcenter':
                //@ts-ignore
                var bounds = item && item.bounds;
                var vec = bounds && bounds.getCenter();
                return vec && vec.clone();
            case 'forward':
                value = new Vector3;
                transform.getForward(value);
                break;
        }
        return value;
    }

    /**key值:
     * localxyz 局部坐标
     * xyz 世界坐标
     * x 世界坐标x
     * y 世界坐标y
     * z 世界坐标z
     * rotationY 局部欧拉角y轴
     * localscale 本地缩放
     * scale 世界缩放
     * localrotation 局部旋转欧拉角
     * rotation 世界旋转欧拉角
     * @param item
     * @param key
     * @param value
     */
    static setTransformProperty(item: Sprite3D, key: string, value: any, updatebound: boolean = true): void {
        let isRot = false;
        switch (key) {
            case 'localxyz':
            case 'xyz':
            case 'localscale':
            case 'localrotation':
            case 'rotation':
                if (!(value instanceof Vector3)) return;
                break;
            case 'scale':
                break;
            default:
                if (typeof value !== "number") return
                break;
        }

        switch (key) {
            case 'localxyz': item.transform.localPosition = value; break;
            case 'xyz': item.transform.position = value; break;
            case 'x': {
                let pos = item.transform.position;
                pos.x = value;
                item.transform.position = pos;
                break;
            }
            case 'y': {
                let pos = item.transform.position;
                pos.y = value;
                item.transform.position = pos;
                break;
            }
            case 'z': {
                let pos = item.transform.position;
                pos.z = value;
                item.transform.position = pos;
                break;
            }
            case 'speedH':
                // ItemUtils.setSpeed(item, value);
                console.error('TODO:');
                break;
            case 'rotationY': item.transform.localRotationEulerY = value; isRot = true; break;
            case 'localscale': item.transform.localScale = value; break;
            case 'scale': {
                let x: number = 0;
                let y: number = 0;
                let z: number = 0;
                if (value instanceof Vector3 || typeof (value) == 'object') {
                    x = value.x;
                    y = value.y;
                    z = value.z;
                } else if (typeof (value) == 'number') {
                    x = y = z = value;
                } else if (TransUtils.isArray(value)) {
                    x = value[0];
                    y = value[1];
                    z = value[2];
                } else {
                    console.warn('error scale value:', value);
                }
                const tempv: Vector3 = item.transform.getWorldLossyScale();
                tempv.setValue(x, y, z);
                item.transform.setWorldLossyScale(tempv);
                break;
            }
            case 'localrotation': item.transform.localRotationEuler = value; isRot = true; break;
            case 'rotation': item.transform.rotationEuler = value; isRot = true; break;
        }
    }

    /**
     *
     * @param item
     * @param x
     * @param y
     * @param z
     */
    static localToWorld(item: Sprite3D, x: number, y: number, z: number): void {
        TransUtils.tmpV1.setValue(x, y, z);
        Vector3.TransformNormal(TransUtils.tmpV1, item.transform.worldMatrix, TransUtils.tmpV2);
        Vector3.normalize(TransUtils.tmpV2, TransUtils.tmpV2);
        // 规格化以后再恢复实际大小
        Vector3.scale(TransUtils.tmpV2, Vector3.scalarLength(TransUtils.tmpV1), TransUtils.tmpV2);
    }


    /**
     * 把相对于item的本地坐标pos转到世界空间，返回outpos
     * @param pos
     * @param item
     * @param outpos
     * @returns
     */
    static localToWorldByPos(pos: Vector3, item: Sprite3D, outpos: Vector3) {
        let wmat = item.transform.worldMatrix;
        Vector3.transformV3ToV3(pos, wmat, outpos);
        return outpos;
    }

    static isArray(data: any): boolean {
        return data && (Object.prototype.toString.call(data) === '[object Array]' || Object.prototype.toString.call(data) === '[object Arguments]');
    }
}
