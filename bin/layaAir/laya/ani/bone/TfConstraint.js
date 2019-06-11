/**
     * @private
     */
export class TfConstraint {
    //TODO:coverage
    constructor(data, bones) {
        this._temp = [];
        this._data = data;
        if (this._bones == null) {
            this._bones = [];
        }
        this.target = bones[data.targetIndex];
        var j, n;
        for (j = 0, n = data.boneIndexs.length; j < n; j++) {
            this._bones.push(bones[data.boneIndexs[j]]);
        }
        this.rotateMix = data.rotateMix;
        this.translateMix = data.translateMix;
        this.scaleMix = data.scaleMix;
        this.shearMix = data.shearMix;
    }
    //TODO:coverage
    apply() {
        var tTfBone;
        var ta = this.target.resultMatrix.a, tb = this.target.resultMatrix.b, tc = this.target.resultMatrix.c, td = this.target.resultMatrix.d;
        for (var j = 0, n = this._bones.length; j < n; j++) {
            tTfBone = this._bones[j];
            if (this.rotateMix > 0) {
                var a = tTfBone.resultMatrix.a, b = tTfBone.resultMatrix.b, c = tTfBone.resultMatrix.c, d = tTfBone.resultMatrix.d;
                var r = Math.atan2(tc, ta) - Math.atan2(c, a) + this._data.offsetRotation * Math.PI / 180;
                if (r > Math.PI)
                    r -= Math.PI * 2;
                else if (r < -Math.PI)
                    r += Math.PI * 2;
                r *= this.rotateMix;
                var cos = Math.cos(r), sin = Math.sin(r);
                tTfBone.resultMatrix.a = cos * a - sin * c;
                tTfBone.resultMatrix.b = cos * b - sin * d;
                tTfBone.resultMatrix.c = sin * a + cos * c;
                tTfBone.resultMatrix.d = sin * b + cos * d;
            }
            if (this.translateMix) {
                this._temp[0] = this._data.offsetX;
                this._temp[1] = this._data.offsetY;
                this.target.localToWorld(this._temp);
                tTfBone.resultMatrix.tx += (this._temp[0] - tTfBone.resultMatrix.tx) * this.translateMix;
                tTfBone.resultMatrix.ty += (this._temp[1] - tTfBone.resultMatrix.ty) * this.translateMix;
                tTfBone.updateChild();
            }
            if (this.scaleMix > 0) {
                var bs = Math.sqrt(tTfBone.resultMatrix.a * tTfBone.resultMatrix.a + tTfBone.resultMatrix.c * tTfBone.resultMatrix.c);
                var ts = Math.sqrt(ta * ta + tc * tc);
                var s = bs > 0.00001 ? (bs + (ts - bs + this._data.offsetScaleX) * this.scaleMix) / bs : 0;
                tTfBone.resultMatrix.a *= s;
                tTfBone.resultMatrix.c *= s;
                bs = Math.sqrt(tTfBone.resultMatrix.b * tTfBone.resultMatrix.b + tTfBone.resultMatrix.d * tTfBone.resultMatrix.d);
                ts = Math.sqrt(tb * tb + td * td);
                s = bs > 0.00001 ? (bs + (ts - bs + this._data.offsetScaleY) * this.scaleMix) / bs : 0;
                tTfBone.resultMatrix.b *= s;
                tTfBone.resultMatrix.d *= s;
            }
            if (this.shearMix > 0) {
                b = tTfBone.resultMatrix.b, d = tTfBone.resultMatrix.d;
                var by = Math.atan2(d, b);
                r = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(tTfBone.resultMatrix.c, tTfBone.resultMatrix.a));
                if (r > Math.PI)
                    r -= Math.PI * 2;
                else if (r < -Math.PI)
                    r += Math.PI * 2;
                r = by + (r + this._data.offsetShearY * Math.PI / 180) * this.shearMix;
                s = Math.sqrt(b * b + d * d);
                tTfBone.resultMatrix.b = Math.cos(r) * s;
                tTfBone.resultMatrix.d = Math.sin(r) * s;
            }
        }
    }
}
