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
		document.getElementById('tab_btn_specular').disabled = false;
		//console.log("normal!");
		document.getElementById('normal_map').style.cssText = "";
		document.getElementById('normal_settings').style.cssText = "";
		
		document.getElementById('displacement_map').style.cssText = "display: none;";
		document.getElementById('displacement_settings').style.cssText = "display: none;";
		
		document.getElementById('ao_map').style.cssText = "display: none;";
		document.getElementById('ao_settings').style.cssText = "display: none;";

		document.getElementById('specular_map').style.cssText = "display: none;";
		document.getElementById('specular_settings').style.cssText = "display: none;";

		document.getElementById('file_name').placeholder = "NormalMap";
		current_texture = TextureEnum.NORMAL;
	}
	
	else if (type == "displace"){
		document.getElementById('tab_btn_normal').disabled = false;
		document.getElementById('tab_btn_displace').disabled = true;
		document.getElementById('tab_btn_ao').disabled = false;
		document.getElementById('tab_btn_specular').disabled = false;
		
		document.getElementById('normal_map').style.cssText = "display: none;";
		document.getElementById('normal_settings').style.cssText = "display: none;";
		
		document.getElementById('displacement_map').style.cssText = "";
		document.getElementById('displacement_settings').style.cssText = "";
		
		document.getElementById('ao_map').style.cssText = "display: none;";
		document.getElementById('ao_settings').style.cssText = "display: none;";

		document.getElementById('specular_map').style.cssText = "display: none;";
		document.getElementById('specular_settings').style.cssText = "display: none;";

		document.getElementById('file_name').placeholder = "DisplacementMap";
		current_texture = TextureEnum.DISPLACEMENT;
		//console.log("displace!");
	}
	else if (type == "ao"){
		document.getElementById('tab_btn_normal').disabled = false;
		document.getElementById('tab_btn_displace').disabled = false;
		document.getElementById('tab_btn_ao').disabled = true;
		document.getElementById('tab_btn_specular').disabled = false;
		
		document.getElementById('normal_map').style.cssText = "display: none;";
		document.getElementById('normal_settings').style.cssText = "display: none;";
		
		document.getElementById('displacement_map').style.cssText = "display: none;";
		document.getElementById('displacement_settings').style.cssText = "display: none;";
		
		document.getElementById('ao_map').style.cssText = "";
		document.getElementById('ao_settings').style.cssText = "";

		document.getElementById('specular_map').style.cssText = "display: none;";
		document.getElementById('specular_settings').style.cssText = "display: none;";

		document.getElementById('file_name').placeholder = "AmbientOcclusionMap";
		current_texture = TextureEnum.AMBIENT;
		//console.log("displace!");
	}
	else if (type == "specular"){
		document.getElementById('tab_btn_normal').disabled = false;
		document.getElementById('tab_btn_displace').disabled = false;
		document.getElementById('tab_btn_ao').disabled = false;
		document.getElementById('tab_btn_specular').disabled = true;
		
		document.getElementById('normal_map').style.cssText = "display: none;";
		document.getElementById('normal_settings').style.cssText = "display: none;";
		
		document.getElementById('displacement_map').style.cssText = "display: none;";
		document.getElementById('displacement_settings').style.cssText = "display: none;";

		document.getElementById('ao_map').style.cssText = "display: none;";
		document.getElementById('ao_settings').style.cssText = "display: none;";
		
		document.getElementById('specular_map').style.cssText = "";
		document.getElementById('specular_settings').style.cssText = "";

		document.getElementById('file_name').placeholder = "SpecularMap";
		current_texture = TextureEnum.SPECULAR;
		//console.log("displace!");
	}
}


function setTexturePreview(canvas, img_id, width, height){
	var img = document.getElementById(img_id);
	

	img.getContext('2d').clearRect ( 0 , 0 , img.width, img.height );

		
	var ratio = width / height;
	var draw_width = ratio >= 1 ? container_height : (container_height * ratio );
	var draw_height = ratio >= 1 ? (container_height / ratio ) : container_height;
	
	var reduce_canvas = document.createElement('canvas');
	reduce_canvas.width = width;
	reduce_canvas.height = height;

	var current_width = width;
	var current_height = height;
	reduce_canvas.getContext('2d').drawImage(canvas, 0, 0, width, height);
	while(2*draw_width < current_width && 2*draw_height < current_height ){
		//console.log("redraw!");
		reduce_canvas.getContext('2d').drawImage(reduce_canvas, 0, 0, reduce_canvas.width * 0.5, reduce_canvas.height * 0.5);
		current_width *= 0.5;
		current_height *= 0.5;
	}
	//console.log(draw_width + ", " + draw_height)
	img.height = draw_height;
	img.width = draw_width;
	img.getContext('2d').drawImage(reduce_canvas, 0, 0, current_width, current_height, 0,0, draw_width, draw_height);
	
	if (canvas == normal_canvas)
		normal_map.needsUpdate = true;
	else{
		ao_map.needsUpdate = true;
	displacement_map.needsUpdate = true;
	specular_map.needsUpdate = true;
	}
}

