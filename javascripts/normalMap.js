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
	renderNormalView();
	setTexturePreview(normal_canvas, "normal_img", normal_canvas.width, normal_canvas.height);
}


var invertRed = function(){
	invert_red = !invert_red;
	if (invert_red)
		normalmap_uniforms["invertR"].value = -1;
	else
		normalmap_uniforms["invertR"].value = 1;
	
	createNormalMap();
}

var invertGreen = function(){
	invert_green = !invert_green;
	if (invert_green)
		normalmap_uniforms["invertG"].value = -1;
	else
		normalmap_uniforms["invertG"].value = 1;
	
	createNormalMap();
}

var invertSource = function(){
	invert_source = !invert_source;
	if (!invert_source)
		normalmap_uniforms["invertH"].value = 1;
	else
		normalmap_uniforms["invertH"].value = -1;

	createNormalMap();
}

var timer = Date.now();

var setNormalSetting = function(element, v){
	if (element == "blur_sharp"){
		smoothing = v;
		gaussian_shader_y.uniforms["v"].value = v / height_image.naturalWidth / 5;
		gaussian_shader_x.uniforms["h"].value = v / height_image.naturalHeight / 5;
	}
	
	else if (element == "strength"){
		strength = v;
		normalmap_uniforms["dz"].value = 1.0 / v * (1.0 + Math.pow(2.0, document.getElementById('level_nmb').value));
	}
	
	else if (element == "level"){
		level = v;
		normalmap_uniforms["dz"].value = 1.0 / document.getElementById('strength_nmb').value * (1.0 + Math.pow(2.0, v));
	}

	else if (element == "type"){
		normal_type = v;
		if (v == "sobel")
			normalmap_uniforms["type"].value = 0;
		else
			normalmap_uniforms["type"].value = 1;
	}
		
	createNormalMap();
}





