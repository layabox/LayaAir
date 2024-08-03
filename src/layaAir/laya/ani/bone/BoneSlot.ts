import { Templet } from "./Templet";
import { SlotData } from "./SlotData";
import { SkinSlotDisplayData } from "./SkinSlotDisplayData";
import { UVTools } from "./UVTools";
import { SkinMeshForGraphic } from "./canvasmesh/SkinMeshForGraphic"
import { GraphicsAni } from "../GraphicsAni";
import { Matrix } from "../../maths/Matrix";
import { Graphics } from "../../display/Graphics";
import { Texture } from "../../resource/Texture";
import { Utils } from "../../utils/Utils";

/**
 * @en The `BoneSlot` class represents a slot in a skeletal animation that can display different skins or attachments.
 * @zh `BoneSlot` 类代表骨骼动画中的一个插槽，可以显示不同的皮肤或附件。
 */
export class BoneSlot {

    /**
     * @en The name of the slot.
     * @zh 插槽的名称。
     */
    name: string;
    /**
     * @en The name of the bone to which the slot is attached.
     * @zh 插槽绑定的骨骼名称。
     */
    parent: string;
    /**
     * @en The name of the current display data or attachment.
     * @zh 插槽显示数据数据的名称。
     */
    attachmentName: string;
    /**
     * @en The original index of the data.
     * @zh 原始数据的索引。
     */
    srcDisplayIndex: number = -1;
    /**
     * @en Used to determine if it is the original object.
     * @zh 判断对象是否是原对象。
     */
    type: string = "src";
    /**
     * @en The pointer to the template.
     * @zh 模板的指针。
     */
    templet: Templet;
    /**
     * @en The current slot data that the slot corresponds to.
     * @zh 当前插槽对应的数据。
     */
    currSlotData: SlotData;
    /**
     * @en The current texture that the slot is displaying.
     * @zh 当前插槽显示的纹理。
     */
    currTexture: Texture | null;
    /**
     * @en The data corresponding to the display object.
     * @zh 显示对象对应的数据。
     */
    currDisplayData: SkinSlotDisplayData | null;

    /**
     * @en The index of the displayed skin.
     * @zh 显示皮肤的索引。
     */
    displayIndex: number = -1;
    /** @private */
    originalIndex: number = -1;

    /**
     * @internal 用户自定义的皮肤。
     */
    private _diyTexture: Texture | null;
    /**@internal */
    private _parentMatrix: Matrix;	// 指向了骨骼的resultMatrix
    /**@internal */
    private _resultMatrix: Matrix;	// 只有不使用缓冲时才使用
    /** @internal 索引替换表 */
    private _replaceDic: any = {};
    /** @internal 当前diyTexture的动画纹理 */
    private _curDiyUV: any[];

    /** @internal 实时模式下，复用使用 */
    private _skinSprite: any;
    /** @private 变形动画数据 */
    deformData: any[];

    /**
     * @en Sets the slot data to be displayed.
     * @param slotData The slot data to display.
     * @param freshIndex Whether to reset the texture, default is true.
     * @zh 设置要显示的插槽数据。
     * @param slotData 要显示的插槽数据。
     * @param freshIndex 是否重置纹理，默认为 true。
     */
    showSlotData(slotData: SlotData, freshIndex: boolean = true): void {
        this.currSlotData = slotData;
        if (freshIndex)
            this.displayIndex = this.srcDisplayIndex;
        this.currDisplayData = null;
        this.currTexture = null;
    }

    /**
     * @en Displays the specified object by name.
     * @param name The name of the object to display.
     * @zh 通过名字显示指定对象。
     * @param name 要显示的对象的名称。
     */
    showDisplayByName(name: string): void {
        if (this.currSlotData) {
            this.showDisplayByIndex(this.currSlotData.getDisplayByName(name));
        }
    }

    /**
     * @en Replaces the texture by name.
     * @param tarName The name of the texture to be replaced.
     * @param newName The name of the new texture to replace with.
     * @zh 替换贴图名。
     * @param	tarName 要替换的贴图名
     * @param	newName 替换后的贴图名
     */
    replaceDisplayByName(tarName: string, newName: string): void {
        if (!this.currSlotData) return;
        var preIndex: number;
        preIndex = this.currSlotData.getDisplayByName(tarName);
        var newIndex: number;
        newIndex = this.currSlotData.getDisplayByName(newName);
        this.replaceDisplayByIndex(preIndex, newIndex);
    }

