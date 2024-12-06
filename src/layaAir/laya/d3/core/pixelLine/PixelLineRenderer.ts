import { Component } from "../../../components/Component";
import { Color } from "../../../maths/Color";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { IMeshRenderNode } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";

import { Material } from "../../../resource/Material";
import { OutOfRangeError } from "../../../utils/Error";
import { Bounds } from "../../math/Bounds";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { UnlitMaterial } from "../material/UnlitMaterial";
import { MeshSprite3DShaderDeclaration } from "../MeshSprite3DShaderDeclaration";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { RenderElement } from "../render/RenderElement";
import { Sprite3D } from "../Sprite3D";
import { PixelLineData } from "./PixelLineData";
import { PixelLineFilter } from "./PixelLineFilter";
import { PixelLineMaterial } from "./PixelLineMaterial";


/**
 * @en PixelLineRenderer class for line rendering.
 * @zh PixelLineRenderer 类用于线渲染器。
 */
export class PixelLineRenderer extends BaseRender {
    /** @internal */
    protected _projectionViewWorldMatrix: Matrix4x4;

    /**@internal */
    _pixelLineFilter: PixelLineFilter;
    /** @private 是否调用active */
    private _isRenderActive: Boolean = false;
    /** @private 是否加入渲染队列*/
    private _isInRenders: Boolean = false;

    private _needUpdatelines: boolean = false;

