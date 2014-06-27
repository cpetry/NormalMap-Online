
function Filters()
{
}

Filters.getPixels = function(img) {
	
	var c = this.getCanvas(img.width, img.height);
	var ctx = c.getContext('2d');
	ctx.drawImage(img, 0, 0,img.width, img.height);
	return ctx.getImageData(0, 0, c.width, c.height);
};

Filters.getCanvas = function(w,h) {
  var c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

Filters.filterImage = function(filter, image, var_args) {
  var args = [this.getPixels(image)];
  for (var i=2; i<arguments.length; i++) {
	args.push(arguments[i]);
  }
  return filter.apply(null, args);
};

Filters.brightness = function(pixels, adjustment) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
	d[i] += adjustment;
	d[i+1] += adjustment;
	d[i+2] += adjustment;
  }
  return pixels;
};

Filters.tmpCanvas = document.createElement('canvas');
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

Filters.createImageData = function(w,h) {
  return this.tmpCtx.createImageData(w,h);
};


Filters.convoluteFloat32 = function(pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side/2);

  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;

  var w = sw;
  var h = sh;
  var output = {
	width: w, height: h, data: new Float32Array(w*h*4)
  };
  var dst = output.data;

  var alphaFac = opaque ? 1 : 0;

  for (var y=0; y<h; y++) {
	for (var x=0; x<w; x++) {
	  var sy = y;
	  var sx = x;
	  var dstOff = (y*w+x)*4;
	  var r=0, g=0, b=0, a=0;
	  for (var cy=0; cy<side; cy++) {
		for (var cx=0; cx<side; cx++) {
		  var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
		  var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
		  var srcOff = (scy*sw+scx)*4;
		  var wt = weights[cy*side+cx];
		  r += src[srcOff] * wt;
		  g += src[srcOff+1] * wt;
		  b += src[srcOff+2] * wt;
		  a += src[srcOff+3] * wt;
		}
	  }
	  dst[dstOff] = r;
	  dst[dstOff+1] = g;
	  dst[dstOff+2] = b;
	  dst[dstOff+3] = a + alphaFac*(255-a);
	}
  }
  return output;
};


Filters.grayscale = function(pixels, args) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
	var r = d[i];
	var g = d[i+1];
	var b = d[i+2];
	// CIE luminance for the RGB
	// The human eye is bad at seeing red and blue, so we de-emphasize them.
	var v = 0.2126*r + 0.7152*g + 0.0722*b;
	d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};

Filters.newsobelfilter = function(pixels, strength, level){
	var src = pixels.data;

	var w = pixels.width;
	var h = pixels.height;
	var output = {
		width: w, height: h, data: new Float32Array(w*h*4)
	};
	
	var dst = output.data;
	
	for (var y=0; y<h; y++) {
		for (var x=0; x<w; x++) {
			var dstOff = (y*w+x)*4;
	
			var tl = src[Math.min(Math.max(dstOff - 4 - w*4,0),w*h*4-1)];   // top left  
			var  l = src[Math.min(Math.max(dstOff - 4      ,0),w*h*4-1)];   // left  
			var bl = src[Math.min(Math.max(dstOff - 4 + w*4,0),w*h*4-1)];   // bottom left  
			var  t = src[Math.min(Math.max(dstOff - w*4    ,0),w*h*4-1)];   // top  
			var  b = src[Math.min(Math.max(dstOff + w*4    ,0),w*h*4-1)];   // bottom  
			var tr = src[Math.min(Math.max(dstOff + 4 - w*4,0),w*h*4-1)];   // top right  
			var  r = src[Math.min(Math.max(dstOff + 4      ,0),w*h*4-1)];   // right  
			var br = src[Math.min(Math.max(dstOff + 4 + w*4,0),w*h*4-1)];   // bottom right  
    
   
			var dX = tr + 2.0*r + br -tl - 2.0*l - bl;
			var dY = bl + 2.0*b + br -tl - 2.0*t - tr;
			var dZ = 1.0 / strength * (1.0 + Math.pow(2.0, level));
			
			var l = Math.sqrt((dX * dX) + (dY * dY) + (dZ * dZ));
			
			dst[dstOff] = (dX/l * 0.5 + 0.5) * 255.0; 	// red
			dst[dstOff+1] = (dY/l * 0.5 + 0.5) * 255.0; 	// green
			dst[dstOff+2] = dZ/l * 255.0; 				// blue
			dst[dstOff+3] = 255.0;
		}
	}
	return output;
}