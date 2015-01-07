/*
 * Author: Christian Petry
 * Homepage: www.petry-christian.de
 *
 * License: MIT
 * Copyright (c) 2014 Christian Petry
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or 
 * substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR 
 * OTHER DEALINGS IN THE SOFTWARE.
 */

var invert_red = false;
var invert_green = false;
var invert_source = false;
var smoothing = 0;
var strength = 2.5;
var level = 7;
var normal_type = "sobel";
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

	// Note that ImageData values are clamped between 0 and 255, so we need
	// to use a Float32Array for the gradient values because they
	// range between -255 and 255.
		
	var st = new Date().getTime();
	var grayscale = Filters.filterImage(Filters.grayscale, height_image, invert_source);
	//console.log("grayscale: " + (new Date().getTime() - st));
	// smoothing
		
	st = new Date().getTime();
	
	var img_data;
	if (normal_enabled)	
		img_data = Filters.newsobelfilter(grayscale, strength, level, normal_type);
	else
		img_data = Filters.newsobelfilter(grayscale, 0, level, normal_type);
	//console.log("sobelfilter: " + (new Date().getTime() - st));
	
	
	
	var normal = Filters.createImageData(height_image.width, height_image.height);
			
	st = new Date().getTime();
	for (var i=0; i<img_data.data.length; i++){	
		if ((i % 4 == 0 && invert_red)
		|| (i % 4 == 1 && invert_green))
			normal.data[i] = (255.0 - img_data.data[i]);
		else
			normal.data[i] = img_data.data[i];
	}
	//console.log("invertImage: " + (new Date().getTime() - st));
	
	
	if (smoothing > 0)
		gaussiansharpen(normal, height_image.width, height_image.height, Math.abs(smoothing));
	else if (smoothing < 0)
		gaussianblur(normal, height_image.width, height_image.height, Math.abs(smoothing));
		
	
	
	st = new Date().getTime();
	var ctx_normal = normal_canvas.getContext("2d");
	normal_canvas.width  = height_image.width; 	// important!
	normal_canvas.height = height_image.height;
	//ctx_normal.clearRect(0, 0, height_image.width, height_image.height);
	ctx_normal.putImageData(normal, 0, 0, 0, 0, img_data.width, img_data.height);
	setTexturePreview(normal_canvas, "normal_img", img_data.width, img_data.height);
	
	//console.log("setTexturePreview: " + (new Date().getTime() - st));
	
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
		createNormalMap();
	}
}

var timer = Date.now();

var setNormalSetting = function(element, v){
	if (element == "blur_sharp")
		smoothing = v;
	
	else if (element == "strength")
		strength = v;
	
	else if (element == "level")
		level = v;

	else if (element == "type")
		normal_type = v;
		
	if (auto_update && Date.now() - timer > 150){
		createNormalMap();
		timer = Date.now();
	}
}





