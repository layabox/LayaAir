import { Graphics } from "laya/display/Graphics"
import { Sprite } from "laya/display/Sprite"

/**
 * ...
 * @author ww
 */
export class AutoSizeRec extends Sprite {
    type: number;
    constructor(type: string) {
        super();


    }

    set height(value: number) {
        // TODO Auto Generated method stub
        super.height = value;
        this.changeSize();
    }

    set width(value: number) {
        // TODO Auto Generated method stub
        super.width = value;
        this.changeSize();
    }

    private _color: string = "#ffffff";
    setColor(color: string): void {
        this._color = color;
        this.reRender();
    }

    protected changeSize(): void {
        // TODO Auto Generated method stub
        this.reRender();

    }
    private reRender(): void {
        var g: Graphics = this.graphics;
        g.clear();
        g.drawRect(0, 0, this.width, this.height, this._color);
    }
    preX: number;
    preY: number;
    record(): void {
        this.preX = this.x;
        this.preY = this.y;
    }
    getDx(): number {
        return this.x - this.preX;
    }
    getDy(): number {
        return this.y - this.preY;
    }

}