function toggle_height_column(){

	if ($("#column_height").is(":visible") == true) {
		$("#column_btn_left_div").html("<<");
		$("#column_height").hide("slide", function(){
			/*$(".column").each(function () {
    		$(this).css("width", "438px");
			});
			$(".preview_img").each(function () {
	    		$(this).css("max-width", "400px");
	    		$(this).css("max-height", "400px");
			});
			$(".view").each(function () {
	    		$(this).css("max-width", "400px");
	    		$(this).css("max-height", "400px");
			});
			$(".helper").each(function () {
	    		$(this).css("max-width", "400px");
	    		$(this).css("max-height", "400px");
			});
			container_height = 400;
			updateCurrentTexture();
			renderer.setSize( 400, 400 );*/
		});
	}
	else{
		$("#column_btn_left_div").html(">>");
		/*$(".column").each(function () {
    		$(this).css("width", "338px");
		});
		$(".preview_img").each(function () {
    		$(this).css("max-width", "300px");
    		$(this).css("max-height", "300px");
		});
		$(".view").each(function () {
    		$(this).css("max-width", "300px");
    		$(this).css("max-height", "300px");
		});
		$(".helper").each(function () {
    		$(this).css("max-width", "300px");
    		$(this).css("max-height", "300px");
		});
		container_height = 300;
		updateCurrentTexture();
		renderer.setSize( 300, 300 );*/
		$("#column_height").show("slide");
	}
}

function toggle_preview_column(){

	if ($("#preview").is(":visible") == true) {
		$("#column_btn_right_div").html(">>");
		$("#preview").hide("slide", function(){
			/*$(".column").each(function () {
    		$(this).css("width", "438px");
			});
			$(".preview_img").each(function () {
	    		$(this).css("max-width", "400px");
	    		$(this).css("max-height", "400px");
			});
			$(".view").each(function () {
	    		$(this).css("max-width", "400px");
	    		$(this).css("max-height", "400px");
			});
			$(".helper").each(function () {
	    		$(this).css("max-width", "400px");
	    		$(this).css("max-height", "400px");
			});
			container_height = 400;
			updateCurrentTexture();
			renderer.setSize( 400, 400 );*/
		});
	}
	else{
		$("#column_btn_right_div").html("<<");
		/*$(".column").each(function () {
    		$(this).css("width", "338px");
		});
		$(".preview_img").each(function () {
    		$(this).css("max-width", "300px");
    		$(this).css("max-height", "300px");
		});
		$(".view").each(function () {
    		$(this).css("max-width", "300px");
    		$(this).css("max-height", "300px");
		});
		$(".helper").each(function () {
    		$(this).css("max-width", "300px");
    		$(this).css("max-height", "300px");
		});
		container_height = 300;
		updateCurrentTexture();
		renderer.setSize( 300, 300 );*/
		$("#preview").show("slide");
	}
}

function getImageType(){
	var select_file_type = document.getElementById('file_type');
	var file_type = select_file_type.options[select_file_type.selectedIndex].value;
	return file_type;
}

function switchJPGQual(){
	if (getImageType() != 'jpg'){
		document.getElementById('file_jpg_qual').style.cssText = "display: none;";
		document.getElementById('total_transparency').style.cssText = "font-size:11px;";
	}
	else{
		document.getElementById('total_transparency').style.cssText = "display: none;";	
		document.getElementById('file_jpg_qual').style.cssText = "font-size:11px;";
	}
}


function toggleAutoUpdate(){
	auto_update = !auto_update;
	
	if (auto_update)
		createNormalMap();
		createDisplacementMap();
		createAmbientOcclusionTexture();
		createSpecularTexture();
}

function updateCurrentTexture(){
	if (current_texture == TextureEnum.NORMAL)
		createNormalMap();
	else if (current_texture == TextureEnum.DISPLACEMENT)
		createDisplacementMap();
	else if (current_texture == TextureEnum.AMBIENT)
		createAmbientOcclusionTexture();
	else if (current_texture == TextureEnum.SPECULAR)
		createSpecularTexture();
}

var button = document.getElementById('download');
button.addEventListener('click', function (e) {
	
	var filesize = 0;
	var qual = 0.9;
	var file_name = "download";
	var canvas = document.createElement("canvas");
	
	var file_type = getImageType();
	var image_type = "image/png";
	if (file_type == "jpg")
		image_type = "image/jpeg";

	if (document.getElementById('normal_map').style.cssText != "display: none;"){
		canvas.width = normal_canvas.width;
		canvas.height = normal_canvas.height;
		var context = canvas.getContext('2d');
		if (file_type == "png") 
			context.globalAlpha = $('#transparency_nmb').val() / 100;
		context.drawImage(normal_canvas,0,0);
		file_name="NormalMap";
	}
	else if (document.getElementById('displacement_map').style.cssText != "display: none;"){
		canvas.width = displacement_canvas.width;
		canvas.height = displacement_canvas.height;
		var context = canvas.getContext('2d');
		if (file_type == "png") 
			context.globalAlpha = $('#transparency_nmb').val() / 100;
		context.drawImage(displacement_canvas,0,0);
		file_name="DisplacementMap";
	}
	else if (document.getElementById('ao_map').style.cssText != "display: none;"){
		canvas.width = ao_canvas.width;
		canvas.height = ao_canvas.height;
		var context = canvas.getContext('2d');
		if (file_type == "png") 
			context.globalAlpha = $('#transparency_nmb').val() / 100;
		context.drawImage(ao_canvas,0,0);
		file_name="AmbientOcclusionMap";
	}
	else if (document.getElementById('specular_map').style.cssText != "display: none;"){
		canvas.width = specular_canvas.width;
		canvas.height = specular_canvas.height;
		var context = canvas.getContext('2d');
		if (file_type == "png") 
			context.globalAlpha = $('#transparency_nmb').val() / 100;
		context.drawImage(specular_canvas,0,0);
		file_name="SpecularMap";
	}
	
	if (document.getElementById('file_name').value != "")
		file_name = document.getElementById('file_name').value;
	
	
		
	var qual = $('#file_jpg_qual_nmb').val() / 100;
	
	canvas.toBlob(function(blob) {
    	saveAs(blob, file_name + "." + file_type);
	}, image_type, qual);
});