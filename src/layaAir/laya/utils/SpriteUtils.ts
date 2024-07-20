import { ILaya } from "../../ILaya";
import { Sprite } from "../display/Sprite";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Utils } from "./Utils";

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
     * @param	sprite Sprite 对象。
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
     * @param	coordinateSpace	坐标空间，不能是Stage引用
     * @param	x				相对于coordinateSpace的x坐标
     * @param	y				相对于coordinateSpace的y坐标
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
     * @param	dom				DOM元素引用
     * @param	coordinateSpace	坐标空间，不能是Stage引用
     * @param	x				相对于coordinateSpace的x坐标
     * @param	y				相对于coordinateSpace的y坐标
     * @param	width			宽度
     * @param	height			高度
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
     * @private
     * @en Reorders the passed array of items based on the Z property of the child items.
     * Returns a Boolean value indicating whether the array has been reordered.
     * @param array The array of child objects.
     * @return A Boolean value indicating if the array has been reordered.
     * @zh 根据子项的 Z 属性值对传入的数组列表进行重新排序。
     * 返回一个 Boolean 值，表示是否已重新排序。
     * @param array 子对象数组。
     * @return Boolean 值，表示是否已重新排序。
     */
    static updateOrder(array: any[]): boolean {
        if (!array || array.length < 2) return false;
        var i: number = 1, j: number, len: number = array.length, key: number, c: Sprite;
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
}