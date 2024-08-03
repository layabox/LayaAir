import { Transform } from "./Transform";
import { Sprite } from "../../display/Sprite";
import { Matrix } from "../../maths/Matrix";
import { ILaya } from "../../../ILaya";


/**
 * @private
 * @en The `Bone` class , used for skeletal animations.
 * @zh 骨骼类,用于骨骼动画
 */
export class Bone {
    /**
     * @en The visibility state of bones.
     * @zh 骨骼的可见性状态。
     */
    static ShowBones: any = {};
    /**
     * @en The name of the bone.
     * @zh 骨骼的名称。
     */
    name: string;
    /**
     * @en The root bone of the skeleton.
     * @zh 骨骼的根骨骼。
     */
    root: Bone;
    /**
     * @en The parent bone of this bone.
     * @zh 此骨骼的父骨骼。
     */
    parentBone: Bone;
    /**
     * @en The length of the bone, default is 10.
     * @zh 骨骼的长度，默认为 10。
     */
    length: number = 10;
    /**
     * @en The transform properties of the bone.
     * @zh 骨骼的变换属性。
     */
    transform: Transform;
    /**
     * @en The result transform of the bone after applying all transformations.
     * @zh 应用所有变换后骨骼的结果变换。
     */
    resultTransform: Transform = new Transform();
    /**
     * @en The result matrix of the bone after applying all transformations.
     * @zh 应用所有变换后骨骼的结果矩阵。
     */
    resultMatrix: Matrix = new Matrix();
    /**
     * @en Whether the bone inherits scale from its parent.
     * @zh 是否从父骨骼继承缩放。
     */
    inheritScale: boolean = true;
    /**
     * @en Whether the bone inherits rotation from its parent.
     * @zh 是否从父骨骼继承旋转。
     */
    inheritRotation: boolean = true;

    /**
     * @en The rotation of the bone in degrees.
     * @zh 骨骼的旋转角度，以度为单位。
     */
    rotation: number;
    /**
     * @en The result rotation of the bone after applying all transformations.
     * @zh 应用所有变换后骨骼的结果旋转。
     */
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

    /**
     * @en Sets the temporary matrix for this bone and recursively for all child bones.
     * @param matrix The matrix to set as the temporary matrix.
     * @zh 为这个骨骼及其所有子骨骼设置临时矩阵。
     * @param matrix 要设置为临时矩阵的矩阵。
     */
    setTempMatrix(matrix: Matrix): void {
        this._tempMatrix = matrix;
        var i: number = 0, n: number = 0;
        var tBone: Bone;
        for (i = 0, n = this._children.length; i < n; i++) {
            tBone = this._children[i];
            tBone.setTempMatrix(this._tempMatrix);
        }
    }

    /**
     * @en Updates the transformation of this bone and recursively updates all child bones.
     * @param pMatrix An optional matrix to apply to the transformation.
     * @zh 更新此骨骼的变换并递归更新所有子骨骼。
     * @param pMatrix 一个可选的矩阵，用于应用到变换中。
     */
    //TODO:coverage
    update(pMatrix: Matrix | null = null): void {
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

    /**
     * @en Updates all child bones of this bone.
     * @zh 更新此骨骼的所有子骨骼。
     */
    //TODO:coverage
    updateChild(): void {
        var i: number = 0, n: number = 0;
        var tBone: Bone;
        for (i = 0, n = this._children.length; i < n; i++) {
            tBone = this._children[i];
            tBone.update();
        }
    }

    /**
     * @en Convert the rotation of bone sprites from radians to degrees.
     * @param rd The rotation in radians.
     * @zh 将骨骼精灵的旋转从弧度转换为度。
     * @param rd 弧度值。
     */
    //TODO:coverage
    setRotation(rd: number): void {
        if (this._sprite) {
            this._sprite.rotation = rd * 180 / Math.PI;
        }
    }

    /**
     * @en Updates the drawing of the bone and its sprite at the specified position.
     * @param x The x-coordinate position to draw the bone.
     * @param y The y-coordinate position to draw the bone.
     * @zh 在指定的位置更新骨骼及其精灵的绘制。
     * @param x 绘制骨骼的 x 坐标位置。
     * @param y 绘制骨骼的 y 坐标位置。
     */
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

    /**
     * @en Adds a bone as a child to this bone.
     * @param bone The bone to be added as a child.
     * @zh 将一个骨骼添加为此骨骼的子骨骼。
     * @param bone 要添加为子骨骼的骨骼。
     */
    addChild(bone: Bone): void {
        this._children.push(bone);
        bone.parentBone = this;
    }

    /**
     * @en Finds a bone by its name in the hierarchy of this bone.
     * @param boneName The name of the bone to find.
     * @returns The bone if found, otherwise null.
     * @zh 在此骨骼的层级结构中按名称查找骨骼。
     * @param boneName 要查找的骨骼名称。
     * @returns 如果找到返回骨骼，否则返回 null。
     */
    //TODO:coverage
    findBone(boneName: string): Bone | null {
        if (this.name == boneName) {
            return this;
        }
        else {
            var i: number, n: number;
            var tBone: Bone;
            var tResult: Bone | null;
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

    /**
     * @en Converts local coordinates to world coordinates using this bone's transformation matrix.
     * @param local The local coordinates array to be converted.
     * @zh 使用此骨骼的变换矩阵将本地坐标转换为世界坐标。
     * @param local 要转换的本地坐标数组。
     */
    //TODO:coverage
    localToWorld(local: number[]): void {
        var localX: number = local[0];
        var localY: number = local[1];
        local[0] = localX * this.resultMatrix.a + localY * this.resultMatrix.c + this.resultMatrix.tx;
        local[1] = localX * this.resultMatrix.b + localY * this.resultMatrix.d + this.resultMatrix.ty;
    }

}


