import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { Context } from "../../renders/Context"
import { Material } from "../../resource/Material";
import { Pool } from "../../utils/Pool"

export class DrawGeosCmd {
    static ID: string = "DrawGeoCmd";
    geo: IRenderGeometryElement;
    elements:[Material,number,number][];

    /**@private */
    static create(geo: IRenderGeometryElement, elements:[Material,number,number][]): DrawGeosCmd {
        var cmd: DrawGeosCmd = Pool.getItemByClass("DrawGeosCmd", DrawGeosCmd);
        cmd.init(geo, elements);
        return cmd;
    }

    init(geo: IRenderGeometryElement, elements:[Material,number,number][]): void {
        this.elements = elements;
        this.geo = geo;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        Pool.recover("DrawGeosCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.drawGeos(this.geo, this.elements, gx, gy);
    }

    /**@private */
    get cmdID(): string {
        return DrawGeosCmd.ID;
    }
}
