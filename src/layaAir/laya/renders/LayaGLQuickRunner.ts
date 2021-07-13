import { Const } from "../Const"
import { Sprite } from "../display/Sprite"
import { SpriteConst } from "../display/SpriteConst"
import { SpriteStyle } from "../display/css/SpriteStyle"
import { Matrix } from "../maths/Matrix"
import { Rectangle } from "../maths/Rectangle"
import { Context } from "../resource/Context"
import { Texture } from "../resource/Texture"
import { _RenderFunction } from "./RenderSprite"

/**
 * @internal
 * 快速节点命令执行器
 * 多个指令组合才有意义，单个指令没必要在下面加
 */
export class LayaGLQuickRunner {
    /*[FILEINDEX:10000]*/
    static map: _RenderFunction[] = [];
    private static curMat: Matrix = new Matrix();
    /**@internal */
    static __init__(): void {
        /*
           glQuickMap["drawNode;"] = drawNode;
           glQuickMap["drawNodes;"] = drawNodes;
           glQuickMap["drawLayaGL;"] = drawLayaGL;
           glQuickMap["drawLayaGL;drawNodes;"] = drawLayaGL_drawNodes;
           glQuickMap["save;alpha;drawNode;restore;"] = save_alpha_drawNode_restore;
           glQuickMap["save;alpha;drawLayaGL;restore;"] = save_alpha_drawLayaGL_restore;
         */
        //glQuickMap["save;alpha;drawTextureWithGr;restore;"] = save_alpha_drawTextureWithGr_restore;
        //glQuickMap["save;transform;drawTextureWithGr;restore;"] = save_alpha_transform_drawTextureWithGr_restore;
        //glQuickMap["save;alpha;transform;drawTextureWithGr;restore;"] = save_alpha_transform_drawTextureWithGr_restore;
        //glQuickMap["drawTextureWithGr;"] = drawTextureWithGr;
        //glQuickMap["save;transform;drawNodes;restore;"] = save_transform_drawNodes_restore;
        //glQuickMap["save;transform;drawLayaGL;restore;"] = save_alpha_transform_drawLayaGL_restore;
        //glQuickMap["save;alpha;transform;drawLayaGL;restore;"] = save_alpha_transform_drawLayaGL_restore;
        //glQuickMap["save;alpha;transform;drawLayaGL;restore;"] = save_alpha_transform_drawLayaGL_restore;
        //map[SpriteConst.TEXTURE] = _drawTexture;
        LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.TRANSFORM | SpriteConst.GRAPHICS] = LayaGLQuickRunner.alpha_transform_drawLayaGL;
        //map[ SpriteConst.GRAPHICS] = _drawLayaGL;
        LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.GRAPHICS] = LayaGLQuickRunner.alpha_drawLayaGL;
        LayaGLQuickRunner.map[SpriteConst.TRANSFORM | SpriteConst.GRAPHICS] = LayaGLQuickRunner.transform_drawLayaGL;
        LayaGLQuickRunner.map[SpriteConst.TRANSFORM | SpriteConst.CHILDS] = LayaGLQuickRunner.transform_drawNodes;

        LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.TRANSFORM | SpriteConst.TEXTURE] = LayaGLQuickRunner.alpha_transform_drawTexture;
        LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.TEXTURE] = LayaGLQuickRunner.alpha_drawTexture;
        LayaGLQuickRunner.map[SpriteConst.TRANSFORM | SpriteConst.TEXTURE] = LayaGLQuickRunner.transform_drawTexture;
        LayaGLQuickRunner.map[SpriteConst.GRAPHICS | SpriteConst.CHILDS] = LayaGLQuickRunner.drawLayaGL_drawNodes;
    }

    static transform_drawTexture(sprite: Sprite, context: Context, x: number, y: number): void {
        var style: SpriteStyle = sprite._style;
        var tex: Texture = sprite.texture;


        /*
        var ctx:WebGLContext2D = context as WebGLContext2D;
        var ctxm:Matrix = ctx._curMat;
        ctxm.copyTo(curMat);
        //context.saveTransform(curMat);
        ctx.transformByMatrixNoSave(sprite.getTransform(), x, y);
        ctx.drawTexture(tex, -style.pivotX, -style.pivotY, sprite._width || tex.width, sprite._height || tex.height);
        curMat.copyTo(ctxm);
        //ctx.restoreTransform(curMat);
        */

        context.saveTransform(LayaGLQuickRunner.curMat);
        context.transformByMatrix(sprite.transform, x, y);

        var width:number = sprite._width || tex.sourceWidth;
        var height:number = sprite._height || tex.sourceHeight;
        var wRate:number = width / tex.sourceWidth;
        var hRate:number = height / tex.sourceHeight;
        width = tex.width * wRate;
        height = tex.height * hRate;
        if (width <= 0 || height <= 0) return null;
        var px: number = -sprite.pivotX + tex.offsetX * wRate;
        var py: number = -sprite.pivotY + tex.offsetY * hRate;
        context.drawTexture(tex, px, py, width, height);

        context.restoreTransform(LayaGLQuickRunner.curMat);

        /*
        context.saveTransform(curMat);
        var w:int = sprite._width || tex.width;
        var h:int = sprite._height || tex.height;
        var mat:Matrix = sprite.transform;// (sprite as Object)._tfChanged?(sprite as Object)._adjustTransform():(sprite as Object)._transform;
        mat.tx += x; mat.ty += y;
        //(context as WebGLContext2D).drawTextureWithTransform(tex, -style.pivotX, -style.pivotY, w, h,mat,x,y,1,null,null);
    	
        var ctx:WebGLContext2D = context;
        var curMat:Matrix = ctx._curMat;
        var tmpMat:Matrix = ctx._tmpMatrix;
        var transform = mat;
        //克隆transform,因为要应用tx，ty，这里不能修改原始的transform
        tmpMat.a = transform.a; tmpMat.b = transform.b; tmpMat.c = transform.c; tmpMat.d = transform.d; tmpMat.tx = transform.tx + x; tmpMat.ty = transform.ty + y;
        tmpMat._bTransform = transform._bTransform;
        if (transform && curMat._bTransform) {
            Matrix.mul(tmpMat, curMat, tmpMat);
            transform = tmpMat;
            transform._bTransform = true;
        }else {
            //如果curmat没有旋转。
            transform = tmpMat;
        }
        ctx._drawTextureM(tex, x, y, w,h, mat, 1,null);
    	
        //var st = __JS__("performance.now()");
        //Laya.stage.perfdt += (__JS__("performance.now()")-st);
        context.restoreTransform(curMat);
        */
    }

    //static public function _drawTexture(sprite:Sprite, context:Context, x:Number, y:Number):void {
    //var tex:Texture = sprite.texture;
    //context.drawTexture(tex, x-sprite.pivotX, y-sprite.pivotY, sprite._width || tex.width, sprite._height || tex.height);
    //}

    static alpha_drawTexture(sprite: Sprite, context: Context, x: number, y: number): void {
        var style: SpriteStyle = sprite._style;
        var alpha: number;
        var tex: Texture = sprite.texture;
        if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
            var temp: number = context.globalAlpha;
            context.globalAlpha *= alpha;
            var width: number = sprite._width || tex.width;
            var height: number = sprite._height || tex.height;
            var wRate: number = width / tex.sourceWidth;
            var hRate: number = height / tex.sourceHeight;
            width = tex.width * wRate;
            height = tex.height * hRate;
            if (width <= 0 || height <= 0) return null;
            var px: number = x - style.pivotX + tex.offsetX * wRate;
            var py: number = y - style.pivotY + tex.offsetY * hRate;
            context.drawTexture(tex, px, py, width, height);
            context.globalAlpha = temp;
        }
    }

    static alpha_transform_drawTexture(sprite: Sprite, context: Context, x: number, y: number): void {
        var style: SpriteStyle = sprite._style;
        var alpha: number;
        var tex: Texture = sprite.texture;
        if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
            var temp: number = context.globalAlpha;
            context.globalAlpha *= alpha;

            context.saveTransform(LayaGLQuickRunner.curMat);
            context.transformByMatrix(sprite.transform, x, y);
            var width: number = sprite._width || tex.sourceWidth;
            var height: number = sprite._height || tex.sourceHeight;
            var wRate: number = width / tex.sourceWidth;
            var hRate: number = height / tex.sourceHeight;
            width = tex.width * wRate;
            height = tex.height * hRate;
            if (width <= 0 || height <= 0) return null;
            var px: number = -style.pivotX + tex.offsetX * wRate;
            var py: number = -style.pivotY + tex.offsetY * hRate;
            context.drawTexture(tex, px, py, width, height);
            context.restoreTransform(LayaGLQuickRunner.curMat);

            context.globalAlpha = temp;
        }
    }

    static alpha_transform_drawLayaGL(sprite: Sprite, context: Context, x: number, y: number): void {
        var style: SpriteStyle = sprite._style;
        var alpha: number;
        if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
            var temp: number = context.globalAlpha;
            context.globalAlpha *= alpha;

            context.saveTransform(LayaGLQuickRunner.curMat);
            context.transformByMatrix(sprite.transform, x, y);
            sprite._graphics && sprite._graphics._render(sprite, context, -style.pivotX, -style.pivotY);
            context.restoreTransform(LayaGLQuickRunner.curMat);

            context.globalAlpha = temp;
        }
    }

    static alpha_drawLayaGL(sprite: Sprite, context: Context, x: number, y: number): void {
        var style: SpriteStyle = sprite._style;
        var alpha: number;
        if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
            var temp: number = context.globalAlpha;
            context.globalAlpha *= alpha;
            sprite._graphics && sprite._graphics._render(sprite, context, x - style.pivotX, y - style.pivotY);
            context.globalAlpha = temp;
        }
    }

    //static public function _drawLayaGL(sprite:Sprite, context:Context, x:Number, y:Number):void {
    //sprite._graphics._render(sprite, context, x, y);
    //}		

    static transform_drawLayaGL(sprite: Sprite, context: Context, x: number, y: number): void {
        var style: SpriteStyle = sprite._style;
        //var transform:Matrix = sprite.transform;

        //临时
        //if (transform) {
        context.saveTransform(LayaGLQuickRunner.curMat);
        context.transformByMatrix(sprite.transform, x, y);
        sprite._graphics && sprite._graphics._render(sprite, context, -style.pivotX, -style.pivotY);
        context.restoreTransform(LayaGLQuickRunner.curMat);
        //}else {
        //sprite._graphics && sprite._graphics._render(sprite, context, -style.pivotX, -style.pivotY);
        //}			
    }

    static transform_drawNodes(sprite: Sprite, context: Context, x: number, y: number): void {
        //var transform:Matrix = sprite.transform;
        var textLastRender: boolean = sprite._getBit(Const.DRAWCALL_OPTIMIZE) && context.drawCallOptimize(true);

        var style: SpriteStyle = sprite._style;
        context.saveTransform(LayaGLQuickRunner.curMat);
        context.transformByMatrix(sprite.transform, x, y);

        //x = x-style.pivotX;
        //y = y - style.pivotY;

        x = -style.pivotX;
        y = -style.pivotY;

        var childs: any[] = sprite._children, n: number = childs.length, ele: any;
        if (style.viewport) {
            var rect: Rectangle = style.viewport;
            var left: number = rect.x;
            var top: number = rect.y;
            var right: number = rect.right;
            var bottom: number = rect.bottom;
            var _x: number, _y: number;

            for (i = 0; i < n; ++i) {
                if ((ele = (<Sprite>childs[i]))._visible && ((_x = ele._x) < right && (_x + ele.width) > left && (_y = ele._y) < bottom && (_y + ele.height) > top)) {
                    ele.render(context, x, y);
                }
            }
        } else {
            for (var i: number = 0; i < n; ++i)
                (ele = ((<Sprite>childs[i])))._visible && ele.render(context, x, y);
        }

        context.restoreTransform(LayaGLQuickRunner.curMat);
        textLastRender && context.drawCallOptimize(false);
    }

    static drawLayaGL_drawNodes(sprite: Sprite, context: Context, x: number, y: number): void {

        var textLastRender: boolean = sprite._getBit(Const.DRAWCALL_OPTIMIZE) && context.drawCallOptimize(true);

        var style: SpriteStyle = sprite._style;
        x = x - style.pivotX;
        y = y - style.pivotY;
        sprite._graphics && sprite._graphics._render(sprite, context, x, y);

        var childs: any[] = sprite._children, n: number = childs.length, ele: any;
        if (style.viewport) {
            var rect: Rectangle = style.viewport;
            var left: number = rect.x;
            var top: number = rect.y;
            var right: number = rect.right;
            var bottom: number = rect.bottom;
            var _x: number, _y: number;

            for (i = 0; i < n; ++i) {
                if ((ele = (<Sprite>childs[i]))._visible && ((_x = ele._x) < right && (_x + ele.width) > left && (_y = ele._y) < bottom && (_y + ele.height) > top)) {
                    ele.render(context, x, y);
                }
            }
        } else {
            for (var i: number = 0; i < n; ++i)
                (ele = ((<Sprite>childs[i])))._visible && ele.render(context, x, y);
        }

        textLastRender && context.drawCallOptimize(false);
    }
}

