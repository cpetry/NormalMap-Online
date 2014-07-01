
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

  var sy, sx, dstOff, r, g, b, a, scy, scx, srcOff, wt;
  for (var y=0; y<h; y++) {
	for (var x=0; x<w; x++) {
	  sy = y;
	  sx = x;
	  dstOff = (y*w+x)*4;
	  r=0, g=0, b=0, a=0;
	  for (var cy=0; cy<side; cy++) {
		for (var cx=0; cx<side; cx++) {
		  scy = (sy + cy - halfSide).mod(sh-1);
		  scx = (sx + cx - halfSide).mod(sw-1);
		  srcOff = (scy*sw+scx)*4;
		  wt = weights[cy*side+cx];
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


Filters.grayscale = function(pixels, invert_height) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
	var r = d[i];
	var g = d[i+1];
	var b = d[i+2];
	// CIE luminance for the RGB
	// The human eye is bad at seeing red and blue, so we de-emphasize them.
	var v = 0.2126*r + 0.7152*g + 0.0722*b;
	
	d[i] = d[i+1] = d[i+2] = invert_height ? 255-v : v;
  }
  return pixels;
};

Number.prototype.mod = function(n) {
return ((this%n)+n)%n;
}

Filters.newsobelfilter = function(pixels, strength, level){
	var src = pixels.data;

	var w = pixels.width;
	var h = pixels.height;
	var output = {
		width: w, height: h, data: new Float32Array(w*h*4)
	};
	
	var dst = output.data;
	    
	max_size = w*h*4-1;
	
	var tl, l, bl, t, b, tr, r, br, dX,dY,dZ,l;
	var dZ = 1.0 / strength * (1.0 + Math.pow(2.0, level)); // very costly operation!
	
	for (var y=0; y<h; y++) {
		for (var x=0; x<w; x++) {
			var dstOff = (y*w+x)*4;

			tl = src[(dstOff - 4 - w*4).mod(max_size)];   // top left  
			l  = src[(dstOff - 4      ).mod(max_size)];   // left  
			bl = src[(dstOff - 4 + w*4).mod(max_size)];   // bottom left  
			t  = src[(dstOff - w*4    ).mod(max_size)];   // top  
			b  = src[(dstOff + w*4    ) % max_size];   // bottom  
			tr = src[(dstOff + 4 - w*4).mod(max_size)];   // top right  
			r  = src[(dstOff + 4      ) % max_size];   // right  
			br = src[(dstOff + 4 + w*4) % max_size];   // bottom right  
   
			dX = tr + 2.0*r + br -tl - 2.0*l - bl;
			dY = bl + 2.0*b + br -tl - 2.0*t - tr;

			l = Math.sqrt((dX * dX) + (dY * dY) + (dZ * dZ));
			
			dst[dstOff] = (dX/l * 0.5 + 0.5) * 255.0; 	// red
			dst[dstOff+1] = (dY/l * 0.5 + 0.5) * 255.0; 	// green
			dst[dstOff+2] = dZ/l * 255.0; 				// blue
			dst[dstOff+3] = 255.0;
		}
	}
	
	return output;
}