# Directional shadow bounds regression

Run `node tests/shadow-map-bounds/server.cjs` and open the printed localhost URL.
The page compiles the working tree's shader sources and reports GPU readback assertions.
It needs no packages or engine bundle. Both WebGL 1 and WebGL 2 must be available for a full pass.

Coverage:

- One, two and four cascades; Hard, SoftLow and SoftHigh filtering.
- Positions outside every cascade return a finite, unshadowed sentinel, including unused zero matrices in two-cascade mode.
- Projections outside their own atlas tile return unshadowed, even when inside the full atlas.
- PCF samples near tile edges/corners do not read neighbouring tiles, including fractional texel positions and hardware comparison filtering in WebGL 2.
- Zero/negative W and invalid XYZ are rejected; valid shadowed interiors and shadow strength still work.

This isolates sampler correctness. Scene-level PBR rendering and GLSL-to-WGSL translation need separate engine integration checks.
