import { Sprite } from "../display/Sprite";

export interface IHitArea {
    /**
     * @en Checks whether the object contains a specified point.
     * @param x The x-coordinate of the point (horizontal position).
     * @param y The y-coordinate of the point (vertical position).
     * @param sp The Sprite object that contains the point.
     * @returns true if the object contains the specified point; otherwise false.
     * @zh 检测对象是否包含指定的点。
     * @param x 点的 X 轴坐标值（水平位置）。
     * @param y 点的 Y 轴坐标值（垂直位置）。
     * @param sp 包含该点的 Sprite 对象。
     * @returns 如果包含指定的点，则值为 true；否则为 false。
     * @blueprintIgnore
     */
    contains(x: number, y: number, sp: Sprite): boolean;
}