    /**
     * @en Replaces the display by index.
     * @param tarIndex The index of the display to be replaced.
     * @param newIndex The new index to replace with.
     * @zh 替换贴图索引。
     * @param	tarIndex 要替换的索引
     * @param	newIndex 替换后的索引
     */
    replaceDisplayByIndex(tarIndex: number, newIndex: number): void {
        if (!this.currSlotData) return;
        this._replaceDic[tarIndex] = newIndex;
        if (this.originalIndex == tarIndex) {
            this.showDisplayByIndex(tarIndex);
        }
    }

    /**
     * @en Displays the object by index.
     * @param index The index of the display object.
     * @zh 指定显示对象。
     * @param index 要显示的对象索引。
     */
    showDisplayByIndex(index: number): void {
        this.originalIndex = index;
        if (this._replaceDic[index] != null) index = this._replaceDic[index];
        if (this.currSlotData && index > -1 && index < this.currSlotData.displayArr.length) {
            this.displayIndex = index;
            this.currDisplayData = this.currSlotData.displayArr[index];
            if (this.currDisplayData) {
                var tName: string = this.currDisplayData.name;
                this.currTexture = this.templet.getTexture(tName);
                if (this.currTexture && this.currDisplayData.type == 0 && this.currDisplayData.uvs) {
                    this.currTexture = this.currDisplayData.createTexture(this.currTexture);
                }
            }
        } else {
            this.displayIndex = -1;
            this.currDisplayData = null;
            this.currTexture = null;
        }
    }


    /**
     * @en Replaces the skin with a custom texture.
     * @param _texture The custom texture to replace the skin.
     * @zh 替换皮肤。
     * @param _texture 要替换的自定义皮肤。
     */
    replaceSkin(_texture: Texture): void {
        this._diyTexture = _texture;
        if (this._curDiyUV) this._curDiyUV.length = 0;
        if (this.currDisplayData && this._diyTexture == this.currDisplayData.texture) {
            this._diyTexture = null;
        }
    }

    /**
     * @en Saves the index of the parent matrix.
     * @param parentMatrix The parent matrix to save.
     * @zh 保存父矩阵的索引。
     * @param parentMatrix 要保存的父矩阵。
     */
    //TODO:coverage
    setParentMatrix(parentMatrix: Matrix): void {
        this._parentMatrix = parentMatrix;
    }

    private _mVerticleArr: any[];
    private static _tempMatrix: Matrix = new Matrix();

    /**
     * @en Create SkinGraphic Mesh data.
     * @zh 创建SkinGraphic网格数据
     */
    //TODO:coverage
    static createSkinMesh(): any {
        return new SkinMeshForGraphic();
    }

    //TODO:coverage
    private static isSameArr(arrA: any[], arrB: any[]): boolean {
        if (arrA.length != arrB.length) return false;
        var i: number, len: number;
        len = arrA.length;
        for (i = 0; i < len; i++) {
            if (arrA[i] != arrB[i]) return false;
        }
        return true;
    }
    /**@internal */
    private static _tempResultMatrix: Matrix = new Matrix();
    /**@internal */
    private _preGraphicVerticle: any[];

    //TODO:coverage
    private getSaveVerticle(tArr: any[]): any[] {
        if (BoneSlot.useSameMatrixAndVerticle && this._preGraphicVerticle && BoneSlot.isSameArr(tArr, this._preGraphicVerticle)) {
            tArr = this._preGraphicVerticle;
        } else {
            tArr = Utils.copyArray([], tArr);
            this._preGraphicVerticle = tArr;
        }
        return tArr;
    }

    /**
     * @en Compares two matrices to check if they are identical.
     * @param mtA The first matrix.
     * @param mtB The second matrix.
     * @returns Whether the matrices are identical.
     * @zh 比较两个矩阵是否相同
     * @param mtA 第一个矩阵。
     * @param mtB 第二个矩阵。
     * @returns 是否相同
     */
    //TODO:coverage
    static isSameMatrix(mtA: Matrix, mtB: Matrix): boolean {
        return mtA.a == mtB.a && mtA.b == mtB.b && mtA.c == mtB.c && mtA.d == mtB.d && Math.abs(mtA.tx - mtB.tx) < 0.00001 && Math.abs(mtA.ty - mtB.ty) < 0.00001;
    }

