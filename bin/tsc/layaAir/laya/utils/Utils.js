import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { ILaya } from "../../ILaya";
/**
 * <code>Utils</code> 是工具类。
 */
export class Utils {
    /**
     * 角度转弧度。
     * @param	angle 角度值。
     * @return	返回弧度值。
     */
    static toRadian(angle) {
        return angle * Utils._pi2;
    }
    /**
     * 弧度转换为角度。
     * @param	radian 弧度值。
     * @return	返回角度值。
     */
    static toAngle(radian) {
        return radian * Utils._pi;
    }
    /**
     * 将传入的 uint 类型颜色值转换为字符串型颜色值。
     * @param color 颜色值。
     * @return 字符串型颜色值。
     */
    static toHexColor(color) {
        if (color < 0 || isNaN(color))
            return null;
        var str = color.toString(16);
        while (str.length < 6)
            str = "0" + str;
        return "#" + str;
    }
    /**获取一个全局唯一ID。*/
    static getGID() {
        return Utils._gid++;
    }
    /**
     * @private
     * <p>连接数组。和array的concat相比，此方法不创建新对象</p>
     * <b>注意：</b>若 参数 a 不为空，则会改变参数 source 的值为连接后的数组。
     * @param	source 待连接的数组目标对象。
     * @param	array 待连接的数组对象。
     * @return 连接后的数组。
     */
    static concatArray(source, array) {
        if (!array)
            return source;
        if (!source)
            return array;
        var i, len = array.length;
        for (i = 0; i < len; i++) {
            source.push(array[i]);
        }
        return source;
    }
    /**
     * @private
     * 清空数组对象。
     * @param	array 数组。
     * @return	清空后的 array 对象。
     */
    static clearArray(array) {
        if (!array)
            return array;
        array.length = 0;
        return array;
    }
    /**
     * @private
     * 清空source数组，复制array数组的值。
     * @param	source 需要赋值的数组。
     * @param	array 新的数组值。
     * @return 	复制后的数据 source 。
     */
    static copyArray(source, array) {
        source || (source = []);
        if (!array)
            return source;
        source.length = array.length;
        var i, len = array.length;
        for (i = 0; i < len; i++) {
            source[i] = array[i];
        }
        return source;
    }
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
    static getGlobalRecByPoints(sprite, x0, y0, x1, y1) {
        var newLTPoint;
        newLTPoint = Point.create().setTo(x0, y0);
        newLTPoint = sprite.localToGlobal(newLTPoint);
        var newRBPoint;
        newRBPoint = Point.create().setTo(x1, y1);
        newRBPoint = sprite.localToGlobal(newRBPoint);
        var rst = Rectangle._getWrapRec([newLTPoint.x, newLTPoint.y, newRBPoint.x, newRBPoint.y]);
        newLTPoint.recover();
        newRBPoint.recover();
        return rst;
    }
    /**
     * 计算传入的显示对象 <code>Sprite</code> 的全局坐标系的坐标和缩放值，返回 <code>Rectangle</code> 对象存放计算出的坐标X值、Y值、ScaleX值、ScaleY值。
     * @param	sprite <code>Sprite</code> 对象。
     * @return  矩形对象 <code>Rectangle</code>
     */
    static getGlobalPosAndScale(sprite) {
        return Utils.getGlobalRecByPoints(sprite, 0, 0, 1, 1);
    }
    /**
     * 给传入的函数绑定作用域，返回绑定后的函数。
     * @param	fun 函数对象。
     * @param	scope 函数作用域。
     * @return 绑定后的函数。
     */
    static bind(fun, scope) {
        var rst = fun;
        rst = fun.bind(scope);
        ;
        return rst;
    }
    /**
     * @private
     * 对传入的数组列表，根据子项的属性 Z 值进行重新排序。返回是否已重新排序的 Boolean 值。
     * @param	array 子对象数组。
     * @return	Boolean 值，表示是否已重新排序。
     */
    static updateOrder(array) {
        if (!array || array.length < 2)
            return false;
        var i = 1, j, len = array.length, key, c;
        while (i < len) {
            j = i;
            c = array[j];
            key = array[j]._zOrder;
            while (--j > -1) {
                if (array[j]._zOrder > key)
                    array[j + 1] = array[j];
                else
                    break;
            }
            array[j + 1] = c;
            i++;
        }
        return true;
    }
    /**
     * @private
     * 批量移动点坐标。
     * @param points 坐标列表。
     * @param x x轴偏移量。
     * @param y y轴偏移量。
     */
    static transPointList(points, x, y) {
        var i, len = points.length;
        for (i = 0; i < len; i += 2) {
            points[i] += x;
            points[i + 1] += y;
        }
    }
    /**
     * 解析一个字符串，并返回一个整数。和JS原生的parseInt不同：如果str为空或者非数字，原生返回NaN，这里返回0。
     * @param	str		要被解析的字符串。
     * @param	radix	表示要解析的数字的基数。默认值为0，表示10进制，其他值介于 2 ~ 36 之间。如果它以 “0x” 或 “0X” 开头，将以 16 为基数。如果该参数不在上述范围内，则此方法返回 0。
     * @return	返回解析后的数字。
     */
    static parseInt(str, radix = 0) {
        var result = parseInt(str, radix);
        if (isNaN(result))
            return 0;
        return result;
    }
    /**@private */
    static getFileExtension(path) {
        Utils._extReg.lastIndex = path.lastIndexOf(".");
        var result = Utils._extReg.exec(path);
        if (result && result.length > 1) {
            return result[1].toLowerCase();
        }
        return null;
    }
    /**
     * 获取指定区域内相对于窗口左上角的transform。
     * @param	coordinateSpace	坐标空间，不能是Stage引用
     * @param	x				相对于coordinateSpace的x坐标
     * @param	y				相对于coordinateSpace的y坐标
     * @return
     */
    static getTransformRelativeToWindow(coordinateSpace, x, y) {
        var stage = Utils.gStage;
        // coordinateSpace的全局缩放、坐标
        var globalTransform = Utils.getGlobalPosAndScale(coordinateSpace);
        // canvas的transform矩阵
        var canvasMatrix = stage._canvasTransform.clone();
        // 在矩阵变化前前记录的canvas的坐标
        var canvasLeft = canvasMatrix.tx;
        var canvasTop = canvasMatrix.ty;
        // 把矩阵转回0度，得到正确的画布缩放比
        canvasMatrix.rotate(-Math.PI / 180 * stage.canvasDegree);
        // 组合画布缩放和舞台适配缩放
        canvasMatrix.scale(stage.clientScaleX, stage.clientScaleY);
        // 画布是否处于正常角度的垂直角度，-90或90度
        var perpendicular = (stage.canvasDegree % 180 != 0);
        var tx, ty;
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
        var domScaleX, domScaleY;
        if (perpendicular) {
            domScaleX = canvasMatrix.d * globalTransform.height;
            domScaleY = canvasMatrix.a * globalTransform.width;
        }
        else {
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
    static fitDOMElementInArea(dom, coordinateSpace, x, y, width, height) {
        if (!dom._fitLayaAirInitialized) {
            dom._fitLayaAirInitialized = true;
            dom.style.transformOrigin = dom.style.webKittransformOrigin = "left top";
            dom.style.position = "absolute";
        }
        var transform = Utils.getTransformRelativeToWindow(coordinateSpace, x, y);
        // 设置dom样式
        dom.style.transform = dom.style.webkitTransform = "scale(" + transform.scaleX + "," + transform.scaleY + ") rotate(" + (Utils.gStage.canvasDegree) + "deg)";
        dom.style.width = width + 'px';
        dom.style.height = height + 'px';
        dom.style.left = transform.x + 'px';
        dom.style.top = transform.y + 'px';
    }
    /**
     * @private
     * 是否是可用的Texture数组
     * @param	textureList
     * @return
     */
    static isOkTextureList(textureList) {
        if (!textureList)
            return false;
        var i, len = textureList.length;
        var tTexture;
        for (i = 0; i < len; i++) {
            tTexture = textureList[i];
            if (!tTexture || !tTexture._getSource())
                return false;
        }
        return true;
    }
    /**
     * @private
     * 是否是可用的绘图指令数组
     * @param	cmds
     * @return
     */
    static isOKCmdList(cmds) {
        //todo 改成适应新版cmd版本
        if (!cmds)
            return false;
        var i, len = cmds.length;
        //var context:RenderContext = Render._context;
        var cmd;
        var tex;
        for (i = 0; i < len; i++) {
            cmd = cmds[i];
            //switch(cmd.callee)
            //{
            //case context._drawTexture: 
            //case context._fillTexture: 
            //case context._drawTextureWithTransform: 
            //tex = cmd[0];
            //if (!tex || !tex.source) return false;
            //
            //}
        }
        return true;
    }
    /**
     * 获得URL参数值
     * @param	name 参数名称
     * @return	参数值
     */
    static getQueryString(name) {
        if (ILaya.Browser.onMiniGame)
            return null;
        if (!window.location || !window.location.search)
            return null;
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null)
            return unescape(r[2]);
        return null;
    }
}
/**@private */
Utils.gStage = null;
/**@private */
Utils._gid = 1;
/**@private */
Utils._pi = 180 / Math.PI;
/**@private */
Utils._pi2 = Math.PI / 180;
/**@private */
Utils._extReg = /\.(\w+)\??/g;
/**
 * 将字符串解析成 XML 对象。
 * @param value 需要解析的字符串。
 * @return js原生的XML对象。
 */
Utils.parseXMLFromString = function (value) {
    var rst;
    value = value.replace(/>\s+</g, '><');
    rst = (new DOMParser()).parseFromString(value, 'text/xml');
    if (rst.firstChild.textContent.indexOf("This page contains the following errors") > -1) {
        throw new Error(rst.firstChild.firstChild.textContent);
    }
    return rst;
};
