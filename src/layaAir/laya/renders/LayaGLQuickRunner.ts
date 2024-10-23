import { NodeFlags } from "../Const"
import { Sprite } from "../display/Sprite"
import { SpriteConst } from "../display/SpriteConst"
import { Rectangle } from "../maths/Rectangle"
import { Context } from "./Context"
import { _RenderFunction } from "./RenderSprite"

/**
 * @internal
 * @en Internal class representing a quick runner for LayaGL. Executes multiple node commands in combination. Single instructions are not added here as they are not meaningful on their own.
 * @zh 内部类，表示 LayaGL 的快速节点命令执行器。多个指令组合才有意义，单个指令没必要在下面加。
 */
export class LayaGLQuickRunner {
    static map: _RenderFunction[] = [];
    /**@internal */
    static __init__(): void {
        LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.TRANSFORM | SpriteConst.GRAPHICS] = LayaGLQuickRunner.alpha_transform_drawLayaGL;
        LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.GRAPHICS] = LayaGLQuickRunner.alpha_drawLayaGL;
        LayaGLQuickRunner.map[SpriteConst.TRANSFORM | SpriteConst.GRAPHICS] = LayaGLQuickRunner.transform_drawLayaGL;
        LayaGLQuickRunner.map[SpriteConst.TRANSFORM | SpriteConst.CHILDS] = LayaGLQuickRunner.transform_drawNodes;
        LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.TRANSFORM | SpriteConst.TEXTURE] = LayaGLQuickRunner.alpha_transform_drawTexture;
        LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.TEXTURE] = LayaGLQuickRunner.alpha_drawTexture;
        LayaGLQuickRunner.map[SpriteConst.TRANSFORM | SpriteConst.TEXTURE] = LayaGLQuickRunner.transform_drawTexture;
        LayaGLQuickRunner.map[SpriteConst.GRAPHICS | SpriteConst.CHILDS] = LayaGLQuickRunner.drawLayaGL_drawNodes;
    }

    /**
     * @en Renders a sprite with texture using transform. Applies sprite transformation and draws the texture.
     * @param sprite The sprite to be rendered.
     * @param context The context for rendering.
     * @param x The x-coordinate for rendering.
     * @param y The y-coordinate for rendering.
     * @zh 使用变换绘制带有纹理的精灵。应用精灵的变换并绘制纹理。
     * @param sprite 要被渲染的精灵。
     * @param context 用于渲染的上下文。
     * @param x 渲染的 x 坐标。
     * @param y 渲染的 y 坐标。
     */
    static transform_drawTexture(sprite: Sprite, context: Context, x: number, y: number): void {
        var tex = sprite.texture;
        context.save();
        context.transformByMatrix(sprite.transform, x, y);

        var width = sprite._isWidthSet ? sprite._width : tex.sourceWidth;
        var height = sprite._isHeightSet ? sprite._height : tex.sourceHeight;
        var wRate = width / tex.sourceWidth;
        var hRate = height / tex.sourceHeight;
        width = tex.width * wRate;
        height = tex.height * hRate;
        if (width <= 0 || height <= 0) return null;
        var px = -sprite.pivotX + tex.offsetX * wRate;
        var py = -sprite.pivotY + tex.offsetY * hRate;
        if (!sprite._getBit(NodeFlags.HIDE_BY_EDITOR))
            context.drawTexture(tex, px, py, width, height);
        context.restore();
    }

    /**
     * @en Renders a sprite with texture using alpha. Applies alpha and draws the texture.
     * @param sprite The sprite to be rendered.
     * @param context The context for rendering.
     * @param x The x-coordinate for rendering.
     * @param y The y-coordinate for rendering.
     * @zh 使用透明度绘制带有纹理的精灵。应用透明度并绘制纹理。
     * @param sprite 要被渲染的精灵。
     * @param context 用于渲染的上下文。
     * @param x 渲染的 x 坐标。
     * @param y 渲染的 y 坐标。
     */
    static alpha_drawTexture(sprite: Sprite, context: Context, x: number, y: number): void {
        var style = sprite._style;
        var alpha = style.alpha;
        var tex = sprite.texture;
        if (alpha > 0.01 || sprite._needRepaint()) {
            var temp = context.globalAlpha;
            context.globalAlpha *= alpha;
            var width = sprite._isWidthSet ? sprite._width : tex.sourceWidth;
            var height = sprite._isHeightSet ? sprite._height : tex.sourceHeight;
            var wRate = width / tex.sourceWidth;
            var hRate = height / tex.sourceHeight;
            width = tex.width * wRate;
            height = tex.height * hRate;
            if (width <= 0 || height <= 0) return null;
            var px = x - style.pivotX + tex.offsetX * wRate;
            var py = y - style.pivotY + tex.offsetY * hRate;
            if (!sprite._getBit(NodeFlags.HIDE_BY_EDITOR))
                context.drawTexture(tex, px, py, width, height);
            context.globalAlpha = temp;
        }
    }

    /**
     * @en Renders a sprite with texture using alpha and transform. Applies alpha and transformation and draws the texture.
     * @param sprite The sprite to be rendered.
     * @param context The context for rendering.
     * @param x The x-coordinate for rendering.
     * @param y The y-coordinate for rendering.
     * @zh 使用透明度和变换绘制带有纹理的精灵。应用透明度和变换并绘制纹理。
     * @param sprite 要被渲染的精灵。
     * @param context 用于渲染的上下文。
     * @param x 渲染的 x 坐标。
     * @param y 渲染的 y 坐标。
     */
    static alpha_transform_drawTexture(sprite: Sprite, context: Context, x: number, y: number): void {
        var style = sprite._style;
        var alpha = style.alpha;
        var tex = sprite.texture;
        if (alpha > 0.01 || sprite._needRepaint()) {
            var temp = context.globalAlpha;
            context.globalAlpha *= alpha;

            context.save();
            context.transformByMatrix(sprite.transform, x, y);
            var width = sprite._isWidthSet ? sprite._width : tex.sourceWidth;
            var height = sprite._isHeightSet ? sprite._height : tex.sourceHeight;
            var wRate = width / tex.sourceWidth;
            var hRate = height / tex.sourceHeight;
            width = tex.width * wRate;
            height = tex.height * hRate;
            if (width <= 0 || height <= 0) return null;
            var px = -style.pivotX + tex.offsetX * wRate;
            var py = -style.pivotY + tex.offsetY * hRate;
            if (!sprite._getBit(NodeFlags.HIDE_BY_EDITOR))
                context.drawTexture(tex, px, py, width, height);
            context.restore();

            context.globalAlpha = temp;
        }
    }

    /**
     * @en Renders a sprite with graphics using alpha and transform. Applies alpha and transformation and renders the sprite's graphics.
     * @param sprite The sprite to be rendered.
     * @param context The context for rendering.
     * @param x The x-coordinate for rendering.
     * @param y The y-coordinate for rendering.
     * @zh 使用透明度和变换绘制带有图形的精灵。应用透明度和变换并渲染精灵的图形。
     * @param sprite 要被渲染的精灵。
     * @param context 用于渲染的上下文。
     * @param x 渲染的 x 坐标。
     * @param y 渲染的 y 坐标。
     */
    static alpha_transform_drawLayaGL(sprite: Sprite, context: Context, x: number, y: number): void {
        var style = sprite._style;
        var alpha = style.alpha;
        if (alpha > 0.01 || sprite._needRepaint()) {
            var temp = context.globalAlpha;
            context.globalAlpha *= alpha;

            context.save();
            context.transformByMatrix(sprite.transform, x, y);
            if (!sprite._getBit(NodeFlags.HIDE_BY_EDITOR))
                sprite._graphics && sprite._graphics._render(sprite, context, -style.pivotX, -style.pivotY);
            context.restore();

            context.globalAlpha = temp;
        }
    }

    /**
     * @en Renders a sprite with graphics using alpha. Applies alpha and renders the sprite's graphics.
     * @param sprite The sprite to be rendered.
     * @param context The context for rendering.
     * @param x The x-coordinate for rendering.
     * @param y The y-coordinate for rendering.
     * @zh 使用透明度绘制带有图形的精灵。应用透明度并渲染精灵的图形。
     * @param sprite 要被渲染的精灵。
     * @param context 用于渲染的上下文。
     * @param x 渲染的 x 坐标。
     * @param y 渲染的 y 坐标。
     */
    static alpha_drawLayaGL(sprite: Sprite, context: Context, x: number, y: number): void {
        var style = sprite._style;
        var alpha = style.alpha;
        if (alpha > 0.01 || sprite._needRepaint()) {
            var temp = context.globalAlpha;
            context.globalAlpha *= alpha;
            if (!sprite._getBit(NodeFlags.HIDE_BY_EDITOR))
                sprite._graphics && sprite._graphics._render(sprite, context, x - style.pivotX, y - style.pivotY);
            context.globalAlpha = temp;
        }
    }

    /**
     * @en Renders a sprite with graphics using transform. Applies transformation and renders the sprite's graphics.
     * @param sprite The sprite to be rendered.
     * @param context The context for rendering.
     * @param x The x-coordinate for rendering.
     * @param y The y-coordinate for rendering.
     * @zh 使用变换绘制带有图形的精灵。应用变换并渲染精灵的图形。
     * @param sprite 要被渲染的精灵。
     * @param context 用于渲染的上下文。
     * @param x 渲染的 x 坐标。
     * @param y 渲染的 y 坐标。
     */
    static transform_drawLayaGL(sprite: Sprite, context: Context, x: number, y: number): void {
        var style = sprite._style;
        context.save();
        context.transformByMatrix(sprite.transform, x, y);
        if (!sprite._getBit(NodeFlags.HIDE_BY_EDITOR))
            sprite._graphics && sprite._graphics._render(sprite, context, -style.pivotX, -style.pivotY);
        context.restore();
    }

    /**
     * @en Renders a sprite with children using transform. Applies transformation and renders the sprite's children.
     * @param sprite The sprite to be rendered.
     * @param context The context for rendering.
     * @param x The x-coordinate for rendering.
     * @param y The y-coordinate for rendering.
     * @zh 使用变换绘制带有子节点的精灵。应用变换并渲染精灵的子节点。
     * @param sprite 要被渲染的精灵。
     * @param context 用于渲染的上下文。
     * @param x 渲染的 x 坐标。
     * @param y 渲染的 y 坐标。
     */
    static transform_drawNodes(sprite: Sprite, context: Context, x: number, y: number): void {
        var drawcallOptim = sprite._getBit(NodeFlags.DRAWCALL_OPTIMIZE) && context.drawCallOptimize(true);
        var style = sprite._style;
        context.save();
        context.transformByMatrix(sprite.transform, x, y);

        x = -style.pivotX;
        y = -style.pivotY;

        var childs: any[] = sprite._children, n = childs.length;
        let rect: Rectangle;
        let left: number, top: number, right: number, bottom: number, _x: number, _y: number;

        if (style.viewport) {
            rect = style.viewport;
            left = rect.x;
            top = rect.y;
            right = rect.right;
            bottom = rect.bottom;
        }

        for (let i = 0; i < n; ++i) {
            let ele = childs[i];
            let visFlag = ele._visible || ele._getBit(NodeFlags.DISABLE_VISIBILITY);
            if (rect && (
                (_x = ele._x) >= right ||
                (_x + ele.width) <= left ||
                (_y = ele._y) >= bottom ||
                (_y + ele.height) <= top))
                visFlag = false;

            if (visFlag)
                ele.render(context, x, y);
        }

        context.restore();
        drawcallOptim && context.drawCallOptimize(false);
    }

    /**
     * @en Renders a sprite with graphics and children. Renders the sprite's graphics and then renders its children.
     * @param sprite The sprite to be rendered.
     * @param context The context for rendering.
     * @param x The x-coordinate for rendering.
     * @param y The y-coordinate for rendering.
     * @zh 绘制带有图形和子节点的精灵。先渲染精灵的图形，然后渲染其子节点。
     * @param sprite 要被渲染的精灵。
     * @param context 用于渲染的上下文。
     * @param x 渲染的 x 坐标。
     * @param y 渲染的 y 坐标。
     */
    static drawLayaGL_drawNodes(sprite: Sprite, context: Context, x: number, y: number): void {
        var drawcallOptim = sprite._getBit(NodeFlags.DRAWCALL_OPTIMIZE) && context.drawCallOptimize(true);
        let drawingToTexture = context._drawingToTexture;
        var style = sprite._style;
        x = x - style.pivotX;
        y = y - style.pivotY;
        if (!sprite._getBit(NodeFlags.HIDE_BY_EDITOR))
            sprite._graphics && sprite._graphics._render(sprite, context, x, y);

        var childs: any[] = sprite._children, n = childs.length;
        let rect: Rectangle;
        let left: number, top: number, right: number, bottom: number, _x: number, _y: number;

        if (style.viewport) {
            rect = style.viewport;
            left = rect.x;
            top = rect.y;
            right = rect.right;
            bottom = rect.bottom;
        }

        let visFlag: boolean;
        for (let i = 0; i < n; ++i) {
            let ele = childs[i];
            if (drawingToTexture)
                visFlag = ele._visible && !ele._getBit(NodeFlags.ESCAPE_DRAWING_TO_TEXTURE);
            else
                visFlag = ele._visible || ele._getBit(NodeFlags.DISABLE_VISIBILITY);

            if (rect && ((_x = ele._x) >= right ||
                (_x + ele.width) <= left ||
                (_y = ele._y) >= bottom ||
                (_y + ele.height) <= top))
                visFlag = false;

            if (visFlag)
                ele.render(context, x, y);
        }

        drawcallOptim && context.drawCallOptimize(false);
    }
}

