var invert_red = false;
var invert_green = false;
var invert_source = false;
var smoothing = 0;
var strength = 2.5;
var level = 7;
var auto_update = true;
var normal_canvas = document.createElement("canvas");

var getNextPowerOf2 = function(nmb){
	i = 2;
	while(i < Math.pow(2,14)){
		i *= 2;
		if(i >= nmb)
			return i;
	}
}

var createNormalMap = function(){

	
	var div_container = document.getElementById("normal_map");
	var img = document.getElementById("normal_img");
	
	// Note that ImageData values are clamped between 0 and 255, so we need
	// to use a Float32Array for the gradient values because they
	// range between -255 and 255.
	var grayscale = Filters.filterImage(Filters.grayscale, height_image, invert_source);
	
	// smoothing
	if (smoothing > 0)
		Filters.gaussiansharpen(grayscale, height_image.width, height_image.height, Math.abs(smoothing));
	else if (smoothing < 0)
		Filters.gaussianblur(grayscale, height_image.width, height_image.height, Math.abs(smoothing));
		
	
	var img_data = Filters.newsobelfilter(grayscale, strength, level);
	
	
	/*
	var weight_array = []
	for( var i = 0; i < smoothing * smoothing; i++)
		weight_array.push(1.0 / (smoothing * smoothing));
	
	if (smoothing >= 2)
		img_data = Filters.convoluteFloat32(img_data, weight_array);
	*/
	
	
	
	// calc average value at the border of height tex
	var top_left = grayscale.data[0];
	var top_right = grayscale.data[(height_image.width-1)*4];
	var bottom_left = grayscale.data[((height_image.width-1) * (height_image.height-1)*4) - (height_image.width-1)*4];
	var bottom_right = grayscale.data[((height_image.width-1) * (height_image.width-1)*4)];
	//console.log((top_left + top_right + bottom_left + bottom_right) / 4.0 / 255.0);
	//displacement_bias = (top_left + top_right + bottom_left + bottom_right) / 4.0 / 255.0;
	
	
	
	var height_map = Filters.createImageData(img_data.width, img_data.height);
	
	for (var i=0; i<img_data.data.length; i++){	
		if ((i % 4 == 0 && invert_red)
		|| (i % 4 == 1 && invert_green))
			height_map.data[i] = (1.0 - img_data.data[i]) * 255.0;
		else
			height_map.data[i] = img_data.data[i] * 255.0;
	}
	
	var ctx_normal = normal_canvas.getContext("2d");
	normal_canvas.width = height_image.width; 	// important!
	normal_canvas.height = height_image.height;
	ctx_normal.clearRect(0, 0, height_image.width, height_image.height);
	ctx_normal.putImageData(height_map, 0, 0, 0, 0, img_data.width, img_data.height);	
	
	
	
	
	var ao_map = Filters.createImageData(img_data.width, img_data.height);
	
	// invert colors if needed
	var v = 0;
	for (var i=0; i<img_data.data.length; i += 4){
		v = (img_data.data[i] + img_data.data[i+1] + img_data.data[i+2]) * 0.33 * 255.0;
		ao_map.data[i]   = v;
		ao_map.data[i+1] = v;
		ao_map.data[i+2] = v;
		ao_map.data[i+3] = 255;
	}
	var ctx_ao = ao_canvas.getContext("2d");
	ao_canvas.width = height_image.width;
	ao_canvas.height = height_image.height;
	ctx_ao.clearRect(0, 0, height_image.width, height_image.height);
	ctx_ao.putImageData(ao_map, 0, 0, 0, 0, img_data.width, img_data.height);	
	
	img.src = normal_canvas.toDataURL('image/jpeg');
		
	
	img.onload = function(){
	
		// set preview canvas	
		normal_canvas_preview.width = getNextPowerOf2(height_image.width);
		normal_canvas_preview.height = getNextPowerOf2(height_image.height);
		
		var new_width = getNextPowerOf2(img_data.width);
		var new_height = getNextPowerOf2(img_data.height);
		
		var ctx_normal_preview = normal_canvas_preview.getContext("2d");
		ctx_normal_preview.clearRect(0, 0, new_width, new_height);
		ctx_normal_preview.drawImage(img, 0, 0, new_width, new_height);
		
		setRepeat(document.getElementById('repeat_sliderx').value, document.getElementById('repeat_slidery').value);
	}
	
}


var invertRed = function(){
	invert_red = !invert_red;
	
	if (auto_update)
		createNormalMap();
}

var invertGreen = function(){
	invert_green = !invert_green;
	
	if (auto_update)
		createNormalMap();
}

var invertSource = function(){
	invert_source = !invert_source;
	
	if (auto_update){
		setDisplacementStrength(strength, level);
		createNormalMap();
	}
}

var timer = 0;

var setNormalSetting = function(element, v){
	if (element == "blur_sharp")
		smoothing = v;
	
	else if (element == "strength")
		strength = v;
	
	else if (element == "level")
		level = v;
		
	if(timer == 0)
		timer = Date.now();
		
	if (auto_update && Date.now() - timer > 50){
		setDisplacementStrength(strength, level);
		createNormalMap();
		timer = 0;
	}
}


function toggleAutoUpdate(){
	auto_update = !auto_update;
	
	if (auto_update)
		createNormalMap();
}



