
import { Graphics } from "../display/Graphics"
import { Sprite } from "../display/Sprite"
import { Vector2 } from "../maths/Vector2";
import { Context } from "../resource/Context"
import { IPhysiscs2DFactory } from "./IPhysiscs2DFactory";
/**
 * 物理辅助线
 */
export class Physics2DDebugDraw extends Sprite {

    /**@internal */
    protected _camera: any;

    /**@internal */
    protected _mG: Graphics;

    /**@internal */
    private _textSp: Sprite;

    /**@internal */
    protected _textG: Graphics;

    /**@internal */
    protected _factory: IPhysiscs2DFactory;

    /**@protected */
    protected _lineWidth: number;

    DrawString_color: string;

    Red: string;

    Green: string;

    get mG(): Graphics {
        return this._mG;
    }

    get textG(): Graphics {
        return this._textG;
    }

    get lineWidth(): number {
        return this._lineWidth;
    }


    get camera(): any {
        return this._camera;
    }

    constructor(factory: IPhysiscs2DFactory) {
        super();
        this._factory = factory;
        this.DrawString_color = "#E69999";
        this.Red = "#ff0000";
        this.Green = "#00ff00"
        this._camera = {};
        this._camera.m_center = new Vector2(0, 0);
        this._camera.m_extent = 25;
        this._camera.m_zoom = 1;
        this._camera.m_width = 1280;
        this._camera.m_height = 800;

        this._mG = new Graphics();
        this.graphics = this._mG;

        this._textSp = new Sprite();
        this._textG = this._textSp.graphics;
        this.addChild(this._textSp);
    }

    /**@internal */
    _renderToGraphic(): void {
        if (this._factory.world) {
            this._textG.clear();
            this._mG.clear();
            this._mG.save();
            this._mG.scale(this._factory.PIXEL_RATIO, this._factory.PIXEL_RATIO);
            this._lineWidth = this._factory.layaToPhyValue(1);
            if (this._factory.world.DebugDraw) // ts源码版box2d
                this._factory.world.DebugDraw();
            else
                this._factory.world.DrawDebugData();
            this._mG.restore();
        }
    }

    /**
     * @override
    */
    render(ctx: Context, x: number, y: number): void {
        this._renderToGraphic();
        super.render(ctx, x, y);
    }

    PushTransform(tx: number, ty: number, angle: number): void {
        this._mG.save();
        this._mG.translate(tx, ty);
        this._mG.rotate(angle);
    }

    PopTransform(): void {
        this._mG.restore();
    }

}
