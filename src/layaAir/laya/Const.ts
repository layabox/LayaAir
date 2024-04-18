/**
 * @private
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
 * 节点标志
 */
export class NodeFlags {
    static NOT_ACTIVE = 0x01;
    static ACTIVE_INHIERARCHY = 0x02;
    static AWAKED = 0x04;
    static NOT_READY = 0x08;
    static DISPLAY = 0x10;
    static HAS_ZORDER = 0x20;
    static HAS_MOUSE = 0x40;
    static DISPLAYED_INSTAGE = 0x80;
    static DRAWCALL_OPTIMIZE = 0x100;
    static PROCESS_COLLISIONS = 0x200;
    static PROCESS_TRIGGERS = 0x400;
    static HAS_SCRIPT = 0x800;
    static ESCAPE_DRAWING_TO_TEXTURE = 0x1000;
    static DISABLE_INNER_CLIPPING = 0x2000;
    static DISABLE_OUTER_CLIPPING = 0x4000;
    static DISABLE_VISIBILITY = 0x8000;
    static EDITING_NODE = 0x10000;
    static HIDE_BY_EDITOR = 0x20000;
    static LOCK_BY_EDITOR = 0x40000;
}

export class HideFlags {
    static HideInHierarchy = 0x1;
    static HideInInspector = 0x2;
    static DontSave = 0x4;
    static HideAndDontSave = 0x7;
}