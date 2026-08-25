import { ILaya } from "../../ILaya";
import { Sprite } from "../display/Sprite";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { PAL } from "../platform/PlatformAdapters";

/**
 * @en The SpriteUtils class provides utility methods for working with Sprite objects in LayaAir.
 * @zh SpriteUtils 类提供了用于处理 LayaAir 中的 Sprite 对象的实用方法。
 * @blueprintable
 */
export class SpriteUtils {
    /**
     * @en Returns the smallest rectangular area object composed of two points on the stage coordinate system for the given display object Sprite.
     * @param sprite The display object Sprite.
     * @param x0 The X-axis coordinate of the first point.
     * @param y0 The Y-axis coordinate of the first point.
     * @param x1 The X-axis coordinate of the second point.
     * @param y1 The Y-axis coordinate of the second point.
     * @param out The rectangle object to be returned. If not provided, a new rectangle object will be created.
     * @return The rectangle object Rectangle composed of the two points on the stage coordinate system.
     * @zh 根据传入的显示对象 Sprite 和此显示对象上的两个点，返回这两点在舞台坐标系上组成的最小矩形区域对象。
     * @param sprite 显示对象 Sprite。
     * @param x0 点一的 X 轴坐标。
     * @param y0 点一的 Y 轴坐标。
     * @param x1 点二的 X 轴坐标。
     * @param y1 点二的 Y 轴坐标。
     * @param out 返回的矩形对象。如果不提供，则创建一个新的矩形对象。
     * @return 两个点在舞台坐标系组成的矩形对象 Rectangle。
     * @blueprintIgnore
     */
    static getGlobalRecByPoints(sprite: Sprite, x0: number, y0: number, x1: number, y1: number, out?: Rectangle): Rectangle {
        let newLTPoint: Point;
        newLTPoint = Point.create().setTo(x0, y0);
        newLTPoint = sprite.localToGlobal(newLTPoint);
        let newRBPoint: Point;
        newRBPoint = Point.create().setTo(x1, y1);
        newRBPoint = sprite.localToGlobal(newRBPoint);
        let rst = Rectangle._getWrapRec([newLTPoint.x, newLTPoint.y, newRBPoint.x, newRBPoint.y], out);
        newLTPoint.recover();
        newRBPoint.recover();
        return rst;
    }

    /**
     * @en Calculates the global coordinates and scaling values of the specified Sprite display object, and returns a object containing the calculated X and Y coordinates as well as the scaleX and scaleY values.
     * @param sprite The Sprite object to calculate.
     * @returns The object with the calculated values.
     * @zh 计算传入的显示对象 Sprite 在全局坐标系中的坐标和缩放值，返回一个对象，存放计算出的坐标 X 值、Y 值、ScaleX 值和 ScaleY 值。
     * @param sprite Sprite 对象。
     * @return 包含计算出的坐标 X 值、Y 值、ScaleX 值和 ScaleY 值的对象。
     * @blueprintIgnore
     */
    static getGlobalPosAndScale(sprite: Sprite): { x: number, y: number, scaleX: number, scaleY: number } {
        let tmpRect = Rectangle.create();
        SpriteUtils.getGlobalRecByPoints(sprite, 0, 0, 1, 1, tmpRect);
        let ret = { x: tmpRect.x, y: tmpRect.y, scaleX: tmpRect.width, scaleY: tmpRect.height };
        tmpRect.recover();
        return ret;
    }

