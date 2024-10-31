import { NodeFlags } from "../Const"
import { Sprite } from "../display/Sprite"
import { SpriteConst } from "../display/SpriteConst"
import { Matrix } from "../maths/Matrix"
import { Rectangle } from "../maths/Rectangle"
import { Context } from "./Context"
import { _RenderFunction } from "./RenderSprite"

/**
 * @internal
 * 快速节点命令执行器
 * 多个指令组合才有意义，单个指令没必要在下面加
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

    static alpha_drawLayaGL(sprite: Sprite, context: Context, x: number, y: number): void {
        var style = sprite._style;
        var alpha = style.alpha;
        if (alpha  > 0.01 || sprite._needRepaint()) {
            var temp = context.globalAlpha;
            context.globalAlpha *= alpha;
            if (!sprite._getBit(NodeFlags.HIDE_BY_EDITOR))
                sprite._graphics && sprite._graphics._render(sprite, context, x - style.pivotX, y - style.pivotY);
            context.globalAlpha = temp;
        }
    }

    static transform_drawLayaGL(sprite: Sprite, context: Context, x: number, y: number): void {
        var style = sprite._style;
        context.save();
        context.transformByMatrix(sprite.transform, x, y);
        if (!sprite._getBit(NodeFlags.HIDE_BY_EDITOR))
            sprite._graphics && sprite._graphics._render(sprite, context, -style.pivotX, -style.pivotY);
        context.restore();
    }

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
                    (_x = ele._x) >= right   || 
                    (_x + ele.width) <= left || 
                    (_y = ele._y) >= bottom  || 
                    (_y + ele.height) <= top))
                visFlag = false;

            if (visFlag)
                ele.render(context, x, y);
        }

        context.restore();
        drawcallOptim && context.drawCallOptimize(false);
    }

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

        let visFlag:boolean;
        for (let i = 0; i < n; ++i) {
            let ele = childs[i];
            if (drawingToTexture)
                visFlag = ele._visible && !ele._getBit(NodeFlags.ESCAPE_DRAWING_TO_TEXTURE);
            else
                visFlag = ele._visible || ele._getBit(NodeFlags.DISABLE_VISIBILITY);

            if (rect && ((_x = ele._x) >= right   || 
                         (_x + ele.width) <= left || 
                         (_y = ele._y) >= bottom  || 
                         (_y + ele.height) <= top))
                visFlag = false;

            if (visFlag)
                ele.render(context, x, y);
        }

        drawcallOptim && context.drawCallOptimize(false);
    }
}

