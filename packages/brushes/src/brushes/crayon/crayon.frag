precision highp float;

in vec2 vUV;

uniform sampler2D uCrayonShape;
uniform sampler2D uCrayonGrain;
uniform float uBrushSize;
uniform vec4 uBrushColor;
uniform vec2 uPosition;
uniform vec2 uLastPosition;

vec2 rotateUV(vec2 uv, vec2 mid, float rotation) {
    float s = sin(rotation);
    float c = cos(rotation);
    mat2 rotationMatrix = mat2(c, -s, s, c);
    return mid + rotationMatrix * (uv - mid);
}

float rand(float co){
    return fract(sin(co * 12.9898) * 43758.5453);
}

void main() {
    float brushSize = uBrushSize;
    vec2 shapeUv = vUV;
    shapeUv = rotateUV(shapeUv, vec2(0.5), 6.28 * rand(uPosition.x + uPosition.y));

    vec4 shapeMask = texture2D(uCrayonShape, shapeUv).rgba;
    float alpha = (0.05 + 0.15 * (1.0 - 0.5 * length(uBrushColor.rgb))) * shapeMask.a * uBrushColor.a;

    vec2 grainUV = fract(((vUV - vec2(0.5)) * 500.0 + 0.5 * (uPosition + uLastPosition - (100.0 * (uPosition - uLastPosition)))) / 500.0);
    vec4 grain = texture2D(uCrayonGrain, grainUV);

    vec3 color = uBrushColor.rgb + 0.1 * (vec3(0.5) - uBrushColor.rgb) * (1.0 - alpha);

    vec4 c = 0.8 * vec4(color.rgb * alpha, alpha) + 0.2 * grain * alpha;
    gl_FragColor = vec4(c.rgb, alpha);
}