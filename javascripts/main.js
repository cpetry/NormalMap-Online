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

initHeightMap();
initRenderer();
render();

TextureEnum = {
    NORMAL : 0,
    DISPLACEMENT : 1,
    AMBIENT : 2,
    SPECULAR : 3
}

var auto_update = true;
var current_texture = TextureEnum.NORMAL;

function activate_texture(type){
	if (type == "normal"){
		document.getElementById('tab_btn_normal').disabled = true;
		document.getElementById('tab_btn_displace').disabled = false;
		document.getElementById('tab_btn_ao').disabled = false;
		//console.log("normal!");
		document.getElementById('normal_map').style.cssText = "";
		document.getElementById('normal_settings').style.cssText = "";
		
		document.getElementById('displacement_map').style.cssText = "display: none;";
		document.getElementById('displacement_settings').style.cssText = "display: none;";
		
		document.getElementById('ao_map').style.cssText = "display: none;";
		document.getElementById('ao_settings').style.cssText = "display: none;";
		document.getElementById('file_name').placeholder = "NormalMap";
		current_texture = TextureEnum.NORMAL;
	}
	
	else if (type == "displace"){
		document.getElementById('tab_btn_normal').disabled = false;
		document.getElementById('tab_btn_displace').disabled = true;
		document.getElementById('tab_btn_ao').disabled = false;
		
		document.getElementById('normal_map').style.cssText = "display: none;";
		document.getElementById('normal_settings').style.cssText = "display: none;";
		
		document.getElementById('displacement_map').style.cssText = "";
		document.getElementById('displacement_settings').style.cssText = "";
		
		document.getElementById('ao_map').style.cssText = "display: none;";
		document.getElementById('ao_settings').style.cssText = "display: none;";
		document.getElementById('file_name').placeholder = "DisplacementMap";
		current_texture = TextureEnum.DISPLACEMENT;
		//console.log("displace!");
	}
	else if (type == "ao"){
		document.getElementById('tab_btn_normal').disabled = false;
		document.getElementById('tab_btn_displace').disabled = false;
		document.getElementById('tab_btn_ao').disabled = true;
		
		document.getElementById('normal_map').style.cssText = "display: none;";
		document.getElementById('normal_settings').style.cssText = "display: none;";
		
		document.getElementById('displacement_map').style.cssText = "display: none;";
		document.getElementById('displacement_settings').style.cssText = "display: none;";
		
		document.getElementById('ao_map').style.cssText = "";
		document.getElementById('ao_settings').style.cssText = "";
		document.getElementById('file_name').placeholder = "AmbientOcclusionMap";
		current_texture = TextureEnum.AMBIENT;
		//console.log("displace!");
	}
}


function setTexturePreview(canvas, img_id,  width, height){
	var img = document.getElementById(img_id);
	

	
	// set preview canvas	
	//canvas.width  = getNextPowerOf2(canvas.width);
	//canvas.height = getNextPowerOf2(canvas.height);
		
	
	img.onload = function(){
	
		var new_width  = width;//getNextPowerOf2(width);
		var new_height = height;//getNextPowerOf2(height);
		
		var ctx_preview = canvas.getContext("2d");
		//ctx_normal_preview.clearRect(     0, 0, new_width, new_height);
		ctx_preview.drawImage(img, 0, 0, new_width, new_height);
		
		setRepeat(document.getElementById('repeat_sliderx').value, document.getElementById('repeat_slidery').value);
		
		normal_map.needsUpdate = true;
		ao_map.needsUpdate = true;
		displacement_map.needsUpdate = true;		
	}
	img.src = canvas.toDataURL('image/jpeg');
	var ratio = width / height;
	//console.log('width' + width);
	//console.log('height' + height);
	img.width = ratio >= 1 ? container_height : (container_height * ratio );
	img.height = ratio >= 1 ? (container_height / ratio ) : container_height;
	
}

function getImageType(){
	var select_file_type = document.getElementById('file_type');
	var file_type = select_file_type.options[select_file_type.selectedIndex].value;
	return file_type;
}

function switchJPGQual(){
	if (getImageType() != 'jpg')
		document.getElementById('file_jpg_qual').style.cssText = "display: none;";
	else
		document.getElementById('file_jpg_qual').style.cssText = "width:40px";
}


function toggleAutoUpdate(){
	auto_update = !auto_update;
	
	if (auto_update)
		createNormalMap();
		createDisplacementMap();
		createAmbientOcclusionTexture();
}

function updateCurrentTexture(){
	if (current_texture == TextureEnum.NORMAL)
		createNormalMap();
	else if (current_texture == TextureEnum.DISPLACEMENT)
		createDisplacementMap();
	else if (current_texture == TextureEnum.AMBIENT)
		createAmbientOcclusionTexture();
}

var button = document.getElementById('download');
button.addEventListener('click', function (e) {
	
	var filesize = 0;
	var qual = 0.9;
	var file_name = "download";
	var canvas;
	
	if (document.getElementById('normal_map').style.cssText != "display: none;"){
		canvas = normal_canvas;
		file_name="NormalMap";
	}
	else if (document.getElementById('displacement_map').style.cssText != "display: none;"){
		canvas = displacement_canvas;
		file_name="DisplacementMap";
	}
	else if (document.getElementById('ao_map').style.cssText != "display: none;"){
		canvas = ao_canvas;
		file_name="AmbientOcclusionMap";
	}
	
	if (document.getElementById('file_name').value != "")
		file_name = document.getElementById('file_name').value;
	
	var file_type = getImageType();
	var image_type = "image/png";
	if (file_type == "jpg")
		image_type = "image/jpeg";
		
	var qual = parseFloat( document.getElementById('file_jpg_qual').value);
	
	canvas.toBlob(function(blob) {
    	saveAs(blob, file_name + "." + file_type);
	}, image_type, qual);
});