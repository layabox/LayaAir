/**
 * @ignore
 */
export class SpriteConst {
    /** Sprite 渲染能力位集合。现有位值和保留空洞不可重排。 */
    static TEXT = 0x01;
    static AREA2D = 0x02;
    static CANVAS = 0x08;
    static POSTPROCESS = 0x10;
    static MASK = 0x20;
    static CLIP = 0x40;
    //static = 0x80;
    static GRAPHICS = 0x100;
    //static = 0x400;
    static RENDERNODE2D = 0x800;
    //static = 0x1000;
    static DRAW2RT = this.CANVAS | this.POSTPROCESS | this.MASK;
    static UPDATETRANS = this.CANVAS | this.POSTPROCESS | this.MASK | this.CLIP | this.GRAPHICS | this.RENDERNODE2D;
}

export enum RepaintFlag {
    Normal = 0,
    Size = 0x01,
    Graphics = 0x02,
    ChildChange = 0x04,
    UpdateRT = Graphics | Size | ChildChange,
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
    TRS = Pos | Rotation | Scale | Skew
}


export enum BaseRender2DType {
    empty = -1,
    baseRenderNode = 0,
    spine = 1,
    particle = 2,
    spineSimple = 3,
    graphics = 4,
    spinenormal = 5,
    sequenceFrame2D = 6,
}

export enum SubPassFlag {
    PostProcess = 0x1,
    CacheAsBitmap = 0x2,
    Mask = 0x4,
    /** RT 边界、尺寸或偏移失效，需要重新计算并重绘。 */
    RenderTexture = 0x8,
    /** RT 尺寸和偏移不变，仅内容需要重绘。 */
    RenderTextureContent = 0x10,

    /** @internal */
    UPDATE_POSTPROCESS = RenderTexture | RenderTextureContent | PostProcess,
}
