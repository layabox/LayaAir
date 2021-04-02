import { Camera, CameraEventFlags } from "laya/d3/core/Camera";
import { RenderState } from "laya/d3/core/material/RenderState";
import { PixelLineMaterial } from "laya/d3/core/pixelLine/PixelLineMaterial";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { Color } from "laya/d3/math/Color";
import { Vector3 } from "laya/d3/math/Vector3";
import { GridMaterial } from "../EditorMaterial/GridMaterial";


export class GridLine {

    private gridLineCommand: CommandBuffer;
    private axisLineCommand: CommandBuffer;

    constructor(editorCamera: Camera) {

        let gridLineCommand: CommandBuffer = this.gridLineCommand = new CommandBuffer();
        let axisLineCommand: CommandBuffer = this.axisLineCommand = new CommandBuffer();

        // todo Command buffer  rendertexture bug 
        editorCamera.addCommandBuffer(CameraEventFlags.BeforeImageEffect, gridLineCommand);
        editorCamera.addCommandBuffer(CameraEventFlags.BeforeSkyBox, axisLineCommand);

        GridMaterial.__init__();
        
        this._buildAxis(axisLineCommand);
        this._buildGridLine(gridLineCommand);
    }

    private _buildAxis(axisLineCommand: CommandBuffer) {

        let xnum = 200;
        let ynum = 200;
        let gridw = 10;
        let minx = -xnum * gridw;
        let miny = -ynum * gridw;
        let maxx = xnum * gridw;
        let maxy = ynum * gridw;

        let xcolor = new Color(1, 0.5, 0.5, 1.0);
        let ycolor = new Color(0.3, 0.8, 0, 0.5);
        let zcolor = new Color(0, 0.5, 1, 1.0);

        let axisXZLine: PixelLineSprite3D = new PixelLineSprite3D(2);
        axisXZLine.addLine(new Vector3(minx, 0, 0), new Vector3(maxx, 0, 0), xcolor, xcolor);
        axisXZLine.addLine(new Vector3(0, 0, minx), new Vector3(0, 0, maxx), zcolor, zcolor);

        let lineXZMaterial: GridMaterial = new GridMaterial();
        lineXZMaterial.step = 100;
        axisLineCommand.drawRender(axisXZLine.pixelLineRenderer, lineXZMaterial, 0);

		/*
        let axisYLine: PixelLineSprite3D = new PixelLineSprite3D(1);
        axisYLine.addLine(new Vector3(0, 0, 0), new Vector3(0, maxy, 0), ycolor, ycolor);

        let lineYMaterial: PixelLineMaterial = new PixelLineMaterial();
        axisLineCommand.drawRender(axisYLine.pixelLineRenderer, lineYMaterial, 0);
		*/
    }

    private _buildGridLine(gridLineCommand: CommandBuffer) {
        let gridLineCount = 10000;

        let gridLine1: PixelLineSprite3D = new PixelLineSprite3D(gridLineCount);
        this.addGridLine(gridLine1, 1000, 1);
        let gridMaterial1: GridMaterial = new GridMaterial();
        gridMaterial1.step = 1;

        let gridLine10: PixelLineSprite3D = new PixelLineSprite3D(gridLineCount);
        this.addGridLine(gridLine10, 1000, 10);
        let gridMaterial10: GridMaterial = new GridMaterial();
        gridMaterial10.step = 10;

        let gridLine100: PixelLineSprite3D = new PixelLineSprite3D(gridLineCount);
        this.addGridLine(gridLine100, 1000, 100);
        let gridMaterial100: GridMaterial = new GridMaterial();
        gridMaterial100.step = 100;

        gridLineCommand.drawRender(gridLine1.pixelLineRenderer, gridMaterial1, 0);
        gridLineCommand.drawRender(gridLine10.pixelLineRenderer, gridMaterial10, 0);
        gridLineCommand.drawRender(gridLine100.pixelLineRenderer, gridMaterial100, 0);
    }

    private addGridLine(line: PixelLineSprite3D, area: number, step: number, color: Color = new Color(0.3, 0.3, 0.3, 1.0)) {
        let lineColor: Color = color;
        for (let index = -area + step; index < area; index += step) {
            if (index != 0) {
                var l1: Vector3 = new Vector3(index, 0, -area);
                var l2: Vector3 = new Vector3(index, 0, area);
                var l3: Vector3 = new Vector3(-area, 0, index);
                var l4: Vector3 = new Vector3(area, 0, index);
                line.addLine(l1, l2, lineColor, lineColor);
                line.addLine(l3, l4, lineColor, lineColor);
            }

        }
    }
}
