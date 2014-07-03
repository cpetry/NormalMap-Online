var scene;
var camera;
var renderer;
var texture;
var normal_map;
var normal_map_preview;
var material;
var rotation_enabled = true;
var normal_canvas_preview = document.createElement("canvas");
var model;

var initRenderer = function(){

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 70, container_height / container_height, 0.1, 100 );

	renderer = new THREE.WebGLRenderer({ alpha: false });
	renderer.setSize( container_height, container_height );
	
	document.getElementById('render_view').appendChild( renderer.domElement );

	var height_canvas   = document.getElementById('height_canvas');
	texture  				= new THREE.Texture( height_canvas );
	normal_map_preview  	= new THREE.Texture( normal_canvas_preview );
	normal_map_preview.wrapS = THREE.RepeatWrapping;
	normal_map_preview.wrapT = THREE.RepeatWrapping;
	
	material = new THREE.MeshPhongMaterial ( { 
		ambient: 0x606060, 
        color: 0xcccccc,
		shininess: 25,
		specular: 0x777777,
		shading: THREE.SmoothShading,
		normalMap: normal_map_preview,
		bumpMap: texture,
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
	texture.needsUpdate = true;
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
