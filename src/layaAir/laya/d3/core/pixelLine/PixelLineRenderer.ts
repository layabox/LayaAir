import { Component } from "../../../components/Component";
import { Node } from "../../../display/Node";
import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { Color } from "../../math/Color";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector3 } from "../../math/Vector3";
import { Material } from "../material/Material";
import { MeshSprite3DShaderDeclaration } from "../MeshSprite3DShaderDeclaration";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { RenderElement } from "../render/RenderElement";
import { Sprite3D } from "../Sprite3D";
import { Transform3D } from "../Transform3D";
import { PixelLineData } from "./PixelLineData";
import { PixelLineFilter } from "./PixelLineFilter";
import { PixelLineMaterial } from "./PixelLineMaterial";


/**
 * <code>PixelLineRenderer</code> 类用于线渲染器。
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

    /**
     * 创建一个PixelLineRenderer实例
     * @param owner 线渲染精灵
     */
    constructor() {
        super();
        this._projectionViewWorldMatrix = new Matrix4x4();
        this._pixelLineFilter = new PixelLineFilter(this, 20);
        this._shaderValues.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR);
    }

    /**
     * 最大线数量
     */
    get maxLineCount(): number {
        return this._pixelLineFilter._maxLineCount;
    }

    set maxLineCount(value: number) {
        this._pixelLineFilter._resizeLineData(value);
        this._pixelLineFilter._lineCount = Math.min(this._pixelLineFilter._lineCount, value);
    }

    /**
     * 获取线数量。
     */
    get lineCount(): number {
        return this._pixelLineFilter._lineCount;
    }

    protected _onAdded(): void {
        this._changeRenderObjects(0, PixelLineMaterial.defaultMaterial);
    }

    protected _onEnable(): void {
        this._isRenderActive = true;
        if (this._pixelLineFilter._lineCount != 0) {
            (this.owner.scene)._addRenderObject(this);
            this._isInRenders = true;
        }
        this._setBelongScene(this.owner.scene);
    }

    protected _onDisable(): void {
        if (this._pixelLineFilter && this._pixelLineFilter._lineCount != 0 && this._isRenderActive) {
            this.owner.scene._removeRenderObject(this);
            this._isInRenders = false;
        }
        this._isRenderActive = false;
        this._setUnBelongScene();
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    protected _calculateBoundingBox(): void {
        var worldMat: Matrix4x4 = (this.owner as Sprite3D).transform.worldMatrix;
        var lineFilter: PixelLineFilter = this._pixelLineFilter;
        lineFilter._reCalculateBound();
        lineFilter._bounds._tranform(worldMat, this._bounds);
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void {//TODO:整理_renderUpdate
        var projectionView: Matrix4x4 = context.projectionViewMatrix;
        var sv: ShaderData = this._shaderValues;
        if (transform) {
            var worldMat: Matrix4x4 = transform.worldMatrix;
            sv.setMatrix4x4(Sprite3D.WORLDMATRIX, worldMat);
            //Matrix4x4.multiply(projectionView, worldMat, this._projectionViewWorldMatrix);
            //sv.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
        } else {
            sv.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
            //sv.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
        }
    }

    /**
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
    }

    /**
     * 增加一条线。
     * @param	startPosition  初始点位置
     * @param	endPosition	   结束点位置
     * @param	startColor	   初始点颜色
     * @param	endColor	   结束点颜色
     */
    addLine(startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color): void {
        if (this._pixelLineFilter._lineCount !== this._pixelLineFilter._maxLineCount)
            this._pixelLineFilter._updateLineData(this._pixelLineFilter._lineCount++, startPosition, endPosition, startColor, endColor);
        else
            throw "PixelLineSprite3D: lineCount has equal with maxLineCount.";
        if (this._isRenderActive && !this._isInRenders && this._pixelLineFilter._lineCount > 0) {
            this.owner.scene && this.owner.scene._addRenderObject(this);
            this._isInRenders = true;
        }
    }

    /**
     * 添加多条线段。
     * @param	lines  线段数据
     */
    addLines(lines: PixelLineData[]): void {
        var lineCount: number = this._pixelLineFilter._lineCount;
        var addCount: number = lines.length;
        if (lineCount + addCount > this._pixelLineFilter._maxLineCount) {
            throw "PixelLineSprite3D: lineCount plus lines count must less than maxLineCount.";
        } else {
            this._pixelLineFilter._updateLineDatas(lineCount, lines);
            this._pixelLineFilter._lineCount += addCount;
        }
        if (this._isRenderActive && !this._isInRenders && this._pixelLineFilter._lineCount > 0) {
            this.owner.scene && this.owner.scene._addRenderObject(this);
            this._isInRenders = true;
        }
    }

    /**
     * 移除一条线段。
     * @param index 索引。
     */
    removeLine(index: number): void {
        if (index < this._pixelLineFilter._lineCount)
            this._pixelLineFilter._removeLineData(index);
        else
            throw "PixelLineSprite3D: index must less than lineCount.";
        if (this._isRenderActive && this._isInRenders && this._pixelLineFilter._lineCount == 0) {
            this.owner.scene && this.owner.scene._removeRenderObject(this);
            this._isInRenders = false;
        }
    }

    /**
     * 更新线
     * @param	index  		   索引
     * @param	startPosition  初始点位置
     * @param	endPosition	   结束点位置
     * @param	startColor	   初始点颜色
     * @param	endColor	   结束点颜色
     */
    setLine(index: number, startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color): void {
        if (index < this._pixelLineFilter._lineCount)
            this._pixelLineFilter._updateLineData(index, startPosition, endPosition, startColor, endColor);
        else
            throw "PixelLineSprite3D: index must less than lineCount.";
    }

    /**
     * 获取线段数据
     * @param out 线段数据。
     */
    getLine(index: number, out: PixelLineData): void {
        if (index < this.lineCount)
            this._pixelLineFilter._getLineData(index, out);
        else
            throw "PixelLineSprite3D: index must less than lineCount.";
    }

    /**
     * 清除所有线段。
     */
    clear(): void {
        this._pixelLineFilter._lineCount = 0;
        if (this._isRenderActive && this._isInRenders) {
            this.owner.scene && this.owner.scene._removeRenderObject(this);
            this._isInRenders = false;
        }
    }

    protected _onDestroy() {
        this._pixelLineFilter.destroy();
        this._pixelLineFilter = null;
        super._onDestroy();
    }

    /**
     * @override
     * @param dest 
     */
    _cloneTo(dest: Component): void {
        super._cloneTo(dest);
        let render = dest as PixelLineRenderer;
        render.maxLineCount = this.maxLineCount;
        const lineCount = this.lineCount;
        let linedata = new PixelLineData();
        for (let i = 0, n = lineCount; i < n; i++) {
            this.getLine(i, linedata);
            render.addLine(linedata.startPosition, linedata.endPosition, linedata.startColor, linedata.endColor);
        }
    }

}


