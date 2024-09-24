import { ScrollBar } from "./ScrollBar";

/**
 * @en Use the `HScrollBar` (horizontal `ScrollBar`) control to control the displayed data portion when there is too much data to display completely in the display area.
 * @zh 使用 `HScrollBar`（水平 `ScrollBar`）控件，可以在因数据太多而不能在显示区域完全显示时控制显示的数据部分。
 */
export class HScrollBar extends ScrollBar {

    protected initialize(): void {
        super.initialize();
        this.slider.isVertical = false;
    }
}