    private _preGraphicMatrix: Matrix;

    private static useSameMatrixAndVerticle: boolean = true;

    //TODO:coverage
    private getSaveMatrix(tResultMatrix: Matrix): Matrix {
        if (BoneSlot.useSameMatrixAndVerticle && this._preGraphicMatrix && BoneSlot.isSameMatrix(tResultMatrix, this._preGraphicMatrix)) {
            tResultMatrix = this._preGraphicMatrix;
        } else {
            var newMatrix: Matrix = tResultMatrix.clone();
            tResultMatrix = newMatrix;
            this._preGraphicMatrix = tResultMatrix;
        }
        return tResultMatrix;
    }

    /**
     * @en Draws the texture onto the Graphics object.
     * @param graphics The Graphics object to draw the texture onto.
     * @param boneMatrixArray An array of matrices corresponding to bone transformations.
     * @param noUseSave If true, do not use the shared matrix object _tempResultMatrix; only set to true when calculating in real-time.
     * @param alpha The alpha value for the texture being drawn, default is 1 (fully opaque).
     * @zh 将纹理绘制到 Graphics 对象上。
     * @param graphics 要在其上绘制纹理的Graphics对象。
     * @param boneMatrixArray 对应骨骼变换的矩阵数组。
     * @param noUseSave 如果为 true，则不使用共享的矩阵对象 _tempResultMatrix；仅在实时计算时设置为 true。
     * @param alpha 绘制纹理的透明度值，默认为 1（完全不透明）。
     */
    draw(graphics: GraphicsAni, boneMatrixArray: any[], noUseSave: boolean = false, alpha: number = 1): void {
        if ((this._diyTexture == null && this.currTexture == null) || this.currDisplayData == null) {
            if (!(this.currDisplayData && this.currDisplayData.type == 3)) {
                return;
            }
        }
        var tTexture = this.currTexture;
        if (this._diyTexture) tTexture = this._diyTexture;
        var tSkinSprite: any;
        switch (this.currDisplayData.type) {
            case 0:
                if (graphics) {
                    var tCurrentMatrix = this.getDisplayMatrix();
                    if (this._parentMatrix) {
                        var tRotateKey: boolean = false;		// 是否有旋转
                        if (tCurrentMatrix) {
                            Matrix.mul(tCurrentMatrix, this._parentMatrix, Matrix.TEMP);
                            var tResultMatrix: Matrix;
                            if (noUseSave) {
                                if (this._resultMatrix == null) this._resultMatrix = new Matrix();
                                tResultMatrix = this._resultMatrix;
                            } else {
                                //tResultMatrix = new Matrix();
                                tResultMatrix = BoneSlot._tempResultMatrix;
                            }
                            if (this._diyTexture && this.currDisplayData.uvs) {
                                var tTestMatrix: Matrix = BoneSlot._tempMatrix;
                                tTestMatrix.identity();
                                //判断是否上下反转。
                                if (this.currDisplayData.uvs[1] > this.currDisplayData.uvs[5]) {
                                    tTestMatrix.d = -1;
                                }
                                //判断是否旋转
                                if (this.currDisplayData.uvs[0] > this.currDisplayData.uvs[4]
                                    && this.currDisplayData.uvs[1] > this.currDisplayData.uvs[5]) {
                                    tRotateKey = true;
                                    tTestMatrix.rotate(-Math.PI / 2);
                                }
                                Matrix.mul(tTestMatrix, Matrix.TEMP, tResultMatrix);
                            } else {
                                Matrix.TEMP.copyTo(tResultMatrix);
                            }

                            if (!noUseSave) {
                                tResultMatrix = this.getSaveMatrix(tResultMatrix);
                            }
                            tResultMatrix._checkTransform();
                            if (tRotateKey) {
                                graphics.drawTexture(tTexture, -this.currDisplayData.height / 2, -this.currDisplayData.width / 2, this.currDisplayData.height, this.currDisplayData.width, tResultMatrix, alpha);
                            } else {
                                graphics.drawTexture(tTexture, -this.currDisplayData.width / 2, -this.currDisplayData.height / 2, this.currDisplayData.width, this.currDisplayData.height, tResultMatrix, alpha);
                            }
                        }
                    }
                }
                break;
            case 1:
                if (noUseSave) {
                    if (this._skinSprite == null) {
                        this._skinSprite = BoneSlot.createSkinMesh();
                    }
                    tSkinSprite = this._skinSprite;
                } else {
                    tSkinSprite = BoneSlot.createSkinMesh();
                }
                if (tSkinSprite == null) {
                    return;
                }
                var tIBArray: any[];
                if (this.currDisplayData.bones == null) {
                    var tVertices: any[] = this.currDisplayData.weights;
                    if (this.deformData) {
                        tVertices = this.deformData;
                    }
                    var tUVs: any[];
                    if (this._diyTexture) {
                        if (!this._curDiyUV) {
                            this._curDiyUV = [];
                        }
                        if (this._curDiyUV.length == 0) {
                            this._curDiyUV = UVTools.getRelativeUV(this.currTexture.uv, this.currDisplayData.uvs, this._curDiyUV);
                            this._curDiyUV = UVTools.getAbsoluteUV(this._diyTexture.uv, this._curDiyUV, this._curDiyUV);
                        }
                        tUVs = this._curDiyUV;
                    } else {
                        tUVs = this.currDisplayData.uvs;
                    }

                    this._mVerticleArr = tVertices;
                    var tTriangleNum: number = this.currDisplayData.triangles.length / 3;

                    tIBArray = this.currDisplayData.triangles;


                    if (this.deformData) {
                        if (!noUseSave) {
                            this._mVerticleArr = this.getSaveVerticle(this._mVerticleArr);
                        }
                    }
                    tSkinSprite.init2(tTexture, tIBArray, this._mVerticleArr, tUVs);

                    var tCurrentMatrix2 = this.getDisplayMatrix();
                    if (this._parentMatrix) {
                        if (tCurrentMatrix2) {
                            Matrix.mul(tCurrentMatrix2, this._parentMatrix, Matrix.TEMP);
                            var tResultMatrix2: Matrix;
                            if (noUseSave) {
                                if (this._resultMatrix == null) this._resultMatrix = new Matrix();
                                tResultMatrix2 = this._resultMatrix;
                            } else {
                                tResultMatrix2 = BoneSlot._tempResultMatrix;
                            }
                            Matrix.TEMP.copyTo(tResultMatrix2);

                            if (!noUseSave) {
                                tResultMatrix2 = this.getSaveMatrix(tResultMatrix2);
                            }
                            tSkinSprite.transform = tResultMatrix2;
                        }
                    }
                } else {
                    this.skinMesh(boneMatrixArray, tSkinSprite);
                }

                graphics.drawSkin(tSkinSprite, alpha);
                break;
            case 2:
                if (noUseSave) {
                    if (this._skinSprite == null) {
                        this._skinSprite = BoneSlot.createSkinMesh();
                    }
                    tSkinSprite = this._skinSprite;
                } else {
                    tSkinSprite = BoneSlot.createSkinMesh();
                }
                if (tSkinSprite == null) {
                    return;
                }
                this.skinMesh(boneMatrixArray, tSkinSprite);
                graphics.drawSkin(tSkinSprite, alpha);
                break;
            case 3:
                break;
        }
    }

