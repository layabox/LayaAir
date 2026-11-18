# Canvas input coordinates

Build the engine with its normal build script, serve the repository root over HTTP,
and open `tests/input-coordinates/index.html` in Chrome. No application code or
external image assets are required. Results are displayed on the page and exposed
as `window.inputCoordinateResults`; startup errors use `window.inputCoordinateError`.

The suite dispatches mouse and touch DOM events through the engine's installed
listeners and checks the hit Sprite and its event coordinates. A separate DOM marker
locates a known stage point through browser layout, rather than reimplementing the
input conversion formula. Touch events are synthetic, not physical device input.

Coverage: default zero-height parent, translated/scaled zero-height parent, bordered
parent, nested nonuniform scaling, ancestor and document scrolling, Stage showall
and alignment, both 90-degree orientations, and Stage client scaling.
MouseEvent uses integer CSS coordinates, so mouse assertions allow one stage pixel
for the tested scales; touch coordinates preserve fractions and use a tighter check.

The supported external transforms are translation and positive axis-aligned scale.
Arbitrary ancestor rotation, skew, perspective, and CSS border/padding applied directly
to the engine-owned canvas are outside this change. Ancestor borders are covered.
