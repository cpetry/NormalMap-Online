var ao_canvas = document.createElement("canvas");
var ao_smoothing = -10;
var ao_strength = 0.5;
var ao_level = 7;

function createAmbientOcclusionTexture(){
	
	var grayscale = Filters.filterImage(Filters.grayscale, height_image, invert_source);
	
	var sobelfiltered = Filters.sobelfilter(grayscale, ao_strength, ao_level);
	
	var ao_map = Filters.createImageData(height_image.width, height_image.height);
	
	if (ao_smoothing > 0)
		Filters.gaussiansharpen(sobelfiltered, height_image.width, height_image.height, Math.abs(ao_smoothing));
	else if (ao_smoothing < 0)
		Filters.gaussianblur(sobelfiltered, height_image.width, height_image.height, Math.abs(ao_smoothing));
	
	var v = 0;
	for (var i=0; i<sobelfiltered.data.length && i<grayscale.data.length; i += 4){
		v = (sobelfiltered.data[i] + sobelfiltered.data[i+1]) * 0.5;
		v -= grayscale.data[i] * 0.5 - 0.5 * 255.0;
		v = Math.max(0, Math.min(255, v));
		ao_map.data[i]   = v;
		ao_map.data[i+1] = v;
		ao_map.data[i+2] = v;
		ao_map.data[i+3] = 255;
	}
	
	
	
	// write out texture
	var ctx_ambient = ao_canvas.getContext("2d");
	ao_canvas.width = grayscale.width;
	ao_canvas.height = grayscale.height;
	ctx_ambient.clearRect(0, 0, grayscale.width, grayscale.height);
	ctx_ambient.putImageData(ao_map, 0, 0, 0, 0, grayscale.width, grayscale.height);
	
	setTexturePreview(ao_canvas, "ao_img", grayscale.width, grayscale.height);
}


var setAOSetting = function(element, v){	
	if (element == "blur_sharp")
		ao_smoothing = v;
	
	else if (element == "strength")
		ao_strength = v;
	
	else if (element == "level")
		ao_level = v;
		
	if(timer == 0)
		timer = Date.now();
		
	if (auto_update && Date.now() - timer > 50){
		createAmbientOcclusionTexture();
		timer = 0;
	}
}