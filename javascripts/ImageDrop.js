var height_image;
var container_height = 300;
var pic_height;
var normal_canvas = document.createElement("canvas");
var normal_canvas_preview = document.createElement("canvas");
	

var initHeightMap = function(){
	var div_container = document.getElementById("height_map");	
	var canvas = document.getElementById('height_canvas');
	var context = canvas.getContext('2d');
	
	canvas.height = container_height;
	
    height_image = new Image();
	height_image.onload = function () {
		context.drawImage(height_image, 0, 0, height_image.width, height_image.height, 0,0, canvas.width, canvas.height);
		height_image.width = height_image.naturalWidth;
		height_image.height = height_image.naturalHeight;
		
		document.getElementById("size").value = "" +(height_image.naturalWidth) + " x " + (height_image.naturalHeight);
		
		createNormalMap(); // height map was loaded... so create standard normal map!
    };
	
    height_image.src = './images/standard_height.png';	
}


var scene;
var camera;
var renderer;
var model;
var texture;
var normal_map;
var normal_map_preview;
var material;
var rotation_enabled = 1;

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
		ambient: 0xbbbbbb, 
        color: 0xbbbbbb,
		shininess: 25,
		specular: 0x777777,
		shading: THREE.FlatShading,
		normalMap: normal_map_preview,
		bumpMap: texture,
		metal: false,
        skining: true
	} );
	
	var geometry = new THREE.BoxGeometry(1,1,1);
	model = new THREE.Mesh( geometry, material);
	scene.add( model );
	
	// add subtle ambient lighting
	var ambientLight = new THREE.AmbientLight(0x808080 );
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
	if(rotation_enabled)
		rotation_enabled=0;
	else
		rotation_enabled=1;
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


function isPowerOf2(val){
	if((val & -val) == val)
		return true;
	else 
		return false;
}

require(["dojo/dom", "dojo/domReady!"], function(dom){
	var height_map_drop = dom.byId("height_map"),
		height_canvas = dom.byId("height_canvas");
		
	
	//	DOMReady setup
	height_map_drop.addEventListener("dragover", function(e) {e.preventDefault();}, true);
	height_map_drop.addEventListener("drop", function(e){
		e.preventDefault(); 
		readImage(e.dataTransfer.files[0]);
	}, true);
	
	
	
	var readImage = function(imgFile){
		if(!imgFile.type.match(/image.*/)){
			console.log("The dropped file is not an image: ", imgFile.type);
			return;
		}

		var reader = new FileReader();
		reader.onload = function(e){
			render(e.target.result);
		};
		reader.readAsDataURL(imgFile);
	};

	
	
	var render = function(source){
		height_image = new Image();

		height_image.onload = function(){
			
			height_image.width = container_height;
			height_image.height = container_height;
			
			var context = height_canvas.getContext("2d");
			context.clearRect(0, 0, height_canvas.width, height_canvas.height);
			height_map_drop.width = height_image.width;
			height_map_drop.height = height_image.height;
			
			height_canvas.width = height_image.width;
			height_canvas.height = height_image.height;
			
			context.drawImage(height_image, 0, 0, height_canvas.width, height_canvas.height);
			height_image.width = height_image.naturalWidth;
			height_image.height = height_image.naturalHeight;
			
			var size_text = "" + (height_image.width) + " x " + (height_image.height);
			size_text += (!isPowerOf2(height_image.width) && !isPowerOf2(height_image.height)) ? " NOT POWER OF 2 !" : "";
			document.getElementById("size").value = size_text;
			
			createNormalMap();
		};
		
		height_image.src = source;
	};
	
	
});




var button = document.getElementById('download');
button.addEventListener('click', function (e) {
	
	var filesize = 0;
	var qual = 0.9;
	var pic;
	
	
	// reduce file size so that it can be downloaded
	do{
		pic = normal_canvas.toDataURL('image/jpeg', qual);
		filesize = pic.length;
		console.log("size of pic: " + filesize); 
		qual -= 0.1;
	}while(filesize >= 2000000);
	//pic.src.replace("image/png", "image/octet-stream");
    button.href = pic;
});



