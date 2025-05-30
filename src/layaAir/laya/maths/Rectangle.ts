import { IClone } from "../utils/IClone";
import { Pool } from "../utils/Pool";

/**
 * @en The `Rectangle` object is an area defined by its position, as indicated by its top-left corner point (x, y), and by its width and height.
 * The x, y, width, and height properties of the Rectangle class are independent of each other; changing the value of one property has no effect on the others.
 * @zh `Rectangle` 对象是按其位置（由它左上角的点 (x, y) 确定）以及宽度和高度定义的区域。
 * Rectangle 类的 x、y、width 和 height 属性相互独立；更改一个属性的值不会影响其他属性。
 */
export class Rectangle implements IClone {

    /**
     * @en Global empty rectangle area with x=0, y=0, width=0, height=0. The content of this object is not allowed to be modified.
     * @zh 全局空的矩形区域，x=0, y=0, width=0, height=0。不允许修改此对象内容。
     */
    static readonly EMPTY: Readonly<Rectangle> = new Rectangle();
    /**
     * @en Global temporary rectangle area. This object is used for global reuse to reduce object creation.
     * @zh 全局临时的矩形区域，此对象用于全局复用，以减少对象创建。
     */
    static readonly TEMP: Rectangle = new Rectangle();

    /**
     * @en The x coordinate of the top-left corner of the rectangle.
     * @zh 矩形左上角的 X 轴坐标。
     */
    x: number;

    /**
     * @en The y coordinate of the top-left corner of the rectangle.
     * @zh 矩形左上角的 Y 轴坐标。
     */
    y: number;

    /**
     * @en The width of the rectangle.
     * @zh 矩形的宽度。
     */
    width: number;

    /**
     * @en The height of the rectangle.
     * @zh 矩形的高度。
     */
    height: number;