    /**@internal */
    private static _tempVerticleArr: any[] = [];
    /**
     * 显示蒙皮动画
     * @param	boneMatrixArray 当前帧的骨骼矩阵
     */
    private skinMesh(boneMatrixArray: any[], skinSprite: any): void {
        var tTexture: Texture = this.currTexture;
        var tBones: any[] = this.currDisplayData.bones;
        var tUvs: any[];
        if (this._diyTexture) {
            tTexture = this._diyTexture;
            if (!this._curDiyUV) {
                this._curDiyUV = [];
            }
            if (this._curDiyUV.length == 0) {
                this._curDiyUV = UVTools.getRelativeUV(this.currTexture.uv, this.currDisplayData.uvs, this._curDiyUV);
                this._curDiyUV = UVTools.getAbsoluteUV(this._diyTexture.uv, this._curDiyUV, this._curDiyUV);
            }
            tUvs = this._curDiyUV;
        } else {
            tUvs = this.currDisplayData.uvs;
        }

        var tWeights: any[] = this.currDisplayData.weights;
        var tTriangles: any[] = this.currDisplayData.triangles;
        var tIBArray: any[];
        var tRx: number = 0;
        var tRy: number = 0;
        var nn: number = 0;
        var tMatrix: Matrix;
        var tX: number;
        var tY: number;
        var tB: number = 0;
        var tWeight: number = 0;
        var tVertices: any[];
        var i: number = 0, j: number = 0, n: number = 0;
        var tRed: number = 1;
        var tGreed: number = 1;
        var tBlue: number = 1;
        BoneSlot._tempVerticleArr.length = 0;
        tVertices = BoneSlot._tempVerticleArr;
        if (this.deformData && this.deformData.length > 0) {
            var f: number = 0;
            for (i = 0, n = tBones.length; i < n;) {
                nn = tBones[i++] + i;
                tRx = 0, tRy = 0;
                for (; i < nn; i++) {
                    tMatrix = boneMatrixArray[tBones[i]]
                    tX = tWeights[tB] + this.deformData[f++];
                    tY = tWeights[tB + 1] + this.deformData[f++];
                    tWeight = tWeights[tB + 2];
                    tRx += (tX * tMatrix.a + tY * tMatrix.c + tMatrix.tx) * tWeight;
                    tRy += (tX * tMatrix.b + tY * tMatrix.d + tMatrix.ty) * tWeight;
                    tB += 3;
                }
                tVertices.push(tRx, tRy);
            }
        } else {
            for (i = 0, n = tBones.length; i < n;) {
                nn = tBones[i++] + i;
                tRx = 0, tRy = 0;
                for (; i < nn; i++) {
                    tMatrix = boneMatrixArray[tBones[i]]
                    tX = tWeights[tB];
                    tY = tWeights[tB + 1];
                    tWeight = tWeights[tB + 2];
                    tRx += (tX * tMatrix.a + tY * tMatrix.c + tMatrix.tx) * tWeight;
                    tRy += (tX * tMatrix.b + tY * tMatrix.d + tMatrix.ty) * tWeight;
                    tB += 3;
                }
                tVertices.push(tRx, tRy);
            }
        }
        this._mVerticleArr = tVertices;
        tIBArray = tTriangles;
        this._mVerticleArr = this.getSaveVerticle(this._mVerticleArr);
        skinSprite.init2(tTexture, tIBArray, this._mVerticleArr, tUvs);
    }

