/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.HorizontalBlurShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"h":        { type: "f", value: 3.0 / 512.0 }

	},

	vertexShader: `
		varying vec2 vUv;

		void main() 
		{
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: `
		uniform sampler2D tDiffuse;
		uniform float h;

		varying vec2 vUv;
		void main() 
		{

			vec4 sum = vec4( 0.0 );
			float lef4 = vUv.x - 4.0 * h;
			float lef3 = vUv.x - 3.0 * h;
			float lef2 = vUv.x - 2.0 * h;
			float lef1 = vUv.x - 1.0 * h;
			float rig1 = vUv.x + 1.0 * h;
			float rig2 = vUv.x + 2.0 * h;
			float rig3 = vUv.x + 3.0 * h;
			float rig4 = vUv.x + 4.0 * h;
			
			lef4 = lef4 >= 0.0 ? lef4 : (1.0 + lef4);
			lef4 = lef4 < 1.0  ? lef4 : (lef4 - 1.0 );
			lef3 = lef3 >= 0.0 ? lef3 : (1.0 + lef3);
			lef3 = lef3 < 1.0  ? lef3 : (lef3 - 1.0 );
			lef2 = lef2 >= 0.0 ? lef2 : (1.0 + lef2);
			lef2 = lef2 < 1.0  ? lef2 : (lef2 - 1.0 );
			lef1 = lef1 >= 0.0 ? lef1 : (1.0 + lef1);
			lef1 = lef1 < 1.0  ? lef1 : (lef1 - 1.0 );
			rig1 = rig1 >= 0.0 ? rig1 : (1.0 + rig1);
			rig1 = rig1 < 1.0  ? rig1 : (rig1 - 1.0 );
			rig2 = rig2 >= 0.0 ? rig2 : (1.0 + rig2);
			rig2 = rig2 < 1.0  ? rig2 : (rig2 - 1.0 );
			rig3 = rig3 >= 0.0 ? rig3 : (1.0 + rig3);
			rig3 = rig3 < 1.0  ? rig3 : (rig3 - 1.0 );
			rig4 = rig4 >= 0.0 ? rig4 : (1.0 + rig4);
			rig4 = rig4 < 1.0  ? rig4 : (rig4 - 1.0 );

			sum += texture2D( tDiffuse, vec2( lef4, vUv.y ) ) * 0.051;
			sum += texture2D( tDiffuse, vec2( lef3, vUv.y ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( lef2, vUv.y ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( lef1, vUv.y ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
			sum += texture2D( tDiffuse, vec2( rig1, vUv.y ) ) * 0.1531;
			sum += texture2D( tDiffuse, vec2( rig2, vUv.y ) ) * 0.12245;
			sum += texture2D( tDiffuse, vec2( rig3, vUv.y ) ) * 0.0918;
			sum += texture2D( tDiffuse, vec2( rig4, vUv.y ) ) * 0.051;
			if (h > 0.0){
				vec4 srcValue = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );
				sum = srcValue + srcValue - sum;
			}
			gl_FragColor = sum;

		}`
};
