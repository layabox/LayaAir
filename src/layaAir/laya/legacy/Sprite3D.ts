import { Sprite3D } from "../d3/core/Sprite3D";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";

Sprite3D && (function () {
    Sprite3D.prototype._parse = function (this: Sprite3D, data: any, spriteMap: any): void {
        (data.isStatic !== undefined) && (this.isStatic = data.isStatic);
        (data.active !== undefined) && (this.active = data.active);
        (data.name != undefined) && (this.name = data.name);
        (data.tag != undefined) && (this.tag = data.tag);

        if (data.position !== undefined) {
            var loccalPosition: Vector3 = this.transform.localPosition;
            loccalPosition.fromArray(data.position);
            this.transform.localPosition = loccalPosition;
        }

        if (data.rotationEuler !== undefined) {
            var localRotationEuler: Vector3 = this.transform.localRotationEuler;
            localRotationEuler.fromArray(data.rotationEuler);
            this.transform.localRotationEuler = localRotationEuler;
        }
        if (data.rotation !== undefined) {
            var localRotation: Quaternion = this.transform.localRotation;
            localRotation.fromArray(data.rotation);
            this.transform.localRotation = localRotation;
        }

        if (data.scale !== undefined) {
            var localScale: Vector3 = this.transform.localScale;
            localScale.fromArray(data.scale);
            this.transform.localScale = localScale;
        }

        (data.layer != undefined) && (this.layer = data.layer);
    };
})();