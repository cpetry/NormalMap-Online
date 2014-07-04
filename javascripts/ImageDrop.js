var height_image;
var container_height = 300;
	

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
			
			if (auto_update)
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
		//console.log("size of pic: " + filesize); 
		qual -= 0.1;
	}while(filesize >= 2000000);
	//pic.src.replace("image/png", "image/octet-stream");
    button.href = pic;
});