    /**
     * @en Retrieves the transform of a specified area relative to the top-left corner of the window.
     * @param coordinateSpace The coordinate space, must not be a Stage reference.
     * @param x The x coordinate relative to the `coordinateSpace`.
     * @param y The y coordinate relative to the `coordinateSpace`.
     * @returns An object containing the transformed x, y coordinates, and scale factor.
     * @zh 获取指定区域内相对于窗口左上角的transform。
     * @param coordinateSpace	坐标空间，不能是Stage引用
     * @param x 相对于coordinateSpace的x坐标
     * @param y 相对于coordinateSpace的y坐标
     * @returns 包含转换后的x、y坐标以及缩放因子的对象
     * @blueprintIgnore
     */
    static getTransformRelativeToWindow(coordinateSpace: Sprite, x: number, y: number): { x: number, y: number, scaleX: number, scaleY: number } {
        let stage = ILaya.stage;

        // coordinateSpace的全局缩放、坐标
        let globalTransform = SpriteUtils.getGlobalPosAndScale(coordinateSpace);

        // canvas的transform矩阵
        let canvasMatrix = Matrix.create();
        stage._canvasTransform.copyTo(canvasMatrix);
        // 在矩阵变化前前记录的canvas的坐标
        let canvasLeft: number = canvasMatrix.tx;
        let canvasTop: number = canvasMatrix.ty;

        // 把矩阵转回0度，得到正确的画布缩放比
        canvasMatrix.rotate(-Math.PI / 180 * stage.canvasDegree);
        // 组合画布缩放和舞台适配缩放
        canvasMatrix.scale(stage.clientScaleX, stage.clientScaleY);
        // 画布是否处于正常角度的垂直角度，-90或90度
        let perpendicular: boolean = (stage.canvasDegree % 180 != 0);
        let tx: number, ty: number;

        if (perpendicular) {
            // 在舞台上的坐标
            tx = y + globalTransform.y;
            ty = x + globalTransform.x;

            // 在画布上的坐标
            tx *= canvasMatrix.d;
            ty *= canvasMatrix.a;

            // 设置了screenMode = horizontal
            if (stage.canvasDegree == 90) {
                // 在浏览器窗口上的坐标
                // 此时画布的left是视觉上的right，画布的left是视觉上的top
                tx = canvasLeft - tx;
                ty += canvasTop;
            }
            // screenMode = vertical并且设备在横屏状态，画布旋转-90度
            else {
                // 在浏览器窗口上的坐标
                // 此时画布的left是视觉上的left，画布的top是视觉上的bottom
                tx += canvasLeft;
                ty = canvasTop - ty;
            }
        }
        // 没有canvas旋转
        else {
            // 在舞台上的坐标
            tx = x + globalTransform.x;
            ty = y + globalTransform.y;

            // 在画布上的坐标
            tx *= canvasMatrix.a;
            ty *= canvasMatrix.d;

            // 在浏览器窗口上的坐标
            tx += canvasLeft;
            ty += canvasTop;
        }

        // 组合画布缩放和舞台适配缩放以及显示对象缩放，得到DOM原因的缩放因子
        let domScaleX: number, domScaleY: number;
        if (perpendicular) {
            domScaleX = canvasMatrix.d * globalTransform.scaleY;
            domScaleY = canvasMatrix.a * globalTransform.scaleX;
        } else {
            domScaleX = canvasMatrix.a * globalTransform.scaleX;
            domScaleY = canvasMatrix.d * globalTransform.scaleY;
        }

        canvasMatrix.recover();

        globalTransform.x = Math.round(tx);
        globalTransform.y = Math.round(ty);
        globalTransform.scaleX = Math.round(domScaleX * 100000) / 100000;
        globalTransform.scaleY = Math.round(domScaleY * 100000) / 100000;

        return globalTransform;
    }

    /**
     * @en Make a DOM element fit within a specific area of the stage.
     * @param dom The reference to the DOM element.
     * @param coordinateSpace The coordinate space. It should not be a reference to Stage.
     * @param x The x coordinate relative to the coordinateSpace.
     * @param y The y coordinate relative to the coordinateSpace.
     * @param width The width of the area.
     * @param height The height of the area.
     * @zh 使DOM元素适应舞台内指定区域。
     * @param dom DOM元素引用
     * @param coordinateSpace 坐标空间，不能是Stage引用
     * @param x 相对于coordinateSpace的x坐标
     * @param y 相对于coordinateSpace的y坐标
     * @param width 宽度
     * @param height 高度
     * @blueprintIgnore
     */
    static fitDOMElementInArea(dom: any, coordinateSpace: Sprite, x: number, y: number, width: number, height: number): void {
        if (!dom._fitLayaAirInitialized) {
            dom._fitLayaAirInitialized = true;
            PAL.browser.setStyleTransformOrigin(dom.style, "left top");
            dom.style.position = "absolute";
        }

        let transform = SpriteUtils.getTransformRelativeToWindow(coordinateSpace, x, y);

        // 设置dom样式
        PAL.browser.setStyleTransform(dom.style, "scale(" + transform.scaleX + "," + transform.scaleY + ") rotate(" + (ILaya.stage.canvasDegree) + "deg)");
        dom.style.width = width + 'px';
        dom.style.height = height + 'px';
        dom.style.left = transform.x + 'px';
        dom.style.top = transform.y + 'px';
    }

