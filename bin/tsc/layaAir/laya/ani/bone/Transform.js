import { Matrix } from "../../maths/Matrix";
export class Transform {
    constructor() {
        this.skX = 0; // 旋转？
        this.skY = 0; // 不知道干什么的
        this.scX = 1; // 缩放
        this.scY = 1;
        this.x = 0; // 偏移
        this.y = 0;
        this.skewX = 0; // skew
        this.skewY = 0;
    }
    //TODO:coverage
    initData(data) {
        if (data.x != undefined) {
            this.x = data.x;
        }
        if (data.y != undefined) {
            this.y = data.y;
        }
        if (data.skX != undefined) {
            this.skX = data.skX;
        }
        if (data.skY != undefined) {
            this.skY = data.skY;
        }
        if (data.scX != undefined) {
            this.scX = data.scX;
        }
        if (data.scY != undefined) {
            this.scY = data.scY;
        }
    }
    //TODO:coverage
    getMatrix() {
        var tMatrix;
        if (this.mMatrix) {
            tMatrix = this.mMatrix;
        }
        else {
            tMatrix = this.mMatrix = new Matrix();
        }
        tMatrix.identity();
        tMatrix.scale(this.scX, this.scY);
        if (this.skewX || this.skewY) {
            this.skew(tMatrix, this.skewX * Math.PI / 180, this.skewY * Math.PI / 180);
        }
        tMatrix.rotate(this.skX * Math.PI / 180);
        tMatrix.translate(this.x, this.y);
        return tMatrix;
    }
    //TODO:coverage
    skew(m, x, y) {
        var sinX = Math.sin(y);
        var cosX = Math.cos(y);
        var sinY = Math.sin(x);
        var cosY = Math.cos(x);
        m.setTo(m.a * cosY - m.b * sinX, m.a * sinY + m.b * cosX, m.c * cosY - m.d * sinX, m.c * sinY + m.d * cosX, m.tx * cosY - m.ty * sinX, m.tx * sinY + m.ty * cosX);
        return m;
    }
}
