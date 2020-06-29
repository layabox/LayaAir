/**
	 * <p><code>KeyLocation</code> 类包含表示在键盘或类似键盘的输入设备上按键位置的常量。</p>
	 * <p><code>KeyLocation</code> 常数用在键盘事件对象的 <code>keyLocation </code>属性中。</p>
	 */
export class KeyLocation {
    /**
     * 表示激活的键不区分位于左侧还是右侧，也不区分是否位于数字键盘（或者是使用对应于数字键盘的虚拟键激活的）。
     */
    static STANDARD: number = 0;
    /**
     * 表示激活的键在左侧键位置（此键有多个可能的位置）。
     */
    static LEFT: number = 1;
    /**
     * 表示激活的键在右侧键位置（此键有多个可能的位置）。
     */
    static RIGHT: number = 2;
    /**
     * <p>表示激活的键位于数字键盘或者是使用对应于数字键盘的虚拟键激活的。</p>
     * <p>注意：此属性只在flash模式下有效。</p>
     * */
    static NUM_PAD: number = 3;

}