    /**
     * @en Converts a rectangle from local coordinates to global coordinates.
     * @param sp The Sprite object whose local rectangle is to be converted. 
     * @param rect The local rectangle to be converted. 
     * @param out An optional Rectangle object to store the result. If not provided, a new Rectangle object will be created.
     * @returns The converted rectangle in global coordinates.
     * @zh 将矩形从本地坐标转换为全局坐标。
     * @param sp 要转换本地矩形的 Sprite 对象。
     * @param rect 要转换的本地矩形。
     * @param out 可选的 Rectangle 对象，用于存储结果。如果未提供，将创建一个新的 Rectangle 对象。
     * @returns 转换结果。 
     */
    static localToGlobalRect(sp: Sprite, rect: Rectangle, out?: Rectangle): Rectangle {
        out = out || Rectangle.create();
        let pt = sp.localToGlobal(Point.TEMP.setTo(rect.x, rect.y));
        let x = pt.x;
        let y = pt.y;
        sp.localToGlobal(pt.setTo(rect.right, rect.bottom));
        return out.setTo(x, y, pt.x - x, pt.y - y);
    }

    /**
     * @en Converts a rectangle from global coordinates to local coordinates.
     * @param sp The Sprite object whose global rectangle is to be converted. 
     * @param rect The global rectangle to be converted. 
     * @param out An optional Rectangle object to store the result. If not provided, a new Rectangle object will be created.
     * @returns The converted rectangle in local coordinates.
     * @zh 将矩形从全局坐标转换为本地坐标。
     * @param sp 要转换全局矩形的 Sprite 对象。
     * @param rect 要转换的全局矩形。
     * @param out 可选的 Rectangle 对象，用于存储结果。如果未提供，将创建一个新的 Rectangle 对象。
     * @returns 转换结果。
     */
    static globalToLocalRect(sp: Sprite, rect: Rectangle, out?: Rectangle): Rectangle {
        out = out || Rectangle.create();
        let pt = sp.globalToLocal(Point.TEMP.setTo(rect.x, rect.y));
        let x = pt.x;
        let y = pt.y;
        sp.globalToLocal(pt.setTo(rect.right, rect.bottom));
        return out.setTo(x, y, pt.x - x, pt.y - y);
    }

    /**
     * @en Transforms a rectangle from the local coordinate space of a Sprite to another target coordinate space.
     * @param sp The Sprite object whose local rectangle is to be transformed. 
     * @param rect The local rectangle to be transformed. 
     * @param targetSpace The target Sprite object representing the coordinate space to which the rectangle should be transformed. If not provided, the transformation will be done in the global coordinate space. 
     * @param out An optional Rectangle object to store the result. If not provided, a new Rectangle object will be created.
     * @returns The transformed rectangle in the target coordinate space.
     * @zh 将矩形从 Sprite 的本地坐标空间转换为另一个目标坐标空间。
     * @param sp 要转换本地矩形的 Sprite 对象。
     * @param rect 要转换的本地矩形。
     * @param targetSpace 目标 Sprite 对象，表示矩形应转换到的坐标空间。如果未提供，则转换将在全局坐标空间中进行。
     * @returns 转换结果。 
     */
    static transformRect(sp: Sprite, rect: Rectangle, targetSpace?: Sprite, out?: Rectangle): Rectangle {
        targetSpace = targetSpace || ILaya.stage;

        tmpPoints.length = 0;
        rect.getBoundPoints(tmpPoints);

        if (targetSpace === sp._parent) {
            for (let i = 0, n = tmpPoints.length; i < n; i += 2) {
                let pt = sp.toParentPoint(Point.TEMP.setTo(tmpPoints[i], tmpPoints[i + 1]));
                tmpPoints[i] = pt.x;
                tmpPoints[i + 1] = pt.y;
            }
        }
        else {
            for (let i = 0, n = tmpPoints.length; i < n; i += 2) {
                let pt = sp.localToGlobal(Point.TEMP.setTo(tmpPoints[i], tmpPoints[i + 1]));
                targetSpace.globalToLocal(pt);
                tmpPoints[i] = pt.x;
                tmpPoints[i + 1] = pt.y;
            }
        }

        return Rectangle._getWrapRec(tmpPoints, out);
    }

