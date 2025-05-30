/**
 * @ignore
 * 静态常量集合
 */
export class Const {
    static ENUM_TEXTALIGN_DEFAULT = 0;
    static ENUM_TEXTALIGN_CENTER = 1;
    static ENUM_TEXTALIGN_RIGHT = 2;

    static INDEX_BYTES = 2;

    static MAX_CLIP_SIZE = 99999999;
}

/**
 * @ignore
 * 节点标志
 */
export class NodeFlags {
    static ACTIVE = 0x1;
    static ACTIVE_INHIERARCHY = 0x2;
    static AWAKED = 0x4;
    static ACTUAL_VISIBLE = 0x8;
    static DISPLAY = 0x10;
    static HAS_ZORDER = 0x20;
    static AREA_2D = 0x40;
    static DISPLAYED_INSTAGE = 0x80;
    static DRAWCALL_OPTIMIZE = 0x100;
    static CHECK_INPUT = 0x200;
    static DEMAND_TRANS_EVENT = 0x400;
    static HAS_SCRIPT = 0x800;
    static ESCAPE_DRAWING_TO_TEXTURE = 0x1000; //IDE use
    static DISABLE_INNER_CLIPPING = 0x2000;//IDE use
    static DISABLE_OUTER_CLIPPING = 0x4000;//IDE use
    static FORCE_VISIBLE = 0x8000; //IDE use
    static EDITING_NODE = 0x10000; //IDE use
    static HIDE_BY_EDITOR = 0x20000; //IDE use
    static LOCK_BY_EDITOR = 0x40000;//IDE use
    static EDITING_ROOT_NODE = 0x80000; //IDE use
    static FORCE_HIDDEN = 0x100000;//IDE use
    static NOT_IN_PAGE = 0x200000; //FGUI use
    static ESCAPE_LAYOUT = 0x400000; //FGUI use
}

/**
 * @en HideFlags is a class that defines the flags used to control the visibility and saving behavior of objects in the editor.
 * @zh HideFlags 是一个类，用于定义在编辑器中控制对象的可见性和保存行为的标志。
 */
export class HideFlags {
    /**
     * @en The object is hidden in the hierarchy.
     * @zh 对象在层级中隐藏。
     */
    static HideInHierarchy = 0x1;
    /**
     * @en The object is hidden in the inspector.
     * @zh 对象在检查器中隐藏。
     */
    static HideInInspector = 0x2;
    /**
     * @en The object is not saved to the scene or prefab.
     * @zh 对象不会保存到场景或预制件中。
     */
    static DontSave = 0x4;
    /**
     * @en The object is hidden and not saved to the scene or prefab.
     * @zh 对象隐藏且不会保存到场景或预制件中。
     */
    static HideAndDontSave = 0x7;
}