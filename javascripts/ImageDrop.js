var height_image;
var container_height = 300;
var pic_height;
var normal_canvas = document.createElement("canvas");
	

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
		
		
		createNormalMap(); // height map was loaded... so create standard normal map!
    };
	
    height_image.src = './images/standard_height.png';
	
	
}


var scene;
var camera;
var renderer;
var cube;
var texture;
var normal_map;

var initRenderer = function(){

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 70, container_height / container_height, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( container_height, container_height );
	document.getElementById('render_view').appendChild( renderer.domElement );

	var geometry = new THREE.BoxGeometry(1,1,1);
	var height_canvas   = document.getElementById('height_canvas');
	texture  		= new THREE.Texture( height_canvas );
	normal_map  	= new THREE.Texture( normal_canvas );
	var material 	= new THREE.MeshPhongMaterial ( { 
		ambient: 0xbbbbbb, 
        color: 0xbbbbbb,
		specular: 0x555555,
		shininess: 30,
		shading: THREE.SmoothShading,
		normalMap: normal_map,
		metal: false,
        skining: true
	} );
	
	cube = new THREE.Mesh( geometry, material);
	scene.add( cube );
	
	// add subtle ambient lighting
	var ambientLight = new THREE.AmbientLight(0xaaaaaa);
	scene.add(ambientLight);
	
	// directional lighting
	
	var directionalLight = new THREE.DirectionalLight(0xdddddd);
	directionalLight.position.set(2, 1, 1);
	scene.add(directionalLight);
	
	
	camera.position.z = 1.5;

}

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	cube.rotation.x += 0.003;
	cube.rotation.y += 0.003;
	normal_map.needsUpdate = true;
	texture.needsUpdate = true;
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
			
			createNormalMap();
		};
		
		height_image.src = source;
	};
	
	
});


var button = document.getElementById('download');
button.addEventListener('click', function (e) {
    var dataURL = normal_canvas.toDataURL('image/png');
    button.href = dataURL;
});