    /**
     * @en Retrieves the rectangle that bounds the sprite, based on the sprite's own coordinate space.
     * @param sprite The Sprite object for which to retrieve the bounding rectangle.
     * @param sizeOnly If true, only the size of the sprite is considered, ignoring the graphics and children. Default is true.
     * @param out An optional Rectangle object to store the result. If not provided, a new Rectangle object will be created.
     * @returns A Rectangle object representing the bounding rectangle of the sprite.
     * @zh 获取包含精灵的边界矩形，基于精灵自身的坐标空间。
     * @param sprite 要获取边界矩形的 Sprite 对象。
     * @param sizeOnly 如果为 true，则仅考虑精灵的大小，忽略图形和子对象。默认值为 true。
     * @param out 可选的 Rectangle 对象，用于存储结果。如果未提供，将创建一个新的 Rectangle 对象。
     * @returns 一个 Rectangle 对象，表示精灵的边界矩形。
     */
    static getRect(sprite: Sprite, sizeOnly?: boolean, out?: Rectangle): Rectangle {
        out = out || Rectangle.create();

        if (sizeOnly == null || sizeOnly)
            out.setTo(0, 0, sprite.width, sprite.height);
        else
            sprite.getSelfBounds(out);

        out.x -= sprite.pivotX;
        out.y -= sprite.pivotY;

        //处理显示对象的scrollRect偏移
        if (sprite.scrollRect) {
            out.x -= sprite.scrollRect.x;
            out.y -= sprite.scrollRect.y;
        }

        out.x = Math.floor(out.x);
        out.y = Math.floor(out.y);
        out.width = Math.floor(out.width);
        out.height = Math.floor(out.height);

        if (out.width < 0)
            out.width = 0;
        if (out.height < 0)
            out.height = 0;

        return out;
    }

    /**
     * @en Sets the position and size of a Sprite based on a given rectangle.
     * @param sprite The Sprite object to set the position and size for.
     * @param rect The rectangle object containing the position and size to set.
     * @zh 根据给定的矩形设置 Sprite 的位置和大小。
     * @param sprite 要设置位置和大小的 Sprite 对象。 
     * @param rect 包含要设置的位置和大小的矩形对象。 
     */
    static setRect(sprite: Sprite, rect: Readonly<Rectangle>): void {
        sprite.size(rect.width, rect.height);
        sprite.pos(rect.x + sprite.pivotX, rect.y + sprite.pivotY);
    }

    /**
     * @en Get the bounding box of the child
     * @param recursive Whether to get the bounding box of the child object recursively
     * @param ignoreInvisibles Whether to ignore invisible objects
     * @param ignoreScale Whether to ignore scaling
     * @param out (Optional) Output object for calculation results
     * @returns Bounding box
     * @zh 获取孩子的包围盒
     * @param recursive 是否递归获取所有子对象的包围盒
     * @param ignoreInvisibles 是否忽略不可见对象 
     * @param ignoreScale 是否忽略缩放 
     * @param out （可选）计算结果输出对象 
     * @returns 包围盒
     */
    static getChildrenBounds(sprite: Sprite, recursive?: boolean, ignoreInvisibles?: boolean, ignoreScale?: boolean, out?: Rectangle): Rectangle {
        out = out || new Rectangle();
        out.setTo(0, 0, 0, 0);

        let children = recursive ? sprite._children : sprite._$children;
        for (let child of children) {
            if (ignoreInvisibles && !child._struct.enabled)
                continue;

            let w = child.width;
            let h = child.height;
            if (!ignoreScale) {
                w *= Math.abs(child._scaleX);
                h *= Math.abs(child._scaleY);
            }
            out.union(tmpRect.setTo(child._x - w * child._anchorX, child._y - h * child._anchorY, w, h), out);

            if (recursive && child._children.length > 0) {
                let rect = SpriteUtils.getChildrenBounds(child, recursive, ignoreInvisibles, ignoreScale);
                rect.x += child._x;
                rect.y += child._y;
                out.union(rect, out);
            }
        }
        return out;
    }
}

const tmpRect = new Rectangle();
const tmpPoints: Array<number> = [];
