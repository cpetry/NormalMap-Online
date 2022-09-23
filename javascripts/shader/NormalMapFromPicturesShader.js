THREE.NormalMapFromPicturesShader = {
	uniforms: {
		//"type": 		{type: "1i", value: 0},
    	"invertR": 		{type: "1f", value: 1},
    	"invertG": 		{type: "1f", value: 1},
    	"invertH": 		{type: "1f", value: 1},
    	"dz":           {type: "1f", value: 0},
    	"dimensions": 	{type: "fv", value: [0, 0, 0]},
    	"tAbove": 		{type: "t", value: null },
    	"tLeft": 		{type: "t", value: null },
    	"tRight": 		{type: "t", value: null },
    	"tBelow": 		{type: "t", value: null },
    	"heightOffset": {type: "1i", value: 0}
	},

	vertexShader: `
		precision mediump float;
        varying vec2 vUv;
		varying vec2 step;
        uniform vec3 dimensions;
        void main() 
		{
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			step = vec2(-1.0 / dimensions.x, -1.0 / dimensions.y); // - to switch from glsl orientation to my orientation :D
			vUv = uv;
		}`,

	fragmentShader: `
		precision mediump float;
        uniform vec3 dimensions;
        varying vec2 vUv;
        varying vec2 step;
        uniform float dz;
        uniform float invertR;
        uniform float invertG;
        uniform float invertH;
        
		uniform sampler2D tAbove;
		uniform sampler2D tLeft;
		uniform sampler2D tRight;
		uniform sampler2D tBelow;
		uniform int heightOffset;
        
		void main(void) 
		{
			vec4 A = vec4((1.0 - texture2D(tLeft,  vUv.xy).r) * 0.5, (1.0 - texture2D(tAbove, vUv.xy).g) * 0.5, 0.5, 1);
			vec4 B = vec4(texture2D(tRight, vUv.xy).r * 0.5 + 0.5, texture2D(tBelow, vUv.xy).g * 0.5 + 0.5, 0, 1);

			float r = (A.r <= 0.5) ? (B.r * A.r * 2.0) : (1.0 - 2.0*(1.0-A.r) * (1.0 - B.r));
			float g = (A.g <= 0.5) ? (B.g * A.g * 2.0) : (1.0 - 2.0*(1.0-A.g) * (1.0 - B.g));
			float b = dz;
			vec4 overlay = vec4(r, g, b, 1);
			vec4 normal = vec4(normalize(vec3((r-0.5) * invertR * invertH * 255.0, (g-0.5) * invertG * invertH * 255.0, b)), 1);
			gl_FragColor = (heightOffset == 0) ? vec4(1.0 - (normal.xy * 0.5 + 0.5), normal.zw) : vec4(1.0 - (normal.xyz * 0.5 + 0.5), normal.w);
		}`
}