uniform sampler2D texmap;

varying vec2 vUv;

void main() {

    vec4 color = texture2D( texmap, vUv );
    gl_FragColor = vec4( color.r, color.g, color.b, 0.2 );

			}