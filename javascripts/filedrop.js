
var height_image;
var container_height = 300;

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.
    readImage(files[0]);
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    readImage(evt.target.files[0]);
  }

 document.getElementById('select_file').addEventListener('change', handleFileSelect, false);
/*var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', function(e){
	e.preventDefault(); 
	readImage(e.dataTransfer.files[0]);
}, true);*/

var height_map_drop = document.getElementById("height_map");
var height_canvas = document.getElementById("height_canvas");
height_map_drop.addEventListener("dragover", function(e) {e.preventDefault();}, true);
height_map_drop.addEventListener("drop", function(e){
	e.preventDefault(); 
	readImage(e.dataTransfer.files[0]);
}, true);


function isPowerOf2(val){
	if((val & -val) == val)
		return true;
	else 
		return false;
}

var readImage = function(imgFile){
	if(!imgFile.type.match(/image.*/)){
		console.log("The dropped file is not an image: ", imgFile.type);
		return;
	}

	var reader = new FileReader();
	reader.onload = function(e){
		loadHeightmap(e.target.result);
	};
	reader.readAsDataURL(imgFile);
};



var loadHeightmap = function(source){
	height_image = new Image();
	console.log("reading: ", source.type);
		
	height_image.onload = function(){
		console.log("creating height image");
		
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
		
		if (auto_update)
			createNormalMap();
			
			setNormalSetting('strength', document.getElementById('strength_nmb').value);
			setNormalSetting('level', document.getElementById('level_nmb').value);
			setNormalSetting('blur_sharp', document.getElementById('blur_sharp_nmb').value);
			
			createDisplacementMap(document.getElementById('dm_contrast_nmb').value);
			setDisplacementScale(-document.getElementById('dm_strength_nmb').value);
			
			createAmbientOcclusionTexture();
	};
	
	height_image.src = source;
};

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
		
		setNormalSetting('strength', document.getElementById('strength_nmb').value);
		setNormalSetting('level', document.getElementById('level_nmb').value);
		setNormalSetting('blur_sharp', document.getElementById('blur_sharp_nmb').value);
		
		createDisplacementMap(document.getElementById('dm_contrast_nmb').value);
		setDisplacementScale(-document.getElementById('dm_strength_nmb').value);
		
		createAmbientOcclusionTexture();
    };
	
    height_image.src = './images/standard_height.png';	
}


