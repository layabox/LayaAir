#ifdef HIGHPRECISION
precision highp float;
#else
precision mediump float;
#endif

varying vec4 v_Color;
uniform vec4 u_Color;

void main()
{
  gl_FragColor = v_Color * u_Color; 
}

