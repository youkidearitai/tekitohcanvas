/**
 * Rotation and Scaling up or down for image.
 *
 * Copyright (c) youkidearitai (http://tekitoh-memdhoi.info/)
 * Licensed under the MIT License.
 *
 * Version 0.0.1
 */
(function($) {
    $.fn.extend({
        imgreset: function() {
            var imgobjs = $.data(this.get(0), "tekitohcanvas");
            imgobjs.reset();

            return this;
        },

        canvasviewer: function(src) {
            var imgobjs = {
                x: 0,
                y: 0,
                beforex: null,
                beforey: null,
                img: null,
                ctx: null,
                rect: 0,
                scale: 1.0,
                canvas: null,
    	    	wheel: false,
                reset: function() {
    	            this.x = 0;
    	    	    this.y = 0;
    	    	    this.scale = (this.canvas.width / this.img.width);
    	    	    this.rect = 0;
                },
                moveclass: "moveImage"
            };

            var self = this;
            var options = arguments[1] ? arguments[1] : null;

            imgobjs.canvas = this[0];
            imgobjs.wheel  = !!this.mousewheel;

            if (!imgobjs.canvas || !imgobjs.canvas.getContext) {
                throw "Your browser can't use canvas.";
                return false;
            }
            imgobjs.img = new Image();
            imgobjs.img.src = src;

            imgobjs.ctx = imgobjs.canvas.getContext("2d");

            imgobjs.img.onload = function() {
                imgobjs.canvas.width  = imgobjs.img.width
                imgobjs.canvas.height = imgobjs.canvas.width * (imgobjs.img.height / imgobjs.img.width);

                var rect = imgobjs.canvas.height / imgobjs.canvas.width;

                if (options) {
                    if (options['w']) {
                        imgobjs.canvas.width = options['w'];
                        imgobjs.canvas.height = options['w'] * (imgobjs.img.height / imgobjs.img.width);
                    }
                }
                imgobjs.reset();
                self.mouse().wheel().drawcanvas();
            }

            $.data(this.get(0), "tekitohcanvas", imgobjs);
            return this;
        },

        setrect: function(x, y) {
            var imgobjs = $.data(this.get(0), "tekitohcanvas");

            if (typeof x != 'undefined' && typeof y != 'undefined') {
                imgobjs.rect = this.mouseradius(imgobjs.canvas.width / 2, imgobjs.canvas.height / 2, x, y);
            } else {
                imgobjs.rect = 0;
            }
            return this;
        },

        starttranslate: function() {
            var imgobjs = $.data(this.get(0), "tekitohcanvas");

            imgobjs.ctx.clearRect(0, 0, imgobjs.canvas.width, imgobjs.canvas.height);
            imgobjs.ctx.translate((imgobjs.canvas.width / 2), (imgobjs.canvas.height / 2));

            return this;
        },
        endtranslate: function() {
            var imgobjs = $.data(this.get(0), "tekitohcanvas");
            imgobjs.ctx.translate((-imgobjs.canvas.width / 2), (-imgobjs.canvas.height / 2));
            return this;
        },

        wheelscale: function(x, y, delta) {
            var imgobjs = $.data(this.get(0), "tekitohcanvas");

            if (delta > 0) {
                imgobjs.scale -= (imgobjs.scale > 0.2 ? 0.1 : 0.0);
            } else if (delta < 0) {
                imgobjs.scale += (imgobjs.scale < 2.0 ? 0.1 : 0.0);
            }

            return this;
        },

        rotate: function(rect) {
            var imgobjs = $.data(this.get(0), "tekitohcanvas");
            imgobjs.rect = rect;
            return this;
        },
    	rotate90: function() {
            var imgobjs = $.data(this.get(0), "tekitohcanvas");

    		imgobjs.rect = (imgobjs.rect + 90) % 360;
    		return this;
    	},

        moveimage: function(x, y) {
            var imgobjs = $.data(this.get(0), "tekitohcanvas");

            $(imgobjs.canvas).addClass(imgobjs.moveclass);

            if (imgobjs.beforex == null) {
                imgobjs.beforex = x;
            }
            if (imgobjs.beforey == null) {
                imgobjs.beforey = y;
            }

            imgobjs.x -= x - imgobjs.beforex;
            imgobjs.y -= y - imgobjs.beforey;

            imgobjs.beforex = x;
            imgobjs.beforey = y;

            return this;
        },

        moveend: function() {
            var imgobjs = $.data(this.get(0), "tekitohcanvas");

            $(imgobjs.canvas).removeClass(imgobjs.moveclass);

            imgobjs.beforex = null;
            imgobjs.beforey = null;
        },

    	changeimage: function(src, event) {
            var imgobjs = $.data(this.get(0), "tekitohcanvas");

    		this.unbind();
    		imgobjs.img.src = src;
    		if (event) {
    			imgobjs.img.onload = event;
    		}
    	},

    	mouse: function() {
    		var self = this;

        	var mousemove = function(e) {
        	    self.moveimage(e.pageX, e.pageY).drawcanvas();
        	}
        	var mousedown = function(e) {
        	    self.mousemove(mousemove);
        	}
        	var mouseend = function(e) {
        	    self.unbind("mousemove").moveend();
        	}
            this.mousedown(mousedown).mouseup(mouseend).mouseout(mouseend);

    		return this;
    	},

    	wheel: function() {
            var imgobjs = $.data(this.get(0), "tekitohcanvas");

    		// You can use jquery.mousewheel plugin for rotate image.
    		if (!imgobjs.wheel) {
    			return this;
    		}

    		var self = this;

    		this.mousewheel(function(e, delta) {
    			self.wheelscale(e.pageX, e.pageY, delta).drawcanvas();
    			return false;
    		});

    		return this;
    	},

        drawcanvas: function() {
            var imgobjs = $.data(this.get(0), "tekitohcanvas");

            imgobjs.ctx.save();
            imgobjs.ctx.beginPath();

            this.starttranslate();

            imgobjs.ctx.scale(imgobjs.scale, imgobjs.scale);
            imgobjs.ctx.translate(imgobjs.x, imgobjs.y);
            imgobjs.ctx.rotate(imgobjs.rect * Math.PI / 180);

            this.endtranslate();

            imgobjs.ctx.drawImage(
                imgobjs.img,
                0,
                0,
                imgobjs.img.width,
                imgobjs.img.height,
                (imgobjs.canvas.width / 2) - (imgobjs.img.width / 2),
                (imgobjs.canvas.height / 2) - (imgobjs.img.height / 2),
                imgobjs.img.width,
                imgobjs.img.height
            );

            imgobjs.ctx.restore();
            return this;
        }
    });
})(jQuery);
