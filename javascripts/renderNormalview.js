var renderer_Normalview;
var composer_Normalview;
var scene_Normalview;
var camera_Normalview;
var normalmap_uniforms, normalmap_from_pictures_uniforms;
var height_map;
var picture_above_map, picture_left_map, picture_right_map, picture_below_map;
var NormalRenderScene;
var gaussian_shader_y, gaussian_shader_x;
var copyPass;
var normal_map_material, normal_map_from_pictures_material;
var render_mesh;
var mesh_geometry;

function renderNormalView() {
	// request new frame
	//composer_Normalview.addPass( gaussian_shader_y );
	//composer_Normalview.addPass( gaussian_shader_x );
	//renderer_Normalview.clear();
	//renderer_Normalview.render(scene_Normalview, camera_Normalview);

	composer_Normalview.render( 1 / 60 );
	
}

function renderNormalview_init(){
	
	renderer_Normalview = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: normal_canvas });
	renderer_Normalview.setClearColor( 0x000000, 0 ); // the default
	//camera_Normalview = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 10 );
	camera_Normalview = new THREE.OrthographicCamera(  1 / - 2, 1 / 2, 1 / 2, 1 / - 2, 0, 1);
	scene_Normalview = new THREE.Scene();
	
	
	// start the renderer
	renderer_Normalview.setSize(height_image.width, height_image.height);
	
	// attach the render-supplied DOM element
	//$('#normal_map').append(renderer_Normalview.domElement);

	// normal map shader
	var normal_map_shader = THREE.NormalMapShader;
	normalmap_uniforms = THREE.UniformsUtils.clone( normal_map_shader.uniforms );
	
	height_map				= new THREE.Texture( height_image );
	height_map.wrapS 		= height_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
	height_map.minFilter 	= height_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
	height_map.anisotropy   = 2;
	normalmap_uniforms["tHeightMap"].value = height_map;
	normalmap_uniforms["dimensions"].value = [height_image.width, height_image.height, 0];
	normalmap_uniforms["dz"].value = 1.0 / document.getElementById('strength_nmb').value * (1.0 + Math.pow(2.0, document.getElementById('level_nmb').value));
	
	var normal_map_parameters = { 
		fragmentShader: normal_map_shader.fragmentShader, 
		vertexShader: normal_map_shader.vertexShader, 
		uniforms: normalmap_uniforms
	};

	// normal map from pictures shader
	var normal_map_from_pictures_shader = THREE.NormalMapFromPicturesShader;
	normalmap_from_pictures_uniforms = THREE.UniformsUtils.clone( normal_map_from_pictures_shader.uniforms );
	
	picture_above_map				= new THREE.Texture( picture_above );
	picture_above_map.wrapS 		= picture_above_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
	picture_above_map.minFilter 	= picture_above_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
	picture_above_map.anisotropy   	= 2;
	picture_left_map				= new THREE.Texture( picture_left );
	picture_left_map.wrapS 			= picture_above_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
	picture_left_map.minFilter 		= picture_above_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
	picture_left_map.anisotropy   	= 2;
	picture_right_map				= new THREE.Texture( picture_right );
	picture_right_map.wrapS 		= picture_above_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
	picture_right_map.minFilter 	= picture_above_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
	picture_right_map.anisotropy   	= 2;
	picture_below_map				= new THREE.Texture( picture_below );
	picture_below_map.wrapS 		= picture_above_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
	picture_below_map.minFilter 	= picture_above_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
	picture_below_map.anisotropy   	= 2;
	normalmap_from_pictures_uniforms["tAbove"].value = picture_above_map;
	normalmap_from_pictures_uniforms["tLeft"].value = picture_left_map;
	normalmap_from_pictures_uniforms["tRight"].value = picture_right_map;
	normalmap_from_pictures_uniforms["tBelow"].value = picture_below_map;
	normalmap_from_pictures_uniforms["dimensions"].value = [picture_above.width, picture_above.height, 0];
	//normalmap_from_pictures_uniforms["dz"].value = 1.0 / document.getElementById('strength_nmb').value * (1.0 + Math.pow(2.0, document.getElementById('level_nmb').value));

	var normal_map_from_pictures_parameters = { 
		fragmentShader: normal_map_from_pictures_shader.fragmentShader, 
		vertexShader: normal_map_from_pictures_shader.vertexShader, 
		uniforms: normalmap_from_pictures_uniforms
	};

	normal_map_material = new THREE.ShaderMaterial( normal_map_parameters );
	normal_map_material.wrapAround = true;
	normal_map_material.transparent = true;
	normal_map_from_pictures_material = new THREE.ShaderMaterial( normal_map_from_pictures_parameters );
	normal_map_from_pictures_material.wrapAround = true;
	normal_map_from_pictures_material.transparent = true;
	

	//geometry = new THREE.PlaneBufferGeometry(2, 2, 2, 2);
	mesh_geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
	render_mesh = new THREE.Mesh( mesh_geometry, normal_map_material );
	render_mesh.name = "mesh";
	
	scene_Normalview.add(render_mesh);
	
	NormalRenderScene = new THREE.RenderPass( scene_Normalview, camera_Normalview );
	//NormalRenderScene.renderToScreen = true;

	// Prepare the blur shader passes
	gaussian_shader_y = new THREE.ShaderPass( THREE.VerticalBlurShader );
	gaussian_shader_x = new THREE.ShaderPass( THREE.HorizontalBlurShader );
	 
	var bluriness = 0;
 
	gaussian_shader_y.uniforms[ "v" ].value = bluriness / height_image.width;
	gaussian_shader_x.uniforms[ "h" ].value = bluriness / height_image.height;

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

