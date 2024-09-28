precision highp float;

in vec2 vUV;

uniform sampler2D uTexture;
uniform sampler2D uShapeTexture;
uniform sampler2D uGrainTexture;
uniform float uBrushSize;
uniform vec4 uBrushColor;
uniform vec2 uPosition;

void main() {
    vec2 brushUV = vUV + 100.0 * (vec2(0.5) - vUV) / uBrushSize;
    vec4 brushMask = texture2D(uShapeTexture, brushUV).rgba;

    vec2 grainUV = fract(vUV + uPosition / 5000.0);
    vec4 grain = texture2D(uGrainTexture, grainUV);

    vec3 color = uBrushColor.rgb + 0.1 * (vec3(0.5) - uBrushColor.rgb) * (1.0 - brushMask.a);

    gl_FragColor = 0.8 * vec4(color.rgb * brushMask.a, brushMask.a) + 0.2 * grain * brushMask.a;
}