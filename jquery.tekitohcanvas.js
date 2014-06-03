/**
 * Rotation and Scaling up or down for image.
 *
 * Copyright (c) youkidearitai (http://tekitoh-memdhoi.info/)
 * Licensed under the MIT License.
 *
 * Version 0.0.1
 */
(function($) {
    var setmaxwidth = function(jq) {
        var imgobjs = getdata(jq);

        if (imgobjs.canvas.width > $(jq).parent().width()) {
            imgobjs.canvas.width  = $(jq).parent().width();
            imgobjs.canvas.height = $(jq).parent().width() * (imgobjs.img.height / imgobjs.img.width);
        }

        return jq;
    };

    var setmaxheight = function(jq) {
        var imgobjs = getdata(jq);

        if (imgobjs.canvas.height > imgobjs.img.height) {
            imgobjs.canvas.height = $(jq).height();
            imgobjs.canvas.width  = $(jq).height() * (imgobjs.img.height / imgobjs.img.width);
        }

        return jq;
    };

    var starttranslate = function(jq) {
        var imgobjs = getdata(jq);

        imgobjs.ctx.clearRect(0, 0, imgobjs.canvas.width, imgobjs.canvas.height);
        imgobjs.ctx.translate((imgobjs.canvas.width / 2), (imgobjs.canvas.height / 2));

        return jq;
    };

    var endtranslate = function(jq) {
        var imgobjs = getdata(jq);
        imgobjs.ctx.translate((-imgobjs.canvas.width / 2), (-imgobjs.canvas.height / 2));
        return jq;
    };

    var moveimage = function(jq, x, y) {
        var imgobjs = getdata(jq);

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

        return jq;
    };

    var moveend = function(jq) {
        var imgobjs = getdata(jq);

        $(imgobjs.canvas).removeClass(imgobjs.moveclass);

        imgobjs.beforex = null;
        imgobjs.beforey = null;

        return jq;
    };

    var mouse = function(jq) {
        var mousemove = function(e) {
            draw(moveimage(jq, e.pageX, e.pageY));
        }
        var mousedown = function(e) {
            jq.mousemove(mousemove);
        }
        var mouseend = function(e) {
            jq.unbind("mousemove");
            moveend(jq);
        }
        jq.mousedown(mousedown).mouseup(mouseend).mouseout(mouseend);

        return jq;
    };

    var getdata = function(jq) {
        return jq.data("tekitohcanvas");
    }

    var setdata = function(jq, data) {
        return jq.data("tekitohcanvas", data);
    }

    var init = function(jq, src, options) {
        var defer = $.Deferred();

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
            reset: function() {
                this.x = 0;
                this.y = 0;
                this.scale = (this.canvas.width / this.img.width);
                this.rect = 0;
            },
            moveclass: "moveImage"
        };

        var options = $.extend(options, {});

        imgobjs.canvas = jq[0];

        if (!imgobjs.canvas || !imgobjs.canvas.getContext) {
            return defer.reject();
        }

        imgobjs.img = new Image();
        imgobjs.img.src = src;

        imgobjs.ctx = imgobjs.canvas.getContext("2d");

        $(imgobjs.img).bind('load', function() {
            imgobjs.canvas.width  = imgobjs.img.width;
            imgobjs.canvas.height = imgobjs.canvas.width * (imgobjs.img.height / imgobjs.img.width);

            if (options['w']) {
                imgobjs.canvas.width = options['w'];
                imgobjs.canvas.height = options['w'] * (imgobjs.img.height / imgobjs.img.width);
            }

            if (options['maxwidth']) {
                setmaxwidth(jq);
            }
            imgobjs.reset();
            draw(mouse(jq));

            return defer.resolve();
        });

        setdata(jq, imgobjs);

        return defer.promise();
    };

    var changeimage = function(jq, src) {
        var imgobjs = getdata(jq);
        var defer = $.Deferred();

        jq.unbind();
        imgobjs.img.src = src;
        $(imgobjs.img).bind('load', defer.resolve);

        return defer.promise();
    };

    var draw = function(jq) {
        var imgobjs = getdata(jq);

        imgobjs.ctx.save();
        imgobjs.ctx.beginPath();

        starttranslate(jq);

        imgobjs.ctx.scale(imgobjs.scale, imgobjs.scale);
        imgobjs.ctx.translate(imgobjs.x, imgobjs.y);
        imgobjs.ctx.rotate(imgobjs.rect * Math.PI / 180);

        endtranslate(jq);

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
        return jq;
    };

    $.fn.extend({
        imgreset: function() {
            return this.each(function() {
                var imgobjs = getdata($(this));
                imgobjs.reset();
                setmaxheight($(this));
                draw($(this));
            });
        },

        canvasviewer: function(src, options) {
            var defer = $.Deferred();

            this.each(function() {;
                var imgobjs = getdata($(this));

                if (typeof imgobjs != "object") {
                    init($(this), src, options).then(defer.resolve);
                } else {
                    changeimage($(this), src).then(defer.resolve);
                }
            });
            return defer.promise();
        },

        wheelscale: function(x, y, delta) {
            return this.each(function() {
                var imgobjs = getdata($(this));
                var scale = imgobjs.scale * Math.pow(1.2, -delta);
                if (0.15 <= scale && scale <= 6.20) {
                    imgobjs.scale = scale;
                    draw($(this));
                }
            });
        },

        rotate: function(rect) {
            return this.each(function() {
                var imgobjs = getdata($(this));
                imgobjs.rect = rect;
                draw($(this));
            });
        },
    	rotate90: function() {
    		return this.each(function() {
                var imgobjs = getdata($(this));

                imgobjs.rect = (imgobjs.rect + 90) % 360;
                draw($(this));
            });
    	}
    });
})(jQuery);
