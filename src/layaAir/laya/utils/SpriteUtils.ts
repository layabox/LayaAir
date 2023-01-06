import { ILaya } from "../../ILaya";
import { Sprite } from "../display/Sprite";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Utils } from "./Utils";

export class SpriteUtils {
    /**
     * @private
     * 根据传入的显示对象 <code>Sprite</code> 和此显示对象上的 两个点，返回此对象上的两个点在舞台坐标系上组成的最小的矩形区域对象。
     * @param	sprite 显示对象 <code>Sprite</code>。
     * @param	x0	点一的 X 轴坐标点。
     * @param	y0	点一的 Y 轴坐标点。
     * @param	x1	点二的 X 轴坐标点。
     * @param	y1	点二的 Y 轴坐标点。
     * @return 两个点在舞台坐标系组成的矩形对象 <code>Rectangle</code>。
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
     * 计算传入的显示对象 <code>Sprite</code> 的全局坐标系的坐标和缩放值，返回 <code>Rectangle</code> 对象存放计算出的坐标X值、Y值、ScaleX值、ScaleY值。
     * @param	sprite <code>Sprite</code> 对象。
     * @return  矩形对象 <code>Rectangle</code>
     */
    static getGlobalPosAndScale(sprite: Sprite): Rectangle {
        return SpriteUtils.getGlobalRecByPoints(sprite, 0, 0, 1, 1);
    }

    /**
    * 获取指定区域内相对于窗口左上角的transform。
    * @param	coordinateSpace	坐标空间，不能是Stage引用
    * @param	x				相对于coordinateSpace的x坐标
    * @param	y				相对于coordinateSpace的y坐标
    * @return
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
     * 使DOM元素使用舞台内的某块区域内。
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
     * 对传入的数组列表，根据子项的属性 Z 值进行重新排序。返回是否已重新排序的 Boolean 值。
     * @param	array 子对象数组。
     * @return	Boolean 值，表示是否已重新排序。
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