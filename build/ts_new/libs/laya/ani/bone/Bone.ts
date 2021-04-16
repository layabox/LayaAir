import { Transform } from "./Transform";
import { Sprite } from "../../display/Sprite";
import { Matrix } from "../../maths/Matrix";
import { ILaya } from "../../../ILaya";


/**
 * @private
 */
export class Bone {
    static ShowBones: any = {};
    name: string;
    root: Bone;
    parentBone: Bone;
    length: number = 10;
    transform: Transform;
    resultTransform: Transform = new Transform();
    resultMatrix: Matrix = new Matrix();
    inheritScale: boolean = true;
    inheritRotation: boolean = true;

    rotation: number;
    resultRotation: number;
    d: number = -1;

    /**@internal */
    private _tempMatrix: Matrix;
    /**@internal */
    private _children: Bone[] = [];
    /**@internal */
    private _sprite: Sprite;

    constructor() {
    }

    setTempMatrix(matrix: Matrix): void {
        this._tempMatrix = matrix;
        var i: number = 0, n: number = 0;
        var tBone: Bone;
        for (i = 0, n = this._children.length; i < n; i++) {
            tBone = this._children[i];
            tBone.setTempMatrix(this._tempMatrix);
        }
    }

    //TODO:coverage
    update(pMatrix: Matrix|null = null): void {
        this.rotation = this.transform.skX;
        var tResultMatrix: Matrix;
        if (pMatrix) {
            tResultMatrix = this.resultTransform.getMatrix();
            Matrix.mul(tResultMatrix, pMatrix, this.resultMatrix);
            this.resultRotation = this.rotation;
        }
        else {
            this.resultRotation = this.rotation + this.parentBone.resultRotation;
            if (this.parentBone) {
                if (this.inheritRotation && this.inheritScale) {
                    tResultMatrix = this.resultTransform.getMatrix();
                    Matrix.mul(tResultMatrix, this.parentBone.resultMatrix, this.resultMatrix);
                }
                else {
                    var parent: Bone = this.parentBone;
                    var tAngle: number;
                    var cos: number;
                    var sin: number;
                    var tParentMatrix: Matrix = this.parentBone.resultMatrix;

                    //var worldX:Number = tParentMatrix.a * transform.x + tParentMatrix.c * transform.y + tParentMatrix.tx;
                    //var worldY:Number = tParentMatrix.b * transform.x + tParentMatrix.d * transform.y + tParentMatrix.ty;

                    //out.tx = ba * atx + bc * aty + btx;
                    //out.ty = bb * atx + bd * aty + bty;
                    tResultMatrix = this.resultTransform.getMatrix();
                    var worldX: number = tParentMatrix.a * tResultMatrix.tx + tParentMatrix.c * tResultMatrix.ty + tParentMatrix.tx;
                    var worldY: number = tParentMatrix.b * tResultMatrix.tx + tParentMatrix.d * tResultMatrix.ty + tParentMatrix.ty;

                    var tTestMatrix: Matrix = new Matrix();
                    if (this.inheritRotation) {
                        tAngle = Math.atan2(parent.resultMatrix.b, parent.resultMatrix.a);
                        cos = Math.cos(tAngle), sin = Math.sin(tAngle);
                        tTestMatrix.setTo(cos, sin, -sin, cos, 0, 0);
                        Matrix.mul(this._tempMatrix, tTestMatrix, Matrix.TEMP);
                        Matrix.TEMP.copyTo(tTestMatrix);
                        tResultMatrix = this.resultTransform.getMatrix();
                        Matrix.mul(tResultMatrix, tTestMatrix, this.resultMatrix);
                        if (this.resultTransform.scX * this.resultTransform.scY < 0) {
                            this.resultMatrix.rotate(Math.PI * 0.5);
                        }
                        this.resultMatrix.tx = worldX;
                        this.resultMatrix.ty = worldY;
                    }
                    else if (this.inheritScale) {
                        tResultMatrix = this.resultTransform.getMatrix();
                        Matrix.TEMP.identity();
                        Matrix.TEMP.d = this.d;
                        Matrix.mul(tResultMatrix, Matrix.TEMP, this.resultMatrix);
                        this.resultMatrix.tx = worldX;
                        this.resultMatrix.ty = worldY;
                    }
                    else {
                        tResultMatrix = this.resultTransform.getMatrix();
                        Matrix.TEMP.identity();
                        Matrix.TEMP.d = this.d;
                        Matrix.mul(tResultMatrix, Matrix.TEMP, this.resultMatrix);
                        this.resultMatrix.tx = worldX;
                        this.resultMatrix.ty = worldY;
                    }
                }

            }
            else {
                tResultMatrix = this.resultTransform.getMatrix();
                tResultMatrix.copyTo(this.resultMatrix);
            }
        }
        var i: number = 0, n: number = 0;
        var tBone: Bone;
        for (i = 0, n = this._children.length; i < n; i++) {
            tBone = this._children[i];
            tBone.update();
        }
    }

    //TODO:coverage
    updateChild(): void {
        var i: number = 0, n: number = 0;
        var tBone: Bone;
        for (i = 0, n = this._children.length; i < n; i++) {
            tBone = this._children[i];
            tBone.update();
        }
    }

    //TODO:coverage
    setRotation(rd: number): void {
        if (this._sprite) {
            this._sprite.rotation = rd * 180 / Math.PI;
        }
    }

    //TODO:coverage
    updateDraw(x: number, y: number): void {
        if (!Bone.ShowBones || Bone.ShowBones[this.name]) {
            if (this._sprite) {
                this._sprite.x = x + this.resultMatrix.tx;
                this._sprite.y = y + this.resultMatrix.ty;
            }
            else {
                this._sprite = new Sprite();
                this._sprite.graphics.drawCircle(0, 0, 5, "#ff0000");
                this._sprite.graphics.drawLine(0, 0, this.length, 0, "#00ff00");
                this._sprite.graphics.fillText(this.name, 0, 0, "20px Arial", "#00ff00", "center");
                ILaya.stage.addChild(this._sprite);
                this._sprite.x = x + this.resultMatrix.tx;
                this._sprite.y = y + this.resultMatrix.ty;
            }

        }
        var i: number = 0, n: number = 0;
        var tBone: Bone;
        for (i = 0, n = this._children.length; i < n; i++) {
            tBone = this._children[i];
            tBone.updateDraw(x, y);
        }
    }

    addChild(bone: Bone): void {
        this._children.push(bone);
        bone.parentBone = this;
    }

    //TODO:coverage
    findBone(boneName: string): Bone|null {
        if (this.name == boneName) {
            return this;
        }
        else {
            var i: number, n: number;
            var tBone: Bone;
            var tResult: Bone|null;
            for (i = 0, n = this._children.length; i < n; i++) {
                tBone = this._children[i];
                tResult = tBone.findBone(boneName);
                if (tResult) {
                    return tResult;
                }
            }
        }
        return null;
    }

    //TODO:coverage
    localToWorld(local: number[]): void {
        var localX: number = local[0];
        var localY: number = local[1];
        local[0] = localX * this.resultMatrix.a + localY * this.resultMatrix.c + this.resultMatrix.tx;
        local[1] = localX * this.resultMatrix.b + localY * this.resultMatrix.d + this.resultMatrix.ty;
    }

}


