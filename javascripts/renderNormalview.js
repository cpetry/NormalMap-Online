var renderer_Normalview;
var composer_Normalview;
var scene_Normalview;
var camera_Normalview;
var normalmap_uniforms;
var height_map;
var NormalRenderScene;
var gaussian_shader_y, gaussian_shader_x;
var copyPass;

function renderNormalView() {
	// request new frame
	//composer_Normalview.addPass( gaussian_shader_y );
	//composer_Normalview.addPass( gaussian_shader_x );
	//renderer_Normalview.clear();
	//renderer_Normalview.render(scene_Normalview, camera_Normalview);

	composer_Normalview.render( 1 / 60 );
	
}

function renderNormalview_init(){
	
	var width = height_image.width;
	var height = height_image.height;
	renderer_Normalview = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: normal_canvas });
	renderer_Normalview.setClearColor( 0x000000, 0 ); // the default
	//camera_Normalview = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 10 );
	camera_Normalview = new THREE.OrthographicCamera(  1 / - 2, 1 / 2, 1 / 2, 1 / - 2, 0, 1);
	scene_Normalview = new THREE.Scene();
	
	
	// start the renderer
	renderer_Normalview.setSize(width, height);
	
	// attach the render-supplied DOM element
	//$('#normal_map').append(renderer_Normalview.domElement);

	var shader = THREE.NormalMapShader;
	normalmap_uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	
	height_map				= new THREE.Texture( height_image );
	height_map.wrapS 		= height_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
	height_map.minFilter 	= height_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
	height_map.anisotropy   = 2;
	normalmap_uniforms["tDiffuse"].value = height_map;
	normalmap_uniforms["dimensions"].value = [width, height, 0];
	normalmap_uniforms["dz"].value = 1.0 / document.getElementById('strength_nmb').value * (1.0 + Math.pow(2.0, document.getElementById('level_nmb').value));
	
	var parameters = { 
		fragmentShader: shader.fragmentShader, 
		vertexShader: shader.vertexShader, 
		uniforms: normalmap_uniforms
	};
	var material = new THREE.ShaderMaterial( parameters );
	material.wrapAround = true;
	material.transparent = true;
	//geometry = new THREE.PlaneBufferGeometry(2, 2, 2, 2);
	var geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
	var plane = new THREE.Mesh( geometry, material );
	
	scene_Normalview.add(plane);
	
	NormalRenderScene = new THREE.RenderPass( scene_Normalview, camera_Normalview );
	//NormalRenderScene.renderToScreen = true;

	// Prepare the blur shader passes
	gaussian_shader_y = new THREE.ShaderPass( THREE.VerticalBlurShader );
	gaussian_shader_x = new THREE.ShaderPass( THREE.HorizontalBlurShader );
	 
	var bluriness = 0;
 
	gaussian_shader_y.uniforms[ "v" ].value = bluriness / width;
	gaussian_shader_x.uniforms[ "h" ].value = bluriness / height;

	gaussian_shader_x.renderToScreen = true;
	
	//copyPass = new THREE.ShaderPass( THREE.CopyShader );
	//copyPass.renderToScreen = true;
	//composer_Normalview.addPass( copyPass );

	var renderTargetParameters = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, stencilBufer: false };
	renderTarget = new THREE.WebGLRenderTarget( height_image.width, height_image.height, renderTargetParameters );
	composer_Normalview = new THREE.EffectComposer( renderer_Normalview, renderTarget );
	composer_Normalview.setSize( height_image.naturalWidth, height_image.naturalHeight );
	composer_Normalview.addPass( NormalRenderScene );
	composer_Normalview.addPass( gaussian_shader_y );	
	composer_Normalview.addPass( gaussian_shader_x );
	
	
	
	// draw!
	renderNormalView();
	
	/*
	//POST PROCESSING
	//Create Effects Composer
	composer_Normalview = new THREE.EffectComposer( renderer_Normalview );
	//Create Shader Passes
	var renderPass = new THREE.RenderPass( scene_Normalview, camera_Normalview );
	testPass = new THREE.ShaderPass( THREE.NormalMapShader );
	//Add Shader Passes to Composer - order is important
	composer_Normalview.addPass( renderPass );
	composer_Normalview.addPass( testPass );
	//set last pass in composer chain to renderToScreen
	testPass.renderToScreen = true;
	renderNormalview();*/
}

function renderNormalview_update(){
	//composer_Normalview = new THREE.EffectComposer( renderer_Normalview, renderTarget );
	var width = height_image.naturalWidth;
	var height = height_image.naturalHeight;
	height_map				= new THREE.Texture( height_image );
	height_map.wrapS 		= height_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
	height_map.minFilter 	= height_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
	height_map.anisotropy   = 2;
	normalmap_uniforms["tDiffuse"].value = height_map;
	normalmap_uniforms["dimensions"].value = [width, height, 0];

	renderer_Normalview.setSize( width, height );
	composer_Normalview.setSize( width, height );
	composer_Normalview.addPass( NormalRenderScene );
	composer_Normalview.addPass( gaussian_shader_y );	
	composer_Normalview.addPass( gaussian_shader_x );
	renderNormalView();
}