    /**
     * @en Draws the bone's origin point for debugging purposes.
     * @param graphics The Graphics object to draw the bone origin point.
     * @zh 绘制骨骼的起始点，方便调试。
     * @param graphics 要绘制骨骼起始点的 Graphics 对象。
     */
    drawBonePoint(graphics: Graphics): void {
        if (graphics && this._parentMatrix) {
            graphics.drawCircle(this._parentMatrix.tx, this._parentMatrix.ty, 5, "#ff0000");
        }
    }

    /**
     * 得到显示对象的矩阵
     * @return
     */
    //TODO:coverage
    private getDisplayMatrix(): Matrix | null {
        if (this.currDisplayData) {
            return this.currDisplayData.transform.getMatrix();
        }
        return null;
    }

    /**
     * @en Gets the matrix of the slot.
     * @zh 获取插槽的矩阵。
     */
    getMatrix(): Matrix {
        return this._resultMatrix;
    }

    /**
     * @en Copies the original data to create a new instance.
     * @returns A new BoneSlot instance copied from the original data.
     * @zh 使用原始数据拷贝出一个新实例。
     * @returns 返回从原始数据拷贝出的新 BoneSlot 实例。
     */
    copy(): BoneSlot {
        var tBoneSlot: BoneSlot = new BoneSlot();
        tBoneSlot.type = "copy";
        tBoneSlot.name = this.name;
        tBoneSlot.attachmentName = this.attachmentName;
        tBoneSlot.srcDisplayIndex = this.srcDisplayIndex;
        tBoneSlot.parent = this.parent;
        tBoneSlot.displayIndex = this.displayIndex;
        tBoneSlot.templet = this.templet;
        tBoneSlot.currSlotData = this.currSlotData;
        tBoneSlot.currTexture = this.currTexture;
        tBoneSlot.currDisplayData = this.currDisplayData;
        return tBoneSlot;
    }
}

