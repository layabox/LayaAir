/**
 * @ignore
 */
export class SpriteConst {
    static ALPHA = 0x01;
    static TRANSFORM = 0x02;
    static BLEND = 0x04;
    static CANVAS = 0x08;
    static FILTERS = 0x10;
    static MASK = 0x20;
    static CLIP = 0x40;
    static TEXTURE = 0x80;
    static GRAPHICS = 0x100;
    /** @deprecated */
    static CUSTOM = 0x200;
    static HITAREA = 0x400;
    static RENDERNODE2D = 0x800;
    static CHILDS = 0x1000;
    static REPAINT_NONE = 0;
    static REPAINT_NODE = 0x01;
    static REPAINT_CACHE = 0x02;
    static REPAINT_ALL = 0x03;
    static POSTPROCESS = this.CANVAS | this.FILTERS | this.MASK;
}

export enum TransformKind {
    Pos = 0x01,
    Width = 0x02,
    Height = 0x04,
    Anchor = 0x08,
    Scale = 0x10,
    Skew = 0x20,
    Rotation = 0x40,
    Matrix = 0x80,

    Size = Width | Height,
    Layout = Size | Scale | Anchor,
    TRS = Pos | Rotation | Scale
}


