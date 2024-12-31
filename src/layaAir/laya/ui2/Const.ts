
export enum ButtonStatus {
    Up,
    Down,
    Over,
    SelectedOver,
    Disabled,
    SelectedDisabled,
}

export enum AlignType {
    Left,
    Center,
    Right,
    None
}

export enum VAlignType {
    Top,
    Middle,
    Bottom,
    None
}

export enum LayoutChangedReason {
    Size,
    Pos,
    Visible,
    Hierarchy
}

export enum ButtonMode {
    Common,
    Check,
    Radio
}

export enum ButtonDownEffect {
    None,
    Dark,
    Scale
}

export enum TextFitContent {
    None,
    Both,
    Height
}

export enum LayoutType {
    None,
    SingleColumn,
    SingleRow,
    FlowX,
    FlowY
}

export enum PageMode {
    None,
    Horizontal,
    Vertical
}

export enum StretchMode {
    None,
    Stretch,
    ResizeToFit
}

export enum SelectionMode {
    None,
    Single,
    Multiple,
    MultipleBySingleClick,
    Disabled
}

export enum LoaderFitMode {
    None,
    Fill,
    Contain,
    Cover,
    CoverWidth,
    CoverHeight
}

export enum ProgressTitleType {
    Percent,
    ValueAndMax,
    Value,
    Max
}

export enum ScrollDirection {
    Vertical,
    Horizontal,
    Both
}

export enum ScrollTouchEffect {
    Default,
    On,
    Off
}

export enum ScrollBounceBackEffect {
    Default,
    On,
    Off
}

export enum ScrollBarDisplay {
    Default,
    Always,
    OnOverflow,
    OnScroll,
    OnOverflowAndScroll,
    Hidden
}

export enum PopupDirection {
    Auto,
    Up,
    Down
}

export enum TreeClickToExpandType {
    None,
    SingleClick,
    DoubleClick
}

export enum RelationType {
    Width = 1,
    Height = 2,

    Left_Left = 3,
    Left_Center = 4,
    Left_Right = 5,
    Center_Center = 6,
    Right_Left = 7,
    Right_Center = 8,
    Right_Right = 9,

    Top_Top = 10,
    Top_Middle = 11,
    Top_Bottom = 12,
    Middle_Middle = 13,
    Bottom_Top = 14,
    Bottom_Middle = 15,
    Bottom_Bottom = 16,

    LeftExt_Left = 17,
    LeftExt_Right = 18,
    RightExt_Left = 19,
    RightExt_Right = 20,
    TopExt_Top = 21,
    TopExt_Bottom = 22,
    BottomExt_Top = 23,
    BottomExt_Bottom = 24,

    Size = 100,
    Pos = 101,
    CenterAndMiddle = 102,
}