    /**
     * @ignore
     * @en Initialize PixelLineRenderer instance.
     * @zh 初始化PixelLineRenderer实例。
     */
    constructor() {
        super();
        this._projectionViewWorldMatrix = new Matrix4x4();
        this._pixelLineFilter = new PixelLineFilter(this, 20);
        this._baseRenderNode.shaderData.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR);
        this.geometryBounds = this._pixelLineFilter._bounds;
    }

    /**
     * @en The bounds of the line renderer.
     * @zh 线渲染器的包围盒。
     */
    get bounds(): Bounds {
        var lineFilter: PixelLineFilter = this._pixelLineFilter;
        lineFilter._reCalculateBound();
        return super.bounds;
    }

    private _lines: PixelLineData[] = [];

    /**
     * @en The line segment data.
     * @zh 线段数据。
     */
    get pixelLinesDatas() {
        if (this._needUpdatelines) {
            this._updateLineDatas();
        }
        return this._lines;
    }

    set pixelLinesDatas(value: PixelLineData[]) {
        this.clear();
        if (value.length > this._pixelLineFilter._maxLineCount) {
            value = value.slice(0, this._pixelLineFilter._maxLineCount);
            console.warn("reach max line count");
        }
        this.addLines(value);
    }

    /**
     * @en The maximum number of lines.
     * @zh 最大线数量。
     */
    get maxLineCount(): number {
        return this._pixelLineFilter._maxLineCount;
    }

    set maxLineCount(value: number) {
        this._pixelLineFilter._resizeLineData(value);
        this._pixelLineFilter._lineCount = Math.min(this._pixelLineFilter._lineCount, value);
    }

    /**
     * @en The current number of lines.
     * @zh 当前线数量。
     */
    get lineCount(): number {
        return this._pixelLineFilter._lineCount;
    }

    /**
     * @internal
     * @protected
     */
    protected _onAdded(): void {
        super._onAdded();
        this._changeRenderObjects(0, PixelLineMaterial.defaultMaterial);
    }

    /**
     * @internal
     * @protected
     */
    protected _onEnable(): void {
        this._isRenderActive = true;
        if (this._pixelLineFilter._lineCount != 0) {
            (this.owner.scene)._addRenderObject(this);
            this._isInRenders = true;
        }
        this._setBelongScene(this.owner.scene);
    }

    /**
     * @internal
     * @protected
     */
    protected _onDisable(): void {
        if (this._pixelLineFilter && this._pixelLineFilter._lineCount != 0 && this._isRenderActive) {
            this.owner.scene._removeRenderObject(this);
            this._isInRenders = false;
        }
        this._isRenderActive = false;
        this._setUnBelongScene();
    }

    protected _createBaseRenderNode(): IMeshRenderNode {
        return Laya3DRender.Render3DModuleDataFactory.createMeshRenderNode();
    }

    /**
     * @en Update the render context.
     * @param context The render context.
     * @zh 更新渲染上下文。
     * @param context 渲染上下文。
     */
    renderUpdate(context: RenderContext3D): void {
        this._renderElements.forEach((element, index) => {
            element._renderElementOBJ.isRender = element._geometry._prepareRender(context);
            element._geometry._updateRenderParams(context);

            let material = this.sharedMaterial ?? UnlitMaterial.defaultMaterial;
            material = this.sharedMaterials[index] ?? material;
            element.material = material;
            element._renderElementOBJ.materialRenderQueue = material.renderQueue;
        })
    }

    /**
     * @internal
     * @inheritDoc
     */
    _changeRenderObjects(index: number, material: Material): void {
        var renderObjects: RenderElement[] = this._renderElements;
        (material) || (material = PixelLineMaterial.defaultMaterial);
        var renderElement: RenderElement = renderObjects[index];
        (renderElement) || (renderElement = renderObjects[index] = new RenderElement());
        renderElement.setTransform((this.owner as Sprite3D)._transform);
        renderElement.setGeometry(this._pixelLineFilter);
        renderElement.render = this;
        renderElement.material = material;
        //renderElement.renderSubShader = renderElement.material.shader.getSubShaderAt(0);//TODO
        this._setRenderElements();
    }

    /**
     * @internal //animator data set call
     * @param key 
     */
    _pixelLinesDataChange(key: string) {
        if (key != null) {
            let keyN = parseInt(key);
            let line = this._lines[keyN];
            if (line) {
                this.setLine(keyN, line.startPosition, line.endPosition, line.startColor, line.endColor);
            }
        }
    }

    /**
     * @en Add a line.
     * @param startPosition Initial point position
     * @param endPosition End point position
     * @param startColor Initial point color
     * @param endColor End point color
     * @zh 增加一条线。
     * @param startPosition 初始点位置
     * @param endPosition 结束点位置
     * @param startColor 初始点颜色
     * @param endColor 结束点颜色
     */
    addLine(startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color): void {
        if (this._pixelLineFilter._lineCount !== this._pixelLineFilter._maxLineCount) {
            this._pixelLineFilter._updateLineData(this._pixelLineFilter._lineCount++, startPosition, endPosition, startColor, endColor);
        }
        else {
            throw new Error("reach max line count");
        }

        if (this._isRenderActive && !this._isInRenders && this._pixelLineFilter._lineCount > 0) {
            this.owner.scene && this.owner.scene._addRenderObject(this);
            this._isInRenders = true;
        }
        this._needUpdatelines = true;
    }

    /**
     * @en Add a line with normal.
     * @param startPosition Initial point position
     * @param endPosition End point position
     * @param startColor Initial point color
     * @param endColor End point color
     * @param startNormal Initial point normal
     * @param endNormal End point normal
     * @zh 增加一条带有法线的线。
     * @param startPosition 初始点位置
     * @param endPosition 结束点位置
     * @param startColor 初始点颜色
     * @param endColor 结束点颜色
     * @param startNormal 初始点法线     
     * @param endNormal 结束点法线
     */
    addLineWithNormal(startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color, startNormal: Vector3, endNormal: Vector3) {
        if (this._pixelLineFilter._lineCount !== this._pixelLineFilter._maxLineCount) {
            this._pixelLineFilter._updateLineData(this._pixelLineFilter._lineCount++, startPosition, endPosition, startColor, endColor, startNormal, endNormal);
        }
        else {
            throw new Error("reach max line count");
        }

        if (this._isRenderActive && !this._isInRenders && this._pixelLineFilter._lineCount > 0) {
            this.owner.scene && this.owner.scene._addRenderObject(this);
            this._isInRenders = true;
        }
        this._needUpdatelines = true;
    }

    /**
     * @en Add multiple line segments.
     * @param lines Line segment data
     * @zh 添加多条线段。
     * @param lines 线段数据
     */
    addLines(lines: PixelLineData[]): void {
        var lineCount: number = this._pixelLineFilter._lineCount;
        var addCount: number = lines.length;
        if (lineCount + addCount > this._pixelLineFilter._maxLineCount) {
            throw new Error("reach max line count");
        }
        else {
            this._pixelLineFilter._updateLineDatas(lineCount, lines);
            this._pixelLineFilter._lineCount += addCount;
            this.boundsChange = true;
        }
        if (this._isRenderActive && !this._isInRenders && this._pixelLineFilter._lineCount > 0) {
            this.owner.scene && this.owner.scene._addRenderObject(this);
            this._isInRenders = true;
        }
        this._needUpdatelines = true;
    }

    /**
     * @en Remove a line segment.
     * @param index Index of the line to remove
     * @zh 移除一条线段。
     * @param index 线段索引。
     */
    removeLine(index: number): void {
        if (index < this._pixelLineFilter._lineCount)
            this._pixelLineFilter._removeLineData(index);
        else
            throw new OutOfRangeError(index);
        if (this._isRenderActive && this._isInRenders && this._pixelLineFilter._lineCount == 0) {
            this.owner.scene && this.owner.scene._removeRenderObject(this);
            this._isInRenders = false;
        }
        this._needUpdatelines = true;
    }

    /**
     * @en Update a line.
     * @param index Index of the line to update
     * @param startPosition Initial point position
     * @param endPosition End point position
     * @param startColor Initial point color
     * @param endColor End point color
     * @zh 更新线。
     * @param index 线段索引。
     * @param startPosition 初始点位置。
     * @param endPosition 结束点位置。
     * @param startColor 初始点颜色。
     * @param endColor 结束点颜色。
     */
    setLine(index: number, startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color): void {
        if (index < this._pixelLineFilter._lineCount) {
            this._pixelLineFilter._updateLineData(index, startPosition, endPosition, startColor, endColor);
            let pixeldata = this._lines[index];
            if (pixeldata) {
                startColor.cloneTo(pixeldata.startColor);
                endColor.cloneTo(pixeldata.endColor);
                startPosition.cloneTo(pixeldata.startPosition);
                endPosition.cloneTo(pixeldata.endPosition);
            }
        }

        else
            throw new OutOfRangeError(index);
    }

    /**
     * @en Update a line with normal.
     * @param index Index of the line to update
     * @param startPosition Initial point position
     * @param endPosition End point position
     * @param startColor Initial point color
     * @param endColor End point color
     * @param startNormal Initial point normal
     * @param endNormal End point normal
     * @zh 更新带有法线的线。
     * @param index 线段索引。
     * @param startPosition 初始点位置。
     * @param endPosition 结束点位置。
     * @param startColor 初始点颜色。
     * @param endColor 结束点颜色。
     * @param startNormal 初始点法线。
     * @param endNormal 结束点法线。
     */
    setLineWithNormal(index: number, startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color, startNormal: Vector3, endNormal: Vector3): void {
        if (index < this._pixelLineFilter._lineCount) {
            this._pixelLineFilter._updateLineData(index, startPosition, endPosition, startColor, endColor, startNormal, endNormal);
            let pixeldata = this._lines[index];
            if (pixeldata) {
                startColor.cloneTo(pixeldata.startColor);
                endColor.cloneTo(pixeldata.endColor);
                startPosition.cloneTo(pixeldata.startPosition);
                endPosition.cloneTo(pixeldata.endPosition);
                startNormal && startNormal.cloneTo(pixeldata.startNormal);
                endNormal && endNormal.cloneTo(pixeldata.endNormal);
            }
        }

        else
            throw new OutOfRangeError(index);
    }

    /**
     * @en Get line segment data.
     * @param index Index of the line to get
     * @param out Output line segment data
     * @zh 获取线段数据。
     * @param index 线段索引。
     * @param out 线段数据。
     */
    getLine(index: number, out: PixelLineData): void {
        if (index < this.lineCount)
            this._pixelLineFilter._getLineData(index, out);
        else
            throw new OutOfRangeError(index);
    }

    /**
     * @internal
     */
    private _updateLineDatas() {
        let n = this.lineCount;
        this._lines = [];
        for (let i = 0; i < n; i++) {
            let pixelLineDatas = new PixelLineData();
            this.getLine(i, pixelLineDatas);
            this._lines.push(pixelLineDatas);
        }
        this._needUpdatelines = false;
    }

    /**
     * @en Clear all line segments.
     * @zh 清除所有线段。
     */
    clear(): void {
        this._pixelLineFilter._lineCount = 0;
        if (this._isRenderActive && this._isInRenders) {
            this.owner.scene && this.owner.scene._removeRenderObject(this);
            this._isInRenders = false;
        }
    }

    /**
     * @internal
     * @protected
     */
    protected _onDestroy() {
        this._pixelLineFilter.destroy();
        this._pixelLineFilter = null;
        super._onDestroy();
    }

    /**
     * @internal
     * @override
     * @param dest 
     */
    _cloneTo(dest: PixelLineRenderer): void {
        super._cloneTo(dest);
        dest.maxLineCount = this.maxLineCount;
        const lineCount = this.lineCount;
        let linedata = new PixelLineData();
        for (let i = 0, n = lineCount; i < n; i++) {
            this.getLine(i, linedata);
            dest.addLine(linedata.startPosition, linedata.endPosition, linedata.startColor, linedata.endColor);
        }
    }

}


