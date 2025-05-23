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
    static HITAREA = 0x400;
    static RENDERNODE2D = 0x800;
    static CHILDS = 0x1000;
    static DRAW2RT = this.CANVAS | this.FILTERS | this.MASK;
    static UPDATETRANS = this.CANVAS | this.FILTERS | this.MASK | this.CLIP | this.GRAPHICS;
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


export enum BaseRender2DType {
    empty = -1,
    baseRenderNode = 0,
    spine = 1,
    particle = 2,
    spineSimple = 3,
    graphics = 4
}