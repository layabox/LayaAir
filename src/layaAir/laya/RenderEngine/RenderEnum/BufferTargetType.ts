export enum BufferTargetType {
  ARRAY_BUFFER = 1,//顶点
  ELEMENT_ARRAY_BUFFER = 2,//索引
  //WebGL2.0 UniformBuffer
  UNIFORM_BUFFER = 4,//UBO
  COPY_READ_BUFFER = 8,//TODO
  COPY_WRITE_BUFFER = 16,//TODO
  TRANSFORM_FEEDBACK_BUFFER = 32,//TODO
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