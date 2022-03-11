/**
 * Mesh topology.
 */
 export enum MeshTopology {
    /** Draws a single dot */
    Points,
    /** Draws a line between a pair of vertices */
    Lines,
    /** Draws a straight line to the next vertex, and connects the last vertex back to the first */
    LineLoop,
    /** Draws a straight line to the next vertex. */
    LineStrip,
    /** Draws a triangle for a group of three vertices */
    Triangles,
    /** Draws a triangle strip */
    TriangleStrip,
    /** Draws a triangle fan */
    TriangleFan
  }
  