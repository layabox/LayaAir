/**
 * @en The `KeyLocation` class contains constants that indicate the location of a key on a keyboard or keyboard-like input device.
 * The `KeyLocation` constants are used within the `keyLocation` property of keyboard event objects.
 * @zh `KeyLocation` 类包含表示键盘或类似键盘的输入设备上按键位置的常量。
 * `KeyLocation` 常数用在键盘事件对象的 `keyLocation` 属性中。
 */
export class KeyLocation {
    /**
     * @en Indicates that the active key does not distinguish between the left or right position,
     * nor does it distinguish whether it is located on the numeric keypad (or activated by a virtual key corresponding to the numeric keypad).
     * @zh 表示激活的键不区分位于左侧还是右侧，也不区分是否位于数字键盘（或者是使用对应于数字键盘的虚拟键激活的）。
     */
    static STANDARD: number = 0;
    /**
     * @en Indicates that the active key is in the left key location (a key may have multiple possible locations).
     * @zh 表示激活的键在左侧键位置（此键可能有多个可能的位置）。
     */
    static LEFT: number = 1;
    /**
     * @en Indicates that the active key is in the right key location (a key may have multiple possible locations).
     * @zh 表示激活的键在右侧键位置（此键可能有多个可能的位置）。
     */
    static RIGHT: number = 2;
    /**
     * @en Indicates that the active key is on the numeric keypad or activated by a virtual key corresponding to the numeric keypad.
     * <Note: This property is only valid in Flash mode.
     * @zh 表示激活的键位于数字键盘或者是使用对应于数字键盘的虚拟键激活的。
     * <注意：此属性只在flash模式下有效。
     */
    static NUM_PAD: number = 3;

}


