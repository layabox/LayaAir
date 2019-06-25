/**
 * <code>TextMesh</code> 类用于创建文本网格。
 */
export class TextMesh {
    /**
     * 获取文本。
     * @return 文本。
     */
    get text() {
        return this._text;
    }
    /**
     * 设置文本。
     * @param value 文本。
     */
    set text(value) {
        this._text = value;
    }
    /**
     * 获取字体尺寸。
     * @param  value 字体尺寸。
     */
    get fontSize() {
        return this._fontSize;
    }
    /**
     * 设置字体储存。
     * @return 字体尺寸。
     */
    set fontSize(value) {
        this._fontSize = value;
    }
    /**
     * 获取颜色。
     * @return 颜色。
     */
    get color() {
        return this._color;
    }
    /**
     * 设置颜色。
     * @param 颜色。
     */
    set color(value) {
        this._color = value;
    }
    /**
     * 创建一个新的 <code>TextMesh</code> 实例。
     */
    constructor() {
    }
    /**
     * @private
     */
    _createVertexBuffer(charCount) {
        //var verDec:VertexDeclaration = vertexbu.vertexDeclaration;
        //var newVertices:Float32Array = new Float32Array(verticesCount * FLOATCOUNTPERVERTEX);
        //var newVertecBuffer:VertexBuffer3D = new VertexBuffer3D(verDec.vertexStride * verticesCount, WebGLContext.DYNAMIC_DRAW, false);
        //var bufferState:BufferState = new BufferState();
        //newVertecBuffer.vertexDeclaration = verDec;
        //
        //bufferState.bind();
        //bufferState.applyVertexBuffer(newVertecBuffer);
        //bufferState.applyIndexBuffer(_indexBuffer);
        //bufferState.unBind();
        //
        //_vertices.push(newVertices);
        //_vertexbuffers.push(newVertecBuffer);
        //_vertexUpdateFlag.push([2147483647/*int.MAX_VALUE*/, -2147483647/*int.MIN_VALUE*/]);//0:startUpdate,1:endUpdate
        //_bufferStates.push(bufferState);
    }
    /**
     * @private
     */
    _resizeVertexBuffer(charCount) {
    }
    /**
     * @private
     */
    _addChar() {
        //_vertexBuffer
    }
}
