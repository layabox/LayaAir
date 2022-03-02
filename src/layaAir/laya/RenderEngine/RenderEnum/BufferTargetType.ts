export enum BufferTargetType{
    ARRAY_BUFFER,
    ELEMENT_ARRAY_BUFFER,
    //WebGL2.0 UniformBuffer
    UNIFORM_BUFFER,
    COPY_READ_BUFFER,//TODO
    COPY_WRITE_BUFFER,//TODO
    TRANSFORM_FEEDBACK_BUFFER,//TODO
    PIXEL_PACK_BUFFER,//TODO
    PIXEL_UNPACK_BUFFER,//TODO
}


/**
 * Buffer usage.
 */
 export enum BufferUsage {
    /** The buffer content are intended to be specified once, and used many times */
    Static,
    /** The buffer contents are intended to be respecified repeatedly, and used many times */
    Dynamic,
    /** The buffer contents are intended to be specified once, and used at most a few times */
    Stream
  }