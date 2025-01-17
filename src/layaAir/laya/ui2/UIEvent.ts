
export enum UIEvent {
    /**
     * @en A container with a layout, when the content size of the container changes, the container will emit this event.
     * @zh 一个具有布局的容器，当容器的内容大小发生改变时，容器会发出该事件。
     */
    ContentSizeChanged = "content_size_changed",

    /**
     * @en When the controller list changes, this event will be triggered
     * @zh 当控制器列表发生变化时，会触发该事件
     */
    ControllersChanged = "controllers_changed",

    /**
     * @en When the scroll container scrolls, this event will be triggered
     * @zh 在滚动容器滚动时，会发出此事件
     */
    Scroll = "scroll",

    /**
     * @en When the scroll container scrolls end, this event will be triggered
     * @zh 当滚动容器滚动结束时，会发出此事件
     */
    ScrollEnd = "scroll_end",

    /**
     * @en 'pull_down_release' is emitted when the user releases the touch at the end of the pull-down refresh
     * @zh 'pull_down_release' 事件在下拉刷新结束时被触发
     */
    PullDownRelease = "pull_down_release",

    /**
     * @en 'pull_up_release' is emitted when the user releases the touch at the end of the pull-up refresh
     * @zh 'pull_up_release' 事件在上拉刷新结束时被触发
     */
    PullUpRelease = "pull_up_release",

    /**
     * @en 'click_item' is emitted when the user clicks the list item
     * @zh 'click_item' 事件在用户点击列表项目时被触发
     */
    ClickItem = "click_item",

    /**
     * @en 'submit' is emitted when the user presses the enter key in the input box.
     * @zh 'submit' 事件在用户在输入框按下回车键时被触发。
     */
    Submit = "submit",

    /**
     * @en 'popup' is emitted when a popup menu or a drop-down list is displayed
     * @zh 'popup' 事件在显示弹出菜单或下拉列表时被触发
     */
    Popup = "popup",

    /**
     * @en  'instance_reload' is emitted when the instance is reloaded
     * @zh  'instance_reload' 事件在实例重新加载时被触发
     */
    InstanceReload = "instance_reload"
}