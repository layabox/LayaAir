import { ILaya } from "../../ILaya";
import { Sprite } from "../display/Sprite";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";

export class SpriteUtils {
    /**
     * @private
     * @en Returns the smallest rectangular area object composed of two points on the stage coordinate system for the given display object Sprite.
     * @param sprite The display object Sprite.
     * @param x0 The X-axis coordinate of the first point.
     * @param y0 The Y-axis coordinate of the first point.
     * @param x1 The X-axis coordinate of the second point.
     * @param y1 The Y-axis coordinate of the second point.
     * @return The rectangle object Rectangle composed of the two points on the stage coordinate system.
     * @zh 根据传入的显示对象 Sprite 和此显示对象上的两个点，返回这两点在舞台坐标系上组成的最小矩形区域对象。
     * @param sprite 显示对象 Sprite。
     * @param x0 点一的 X 轴坐标。
     * @param y0 点一的 Y 轴坐标。
     * @param x1 点二的 X 轴坐标。
     * @param y1 点二的 Y 轴坐标。
     * @return 两个点在舞台坐标系组成的矩形对象 Rectangle。
     */
    static getGlobalRecByPoints(sprite: Sprite, x0: number, y0: number, x1: number, y1: number): Rectangle {
        var newLTPoint: Point;
        newLTPoint = Point.create().setTo(x0, y0);
        newLTPoint = sprite.localToGlobal(newLTPoint);
        var newRBPoint: Point;
        newRBPoint = Point.create().setTo(x1, y1);
        newRBPoint = sprite.localToGlobal(newRBPoint);
        var rst: Rectangle = Rectangle._getWrapRec([newLTPoint.x, newLTPoint.y, newRBPoint.x, newRBPoint.y]);
        newLTPoint.recover();
        newRBPoint.recover();
        return rst;
    }

    /**
     * @en Calculates the global coordinates and scaling values of the specified Sprite display object, and returns a Rectangle object containing the calculated X and Y coordinates as well as the scaleX and scaleY values.
     * @param sprite The Sprite object to calculate.
     * @returns The Rectangle object with the calculated values.
     * @zh 计算传入的显示对象 Sprite 在全局坐标系中的坐标和缩放值，返回一个 Rectangle 对象，存放计算出的坐标 X 值、Y 值、ScaleX 值和 ScaleY 值。
     * @param sprite Sprite 对象。
     * @return  矩形对象 Rectangle。
     */
    static getGlobalPosAndScale(sprite: Sprite): Rectangle {
        return SpriteUtils.getGlobalRecByPoints(sprite, 0, 0, 1, 1);
    }