    /**
     * @en Constructor method.
     * @param x The x coordinate of the top-left corner of the rectangle.
     * @param y The y coordinate of the top-left corner of the rectangle.
     * @param width The width of the rectangle.
     * @param height The height of the rectangle.
     * @zh 构造方法
     * @param x 矩形左上角的 X 轴坐标。
     * @param y 矩形左上角的 Y 轴坐标。
     * @param width 矩形的宽度。
     * @param height 矩形的高度。
     */
    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }


    /**
     * @en The x-coordinate of the right side of this rectangle. It is equal to the sum of the x and width properties.
     * @zh 此矩形右侧的 X 轴坐标。等于 x 和 width 属性的和。
     */
    get right(): number {
        return this.x + this.width;
    }

    set right(value: number) {
        this.width = value - this.x;
    }

    /**
     * @en The y-coordinate of the bottom side of this rectangle. It is equal to the sum of the y and height properties.
     * @zh 此矩形底端的 Y 轴坐标。等于 y 和 height 属性的和。
     */
    get bottom(): number {
        return this.y + this.height;
    }

    set bottom(value: number) {
        this.height = value - this.y;
    }

    /**
     * @en Sets the properties of the Rectangle to the specified values.
     * @param x The x-coordinate of the top-left corner of the rectangle.
     * @param y The y-coordinate of the top-left corner of the rectangle.
     * @param width The width of the rectangle.
     * @param height The height of the rectangle.
     * @return The rectangle object itself after the property values have been modified.
     * @zh 将 Rectangle 的属性设置为指定值。
     * @param x	x 矩形左上角的 X 轴坐标。
     * @param y	x 矩形左上角的 Y 轴坐标。
     * @param width	矩形的宽度。
     * @param height	矩形的高。
     * @return	返回属性值修改后的矩形对象本身。
     */
    setTo(x: number, y: number, width: number, height: number): this {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
    }

    /**
     * @en Resets the rectangle to default values (x=0, y=0, width=0, height=0).
     * @zh 重置矩形为默认值（x=0, y=0, width=0, height=0）。
     */
    reset(): this {
        this.x = this.y = this.width = this.height = 0;
        return this;
    }

    /**
     * @en Recycles the rectangle object.
     * @zh 回收矩形对象。
     */
    recover(): void {
        if (this == Rectangle.TEMP || this == Rectangle.EMPTY) {
            //console.log("recover Temp or Empty:", this);
            return;
        }
        Pool.recover("Rectangle", this.reset());
    }

    /**
     * @en Creates a new Rectangle object from the object pool.
     * @zh 从对象池中创建一个新的 Rectangle 对象。
     */
    static create(): Rectangle {
        return Pool.getItemByClass("Rectangle", Rectangle);
    }

    /**
     * @en Copies the property values from the source Rectangle object to this rectangle object.
     * @param source The source Rectangle object.
     * @returns The rectangle object itself after the property values have been modified.
     * @zh 复制源 Rectangle 对象的属性值到此矩形对象中。
     * @param source 源 Rectangle 对象。
     * @return 返回属性值修改后的矩形对象本身。
     */
    copyFrom(source: Rectangle): this {
        this.x = source.x;
        this.y = source.y;
        this.width = source.width;
        this.height = source.height;
        return this;
    }

    /**
     * @en Determines whether the specified point is contained within the rectangular region defined by this Rectangle object.
     * @param x The x-coordinate of the point (horizontal position).
     * @param y The y-coordinate of the point (vertical position).
     * @return True if the Rectangle object contains the specified point; false otherwise.
     * @zh 确定由此 Rectangle 对象定义的矩形区域内是否包含指定的点。
     * @param x	点的 X 轴坐标值（水平位置）。
     * @param y	点的 Y 轴坐标值（垂直位置）。
     * @return	如果 Rectangle 对象包含指定的点，则值为 true；否则为 false。
     */
    contains(x: number, y: number): boolean {
        if (this.width <= 0 || this.height <= 0) return false;

        if (x >= this.x && x < this.right) {
            if (y >= this.y && y < this.bottom) {
                return true;
            }
        }
        return false;
    }

    /**
     * @en Determines whether the object specified in the rect parameter intersects with this Rectangle object. This method checks the x, y, width, and height properties of the specified Rectangle object to see if it intersects with this Rectangle object.
     * @param rect The Rectangle object to compare.
     * @returns True if the specified rectangle intersects with this one, false otherwise.
     * @zh 确定在 rect 参数中指定的对象是否与此 Rectangle 对象相交。此方法检查指定的 Rectangle 对象的 x、y、width 和 height 属性，以查看它是否与此 Rectangle 对象相交。
     * @param rect Rectangle 对象。
     * @return	如果传入的矩形对象与此对象相交，则返回 true 值，否则返回 false。
     */
    intersects(rect: Readonly<Rectangle>): boolean {
        return !(rect.x > (this.x + this.width) || (rect.x + rect.width) < this.x || rect.y > (this.y + this.height) || (rect.y + rect.height) < this.y);
    }

    /**
     * @en If the Rectangle object specified in the rect parameter intersects with this Rectangle object, returns the area of intersection as a Rectangle object. If the rectangles do not intersect, this method returns null.
     * @param rect The rectangle to compare against.
     * @param out (Optional) The rectangle object for storing the output. If null, a new one will be created. It is allowed to be the same as rect or this.
     * @returns The intersection area as a Rectangle object, or null if there's no intersection.
     * @zh 如果在 rect 参数中指定的 Rectangle 对象与此 Rectangle 对象相交，则返回交集区域作为 Rectangle 对象。如果矩形不相交，则此方法返回null。
     * @param rect 待比较的矩形区域。
     * @param out （可选）待输出的矩形区域。如果为空则创建一个新的。允许out与rect或者this相同。
     * @return	返回相交的矩形区域对象。
     */
    intersection(rect: Rectangle, out?: Rectangle): Rectangle {
        if (!this.intersects(rect))
            return null;

        let x = Math.max(this.x, rect.x);
        let y = Math.max(this.y, rect.y);
        let width = Math.min(this.right, rect.right) - x;
        let height = Math.min(this.bottom, rect.bottom) - y;

        out || (out = new Rectangle());
        return out.setTo(x, y, width, height);
    }

    /**
     * @en Adds two rectangles together to create a new Rectangle object, by filling in the horizontal and vertical space between the two rectangles.
     * Note: The union() method ignores rectangles with a height or width of 0, such as: var rect2:Rectangle = new Rectangle(300,300,50,0);
     * @param source The Rectangle object to add to this Rectangle object.
     * @param out The Rectangle object to store the output. If null, a new one will be created. It is allowed to be the same as rect or this.
     * @returns A new Rectangle object that is the union of the two rectangles.
     * @zh 矩形联合，通过填充两个矩形之间的水平和垂直空间，将这两个矩形组合在一起以创建一个新的 Rectangle 对象。
     * 注意：union() 方法忽略高度或宽度值为 0 的矩形，如：var rect2:Rectangle = new Rectangle(300,300,50,0);
     * @param source 要添加到此 Rectangle 对象的 Rectangle 对象。
     * @param out	用于存储输出结果的矩形对象。如果为空，则创建一个新的。允许out与rect或者this相同。
     * @return	充当两个矩形的联合的新 Rectangle 对象。
     */
    union(source: Rectangle, out?: Rectangle): Rectangle {
        let x = source.x;
        let y = source.y;
        let width = source.width;
        let height = source.height;

        out || (out = new Rectangle());
        this.cloneTo(out);
        if (width <= 0 || height <= 0) return out;
        if (this.width <= 0 || this.height <= 0) return out.setTo(x, y, width, height);

        out.addPoint(x, y);
        out.addPoint(x + width, y + height);

        return out;
    }

    /**
     * @zh 缩放矩形
     * @param scaleX X缩放值 
     * @param scaleY Y缩放值
     * @returns 本对象
     * @en Scales the rectangle.
     * @param scaleX The scaling factor in the x-direction.
     * @param scaleY The scaling factor in the y-direction.
     * @returns This object. 
     */
    scale(scaleX: number, scaleY: number): this {
        this.x *= scaleX;
        this.y *= scaleY;
        this.width *= scaleX;
        this.height *= scaleY;
        return this;
    }

    /**
     * @en Returns a string representation of this Rectangle object, with the x, y, width, and height values joined by commas.
     * @zh 返回当前 Rectangle 对象的字符串表示，其中水平位置 x、垂直位置 y、宽度 width 和高度 height 以逗号连接。
     */
    toString(): string {
        return this.x + "," + this.y + "," + this.width + "," + this.height;
    }

    /**
     * @en Checks if the properties of the input Rectangle object are equal to the properties of the current Rectangle object (x, y, width, height).
     * @param rect The Rectangle object to compare.
     * @returns True if all properties are equal, false otherwise.
     * @zh 检测传入的 Rectangle 对象的属性是否与当前 Rectangle 对象的属性 x、y、width、height 属性值都相等。
     * @param rect	待比较的 Rectangle 对象。
     * @return	如果判断的属性都相等，则返回 true 值，否则返回 false。
     */
    equals(rect: Rectangle): boolean {
        if (!rect || rect.x !== this.x || rect.y !== this.y || rect.width !== this.width || rect.height !== this.height) return false;
        return true;
    }

    /**
     * @en Adds a point to the current rectangle object, expanding it to the smallest rectangle that contains both the current rectangle and the given point.
     * This method modifies the current object.
     * @param x The x-coordinate of the point.
     * @param y The y-coordinate of the point.
     * @return This Rectangle object.
     * @zh 为当前矩形对象加一个点，以使当前矩形扩展为包含当前矩形和此点的最小矩形。
     * 此方法会修改本对象。
     * @param x	点的 X 坐标。
     * @param y	点的 Y 坐标。
     * @return 返回此 Rectangle 对象。
     */
    addPoint(x: number, y: number): this {
        this.x > x && (this.width += this.x - x, this.x = x);//左边界比较
        this.y > y && (this.height += this.y - y, this.y = y);//上边界比较
        if (this.width < x - this.x) this.width = x - this.x;//右边界比较
        if (this.height < y - this.y) this.height = y - this.y;//下边界比较
        return this;
    }

    /**
     * @en Returns vertex data representing the current rectangle.
     * @return Vertex data.
     * @zh 返回代表当前矩形的顶点数据。
     * @return 顶点数据。
     */
    getBoundPoints(out?: Array<number>): Array<number> {
        out = out || [];
        if (this.width == 0 || this.height == 0) return out;
        out.push(this.x, this.y, this.x + this.width, this.y, this.x, this.y + this.height, this.x + this.width, this.y + this.height);
        return out;
    }

    /**
     * @en Returns the smallest rectangle that contains all the points.
     * @param points List of points.
     * @param out Optional Rectangle object to store the result.
     * @returns The smallest rectangle that contains all the points.
     * @zh 返回包含所有点的最小矩形。
     * @param points 点列表。
     * @param out （可选）用于存储结果的矩形对象。
     * @return 包含所有点的最小矩形矩形对象。
     */
    static _getWrapRec(points: ArrayLike<number>, out?: Rectangle): Rectangle {
        out = out || new Rectangle();
        if (!points || points.length < 1)
            return out.setTo(0, 0, 0, 0);

        let i: number, len: number = points.length, minX: number, maxX: number, minY: number, maxY: number;
        minX = minY = 99999;
        maxX = maxY = -minX;
        for (i = 0; i < len; i += 2) {
            let tx = points[i];
            let ty = points[i + 1];
            minX = minX < tx ? minX : tx;
            minY = minY < ty ? minY : ty;
            maxX = maxX > tx ? maxX : tx;
            maxY = maxY > ty ? maxY : ty;
        }
        return out.setTo(minX, minY, maxX - minX, maxY - minY);
    }

    /**
     * Creates a rectangle from two corner points.
     * @param minX The smallest x value.
     * @param minY The smallest y value.
     * @param maxX The largest x value. 
     * @param maxY The largest y value. 
     * @param out Optional Rectangle object to store the result. 
     * @returns The resulting rectangle.
     * @zh 由两个角点创建一个矩形。
     * @param minX 最小的 x 值。
     * @param minY 最小的 y 值。
     * @param maxX 最大的 x 值。
     * @param maxY 最大的 y 值。
     * @param out （可选）用于存储结果的矩形对象。
     * @return 结果矩形。 
     */
    static minMaxRect(minX: number, minY: number, maxX: number, maxY: number, out?: Rectangle): Rectangle {
        out = out || new Rectangle();
        return out.setTo(minX, minY, maxX - minX, maxY - minY);
    }

    /**
     * @en Determines whether this Rectangle object is empty.
     * @returns True if the width or height of the Rectangle object is less than or equal to 0, false otherwise.
     * @zh 确定此 Rectangle 对象是否为空。
     * @return 如果 Rectangle 对象的宽度或高度小于等于 0，则返回 true 值，否则返回 false。
     */
    isEmpty(): boolean {
        return this.width <= 0 || this.height <= 0;
    }

    /**
     * @en Returns a new Rectangle object with the same values for the x, y, width, and height properties as the original Rectangle object.
     * @param out (Optional) The rectangle object used to store the result. If null, a new one is created. Recommendation: Reuse objects as much as possible to reduce object creation overhead. The Rectangle.TEMP object can be used for object reuse.
     * @returns A Rectangle object with the same values for x, y, width, and height properties as the current Rectangle object.
     * @zh 返回一个新的 Rectangle 对象，其 x、y、width 和 height 属性的值与当前 Rectangle 对象的对应值相同。
     * @param out （可选）用于存储结果的矩形对象。如果为空，则创建一个新的。建议：尽量复用对象，减少对象创建消耗。Rectangle.TEMP对象用于对象复用。
     * @return 一个 Rectangle 对象，其 x、y、width 和 height 属性的值与当前 Rectangle 对象的对应值相同。
     */
    clone(out?: Rectangle): Rectangle {
        out || (out = new Rectangle());
        this.cloneTo(out);
        return out;
    }

    /**
     * @en Copies the properties of this Rectangle to the destination object.
     * @param destObject The destination object to copy to.
     * @zh 将此 Rectangle 的属性复制到目标对象。
     * @param destObject 目标对象。
     */
    cloneTo(destObject: Rectangle): void {
        destObject.x = this.x;
        destObject.y = this.y;
        destObject.width = this.width;
        destObject.height = this.height;
    }
}