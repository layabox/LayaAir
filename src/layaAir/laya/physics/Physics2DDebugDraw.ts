
import { LayaEnv } from "../../LayaEnv";
import { Graphics } from "../display/Graphics"
import { Sprite } from "../display/Sprite"
import { Vector2 } from "../maths/Vector2";
import { Context } from "../renders/Context"
import { IPhysiscs2DFactory } from "./IPhysiscs2DFactory";
/**
 * @en Physical auxiliary line
 * @zh 物理辅助线
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

    /**
     * @en The color string used for drawing text.
     * @zh 用于绘制文本的颜色字符串。
     */
    DrawString_color: string;

    /**
     * @en The color string representing red.
     * @zh 表示红色的颜色字符串。
     */
    Red: string;

    /**
     * @en The color string representing green.
     * @zh 表示绿色的颜色字符串。
     */
    Green: string;

    /**
     * @en The Graphics object used for drawing shapes.
     * @zh 用于绘制形状的 Graphics 对象。
     */
    get mG(): Graphics {
        return this._mG;
    }

    /**
     * @en The Graphics object used for drawing text.
     * @zh 用于绘制文本的 Graphics 对象。
     */
    get textG(): Graphics {
        return this._textG;
    }

    /**
     * @en The current line width used for drawing.
     * @zh 用于绘制的当前线宽。
     */
    get lineWidth(): number {
        return this._lineWidth;
    }

    /**
     * @en The camera object associated with the scene or view.
     * @zh 与场景或视图关联的摄像机对象。
     */
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
    private _renderToGraphic(): void {
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
     * @en Renders the object using the given context and position.
     * @zh 使用给定的上下文和位置渲染对象。
     */
    render(ctx: Context, x: number, y: number): void {
        if(!LayaEnv.isPlaying) return;
        this._renderToGraphic();
        super.render(ctx, x, y);
    }

    /**
     * @en Saves the current state of the environment and remaps the position and rotation on the canvas.
     * @zh 保存当前环境的状态，重新映射画布上的位置和旋转。
     */
    PushTransform(tx: number, ty: number, angle: number): void {
        this._mG.save();
        this._mG.translate(tx, ty);
        this._mG.rotate(angle);
    }

    /**
     * @en Restores the previously saved path state and properties.
     * @zh 返回之前保存过的路径状态和属性。
     */
    PopTransform(): void {
        this._mG.restore();
    }
}
