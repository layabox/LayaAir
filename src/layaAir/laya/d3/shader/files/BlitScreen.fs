#if defined(GL_FRAGMENT_PRECISION_HIGH)
precision highp float;
#else
precision mediump float;
#endif

void main()
{
    gl_FragColor = texture2D(u_MainTex, v_Texcoord0);
}
