var height_image;
var max_height = 300;


var initHeightMap = function(){
	var div_container = document.getElementById("height_map");	
	var canvas = document.getElementById('height_canvas');
	var context = canvas.getContext('2d');
	
	canvas.height = max_height;
	
    height_image = new Image();
	height_image.onload = function () {
		context.drawImage(height_image, 0, 0, height_image.width, height_image.height, 0,0, canvas.width, canvas.height);
		height_image.width = height_image.naturalWidth;
		height_image.height = height_image.naturalHeight;
    };
	
    height_image.src = './images/default_pic.png';
}


initHeightMap();




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
			if(height_image.height > max_height) {
				height_image.width *= max_height / height_image.height;
				height_image.height = max_height;
			}
			else{
				height_image.width = max_height;
				height_image.height = max_height;
			}
			
			var context = height_canvas.getContext("2d");
			context.clearRect(0, 0, height_canvas.width, height_canvas.height);
			height_map_drop.style.width = height_image.width + "px";
			height_map_drop.style.height = height_image.height + "px";
			
			height_canvas.width = height_image.width;
			height_canvas.height = height_image.height;
			
			context.drawImage(height_image, 0, 0, height_canvas.width, height_canvas.height);
		};
		
		height_image.src = source;
	};
	
	
});






var createNormalMap = function(){
	var div_container = document.getElementById("normal_map");
	var normal_canvas = document.getElementById("normal_canvas");	
	var ctx_normal = normal_canvas.getContext("2d");
	
	normal_canvas.height = max_height;
	normal_canvas.width = max_height;
	
	ctx_normal.clearRect(0, 0, normal_canvas.width, normal_canvas.height);
	
	var grayscale = Filters.filterImage(Filters.grayscale, height_image);
	
	// Note that ImageData values are clamped between 0 and 255, so we need
	// to use a Float32Array for the gradient values because they
	// range between -255 and 255.
	
	var img_data = Filters.newsobelfilter(grayscale, 
			document.getElementById("strength_slider").value, 
			document.getElementById("level_slider").value);
	
	var idata = Filters.createImageData(img_data.width, img_data.height);
	
	for (var i=0; i<img_data.data.length; i++)
		idata.data[i] = img_data.data[i];
	
	ctx_normal.putImageData(idata, 0, 0);
	ctx_normal.height = normal_canvas.height;
	ctx_normal.width = normal_canvas.width;
}