    /**
     * @en Retrieves the transform of a specified area relative to the top-left corner of the window.
     * @param coordinateSpace The coordinate space, must not be a Stage reference.
     * @param x The x coordinate relative to the `coordinateSpace`.
     * @param y The y coordinate relative to the `coordinateSpace`.
     * @returns An object containing the transformed x, y coordinates, and scale factor.
     * @zh 获取指定区域内相对于窗口左上角的transform。
     * @param coordinateSpace	坐标空间，不能是Stage引用
     * @param x				相对于coordinateSpace的x坐标
     * @param y				相对于coordinateSpace的y坐标
     * @returns 包含转换后的x、y坐标以及缩放因子的对象
     */
    static getTransformRelativeToWindow(coordinateSpace: Sprite, x: number, y: number): any {
        var stage = ILaya.stage;

        // coordinateSpace的全局缩放、坐标
        var globalTransform: Rectangle = SpriteUtils.getGlobalPosAndScale(coordinateSpace);
        // canvas的transform矩阵
        var canvasMatrix: Matrix = stage._canvasTransform.clone();
        // 在矩阵变化前前记录的canvas的坐标
        var canvasLeft: number = canvasMatrix.tx;
        var canvasTop: number = canvasMatrix.ty;

        // 把矩阵转回0度，得到正确的画布缩放比
        canvasMatrix.rotate(-Math.PI / 180 * stage.canvasDegree);
        // 组合画布缩放和舞台适配缩放
        canvasMatrix.scale(stage.clientScaleX, stage.clientScaleY);
        // 画布是否处于正常角度的垂直角度，-90或90度
        var perpendicular: boolean = (stage.canvasDegree % 180 != 0);
        var tx: number, ty: number;

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

        // Safari兼容
        ty += stage['_safariOffsetY'];

        // 组合画布缩放和舞台适配缩放以及显示对象缩放，得到DOM原因的缩放因子
        var domScaleX: number, domScaleY: number;
        if (perpendicular) {
            domScaleX = canvasMatrix.d * globalTransform.height;
            domScaleY = canvasMatrix.a * globalTransform.width;
        } else {
            domScaleX = canvasMatrix.a * globalTransform.width;
            domScaleY = canvasMatrix.d * globalTransform.height;
        }

        return { x: tx, y: ty, scaleX: domScaleX, scaleY: domScaleY };
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
     * @param dom				DOM元素引用
     * @param coordinateSpace	坐标空间，不能是Stage引用
     * @param x				相对于coordinateSpace的x坐标
     * @param y				相对于coordinateSpace的y坐标
     * @param width			宽度
     * @param height			高度
     */
    static fitDOMElementInArea(dom: any, coordinateSpace: Sprite, x: number, y: number, width: number, height: number): void {
        if (!dom._fitLayaAirInitialized) {
            dom._fitLayaAirInitialized = true;
            dom.style.transformOrigin = dom.style.webKittransformOrigin = "left top";
            dom.style.position = "absolute"
        }

        var transform: any = SpriteUtils.getTransformRelativeToWindow(coordinateSpace, x, y);

        // 设置dom样式
        dom.style.transform = dom.style.webkitTransform = "scale(" + transform.scaleX + "," + transform.scaleY + ") rotate(" + (ILaya.stage.canvasDegree) + "deg)";
        dom.style.width = width + 'px';
        dom.style.height = height + 'px';
        dom.style.left = transform.x + 'px';
        dom.style.top = transform.y + 'px';
    }


    /**
     * @internal
     * @en Reorders the passed array of items based on the Z property of the child items.
     * Returns a Boolean value indicating whether the array has been reordered.
     * @param array The array of child objects.
     * @return A Boolean value indicating if the array has been reordered.
     * @zh 根据子项的 Z 属性值对传入的数组列表进行重新排序。
     * 返回一个 Boolean 值，表示是否已重新排序。
     * @param array 子对象数组。
     * @return Boolean 值，表示是否已重新排序。
     */
    static updateOrder(array: Array<Sprite>): boolean {
        if (!array || array.length < 2) return false;
        let i: number = 1, j: number, len: number = array.length, key: number, c: Sprite;
        while (i < len) {
            j = i;
            c = array[j];
            key = array[j]._zOrder;
            while (--j > -1) {
                if (array[j]._zOrder > key) array[j + 1] = array[j];
                else break;
            }
            array[j + 1] = c;
            i++;
        }
        return true;
    }

    static localToGlobalRect(sp: Sprite, rect: Rectangle): Rectangle {
        let pt = sp.localToGlobal(Point.TEMP.setTo(rect.x, rect.y));
        let x = pt.x;
        let y = pt.y;
        sp.localToGlobal(pt.setTo(rect.right, rect.bottom));
        return rect.setTo(x, y, x + pt.x, y + pt.y);
    }

    static globalToLocalRect(sp: Sprite, rect: Rectangle): Rectangle {
        let pt = sp.globalToLocal(Point.TEMP.setTo(rect.x, rect.y));
        let x = pt.x;
        let y = pt.y;
        sp.globalToLocal(pt.setTo(rect.right, rect.bottom));
        return rect.setTo(x, y, x + pt.x, y + pt.y);
    }

    static transformRect(sp: Sprite, rect: Rectangle, targetSpace?: Sprite): Rectangle {
        let pt = sp.localToGlobal(Point.TEMP.setTo(rect.x, rect.y), false, targetSpace);
        let x = pt.x;
        let y = pt.y;

        sp.localToGlobal(pt.setTo(rect.right, rect.bottom), false, targetSpace);
        return rect.setTo(x, y, x + pt.x, y + pt.y);
    }

    static getMaskRect(sprite: Sprite, out:Rectangle) {
        let mask = sprite.mask;
        let cache = sprite._getCacheStyle();

         /**
         * 这里比较绕，需要解释一下
         * 目前的做法是把sprite的rect和mask的rect都转到sprite的原始原点（左上角）空间，这里叫做TextureSpace，简称t空间
         * 然后在t空间做rect交集
         */
        cache._calculateCacheRect(sprite, "bitmap", 0, 0);
        //保存rect，避免被修改。例如 RenderSprite.RenderToCacheTexture 会修改cache的rect
        spRect_TEMP.copyFrom(cache.cacheRect);
        if (spRect_TEMP.width <= 0 || spRect_TEMP.height <= 0)
            return;
        //转到sprite的原始空间
        spRect_TEMP.x += sprite.pivotX;
        spRect_TEMP.y += sprite.pivotY;

        //这个时候获得的rect是包含pivot的。下面的mask按照规则是作为sprite的子来计算，但是，他的位置是相对于原始位置
        //而不是pivot，所以需要根据mask的pivot调整mask的rect的位置

        //TODO mask如果非常简单，就不要先渲染到texture上
        let maskcache = mask._getCacheStyle();
        maskcache._calculateCacheRect(mask, "bitmap", 0, 0);  //后面的参数传入mask.xy没有效果，只能后面自己单独加上
        //保存rect，避免被修改。例如 RenderSprite.RenderToCacheTexture 会修改cache的rect
        maskRect_TEMP.copyFrom(maskcache.cacheRect);
        //maskRect是mask自己的,相对于自己的锚点，要转到sprite原始空间
        //把mask的xy应用一下，就是在sprite原始空间（t空间）的位置
        maskRect_TEMP.x += mask._x;
        maskRect_TEMP.y += mask._y;

        //计算cache画布的大小，就是两个rect的交集，这个交集作为渲染区域。t空间
        let x1 = Math.max(spRect_TEMP.x, maskRect_TEMP.x);
        let y1 = Math.max(spRect_TEMP.y, maskRect_TEMP.y);
        let x2 = Math.min(spRect_TEMP.x + spRect_TEMP.width, maskRect_TEMP.x + maskRect_TEMP.width);
        let y2 = Math.min(spRect_TEMP.y + spRect_TEMP.height, maskRect_TEMP.y + maskRect_TEMP.height);

        let width1 = x2 - x1;
        let height1 = y2 - y1;
        out.x = x1;
        out.y = y1;
        out.width = width1;
        out.height = height1;
    }
}

const spRect_TEMP = new Rectangle();
const maskRect_TEMP = new Rectangle();