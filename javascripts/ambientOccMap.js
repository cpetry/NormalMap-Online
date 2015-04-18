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

var ao_canvas = document.createElement("canvas");
var ao_smoothing = -10;
var ao_strength = 0.5;
var ao_level = 7;
var invert_ao = false;

function createAmbientOcclusionTexture(){
	var st = new Date().getTime();
	
	var grayscale = Filters.filterImage(Filters.grayscale, height_image, invert_source);
	
	var sobelfiltered = Filters.sobelfilter(grayscale, ao_strength, ao_level);
	
	var ao_map = Filters.createImageData(height_image.width, height_image.height);
	
	if (ao_smoothing > 0)
		gaussiansharpen(sobelfiltered, height_image.width, height_image.height, Math.abs(ao_smoothing));
	else if (ao_smoothing < 0)
		gaussianblur(sobelfiltered, height_image.width, height_image.height, Math.abs(ao_smoothing));
	
	var v = 0;
	for (var i=0; i<sobelfiltered.data.length && i<grayscale.data.length; i += 4){
		v = (sobelfiltered.data[i] + sobelfiltered.data[i+1]) * 0.5;
		v -= grayscale.data[i] * 0.5 - 0.5 * 255.0;
		v = Math.max(0, Math.min(255, v));
		v = invert_ao ? 255-v : v;
		ao_map.data[i]   = v;
		ao_map.data[i+1] = v;
		ao_map.data[i+2] = v;
		//ao_map.data[i+3] = 255;
		ao_map.data[i+3] = grayscale.data[i+3];
	}
	
	
	
	// write out texture
	var ctx_ambient = ao_canvas.getContext("2d");
	ao_canvas.width = grayscale.width;
	ao_canvas.height = grayscale.height;
	ctx_ambient.clearRect(0, 0, grayscale.width, grayscale.height);
	ctx_ambient.putImageData(ao_map, 0, 0, 0, 0, grayscale.width, grayscale.height);
	
	setTexturePreview(ao_canvas, "ao_img", grayscale.width, grayscale.height);
	//console.log("AmbientOcc: " + (new Date().getTime() - st));
}


	
var invertAO = function(){
	invert_ao = !invert_ao;
	
	if (auto_update && Date.now() - timer > 50)
		createAmbientOcclusionTexture();
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