function renderNormalview_update(map){
	//composer_Normalview = new THREE.EffectComposer( renderer_Normalview, renderTarget );
	
	if (map === "height"){
		height_map				= new THREE.Texture( height_image );
		height_map.wrapS 		= height_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
		height_map.minFilter 	= height_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
		height_map.anisotropy   = 2;
		normalmap_uniforms["tHeightMap"].value = height_map;
		normalmap_uniforms["dimensions"].value = [height_image.naturalWidth, height_image.naturalHeight, 0];

		renderer_Normalview.setSize( height_image.naturalWidth, height_image.naturalHeight );
		composer_Normalview.setSize( height_image.naturalWidth, height_image.naturalHeight );
	}

	else if (map === "picture"){
		picture_above_map				= new THREE.Texture( picture_above );
		picture_above_map.wrapS 		= picture_above_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
		picture_above_map.minFilter 	= picture_above_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
		picture_above_map.anisotropy   	= 2;
		picture_left_map				= new THREE.Texture( picture_left );
		picture_left_map.wrapS 			= picture_above_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
		picture_left_map.minFilter 		= picture_above_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
		picture_left_map.anisotropy   	= 2;
		picture_right_map				= new THREE.Texture( picture_right );
		picture_right_map.wrapS 		= picture_above_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
		picture_right_map.minFilter 	= picture_above_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
		picture_right_map.anisotropy   	= 2;
		picture_below_map				= new THREE.Texture( picture_below );
		picture_below_map.wrapS 		= picture_above_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
		picture_below_map.minFilter 	= picture_above_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
		picture_below_map.anisotropy   	= 2;
		normalmap_from_pictures_uniforms["tAbove"].value = picture_above_map;
		normalmap_from_pictures_uniforms["tLeft"].value = picture_left_map;
		normalmap_from_pictures_uniforms["tRight"].value = picture_right_map;
		normalmap_from_pictures_uniforms["tBelow"].value = picture_below_map;
		normalmap_from_pictures_uniforms["dimensions"].value = [picture_above.width, picture_above.height, 0];

		renderer_Normalview.setSize( picture_above.naturalWidth, picture_above.naturalHeight );
		composer_Normalview.setSize( picture_above.naturalWidth, picture_above.naturalHeight );

		picture_above_map.needsUpdate = true;
		picture_left_map.needsUpdate = true;
		picture_right_map.needsUpdate = true;
		picture_below_map.needsUpdate = true;
	}

	composer_Normalview.addPass( NormalRenderScene );
	composer_Normalview.addPass( gaussian_shader_y );	
	composer_Normalview.addPass( gaussian_shader_x );
	renderNormalView();
}
