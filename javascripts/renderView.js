var scene;
var camera;
var renderer;
var bump_map;
var normal_map;
var normal_map_preview;
var material;
var rotation_enabled = true;
var normal_canvas_preview = document.createElement("canvas");
var model;

var initRenderer = function(){

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 70, container_height / container_height, 0.1, 100 );

	renderer = new THREE.WebGLRenderer({ alpha: false, antialiasing: true  });
	renderer.setSize( container_height, container_height );
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	/*
	var effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );

	effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
	effectFXAA.renderToScreen = true;
	var renderModel = new THREE.RenderPass( scene, camera );
	var composer = new THREE.EffectComposer( renderer );
	composer.addPass( renderModel );
	composer.addPass( effectFXAA );
	*/
	
	document.getElementById('render_view').appendChild( renderer.domElement );

	var height_canvas   = document.getElementById('height_canvas');
	bump_map  				= new THREE.Texture( height_canvas );
	normal_map_preview  	= new THREE.Texture( normal_canvas_preview );
	normal_map_preview.wrapS = THREE.RepeatWrapping;
	normal_map_preview.wrapT = THREE.RepeatWrapping;
	normal_map_preview.magFilter = THREE.LinearFilter;
	normal_map_preview.minFilter = THREE.LinearMipMapNearestFilter;
	normal_map_preview.anisotropy = 2;
	
	material = new THREE.MeshPhongMaterial ( { 
		ambient: 0x606060, 
        color: 0xcccccc,
		shininess: 25,
		specular: 0x777777,
		shading: THREE.SmoothShading,
		normalMap: normal_map_preview,
		bumpMap: bump_map,
		metal: false,
        skining: true
	} );
	
	var geometry = new THREE.BoxGeometry(1,1,1);
	model = new THREE.Mesh( geometry, material);
	scene.add( model );
	
	// add subtle ambient lighting
	var ambientLight = new THREE.AmbientLight(0x606060 );
	scene.add(ambientLight);
	
	// directional lighting
	
	var directionalLight = new THREE.DirectionalLight(0xdddddd, 0.4 );
	directionalLight.position.set(1, 1, 1);
	scene.add(directionalLight);	
	
	var dL2 = new THREE.DirectionalLight( 0xbbdbff, 0.3 );
	dL2.position.set( 0, -1, 1 );
	scene.add( dL2 );
	
	var dL2 = new THREE.DirectionalLight( 0xbbffff, 0.25 );
	dL2.position.set( -3, 1, -1 );
	scene.add( dL2 );
	
	
	camera.position.z = 1.5;
}


function animate() {
    setTimeout( function() {
        requestAnimationFrame( animate );
    }, 1000 / 30 );
    renderer.render();

}

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	if(rotation_enabled){
		model.rotation.x += 0.003;
		model.rotation.y += 0.003;
	}
	normal_map_preview.needsUpdate = true;
	bump_map.needsUpdate = true;
}


var setRepeat = function(v_x, v_y){
	normal_map_preview.repeat.set( v_x, v_y );
}

var setModel = function(type){
	scene.remove( model );

	if (type == "Cube"){
		var geometry = new THREE.BoxGeometry(1,1,1);
		model = new THREE.Mesh( geometry, material);
		scene.add( model );
	}
	else if (type == "Sphere"){
		var geometry = new THREE.SphereGeometry( 0.7, 32, 32);
		model = new THREE.Mesh( geometry, material);
		scene.add( model );
	}
	else if (type == "Cylinder"){
		var geometry = new THREE.CylinderGeometry( 0.7, 0.5, 1, 32 );
		model = new THREE.Mesh( geometry, material);
		scene.add( model );
	}
	else if (type == "Plane"){
		var geometry = new THREE.PlaneGeometry(2,2);
		rotation_enabled = 0;
		model.rotation.x = 0;
		model.rotation.y = 0;
		document.getElementById('input_rot').checked = false;
		model = new THREE.Mesh( geometry, material);
		scene.add( model );
	}
	
}


function toggleRotation(){
	rotation_enabled = !rotation_enabled;
}

function switchRenderView(){
	
}

$(document).ready(function() {
	$(".various").fancybox({
		maxWidth	: 600,
		maxHeight	: 600,
		fitToView	: false,
		width		: 600,
		height		: 600,
		autoSize	: false,
		closeClick	: false,
		openEffect	: 'none',
		closeEffect	: 'none',
		
		afterShow: function(){
			document.getElementById('renderBig').appendChild(renderer.domElement);
			renderer.setSize( 600, 600 );

		},
		afterClose: function(){
			document.getElementById('render_view').appendChild(renderer.domElement);
			renderer.setSize(container_height, container_height );
		}
	});
});
