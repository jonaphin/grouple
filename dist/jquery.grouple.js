/*! Grouple - v0.1.0 - 2012-04-28
* https://github.com/jonaphin/grouple
* Copyright (c) 2012 Jonathan Lancar; Licensed MIT */

(function($) {
  var Grouple = function(container, opts) {
    var self = this;

    // That's what Grouples do. They store items
    this.items = [];

    this.settings = $.extend({}, opts);

    this.canvasWidth = $(container).width();
    this.canvasHeight = $(container).height();
    this.centerX = this.canvasWidth / 2;
    this.centerY = this.canvasHeight / 2;
    // choose the smaller side as outer radius
    this.radiusOuter = (this.centerX < this.centerY ? this.centerX : this.centerY) * 0.9;
    this.radiusInner = this.radiusOuter * 0.6;

    /* initialize canvas */
    $(container).html('<canvas class="grouple-canvas" width="'+this.canvasWidth+'" height="'+this.canvasHeight+'"></canvas>');
    var canvas = $(container).find("canvas")[0];
    var ctx = canvas.getContext("2d");

    /* render */
    this.render = function() {
      self.circle(self.centerX, self.centerY, self.radiusInner);

      if(self.settings.strokeWidth > 0) {
        self.stroke(self.settings.strokeWidth, self.settings.strokeColor);
      }
    };

    /* Animation */
    this.expand = function(fromRadius, toRadius) {
      if(fromRadius === toRadius) {
        return;
      }

      self.clear();

      if(fromRadius < toRadius) {
        fromRadius++;
      } else if(fromRadius > toRadius) {
        fromRadius--;
      }

      self.circle(self.centerX, self.centerY, fromRadius);

      setTimeout(function(){
        self.expand(fromRadius, toRadius);
      }, 10);
    };

    /* Core Drawing Functions */
    this.circle = function(centerX, centerY, radius, fillColor) {
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    };

    this.stroke = function(width, color) {
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.stroke();
    };

    this.clear = function() {
      ctx.clearRect(0, 0, self.canvasWidth, self.canvasHeight);
    };

    /* Events Functions */
    function event_to_canvas (event) {
      if (event.layerX || event.layerX === 0 ) { // Firefox
        event._x = event.layerX;
        event._y = event.layerY;
      } else if (event.offsetX || event.offsetX === 0) { // Opera
        event._x = event.offsetX;
        event._y = event.offsetY;
      }

      // Map the event to the object's handler
      var handler = self[event.type];
      if (typeof handler === "function") {
        handler(event);
      }
    }
  };


  /* jQuery Plugin */

  // Collection method.
  $.fn.grouple = function(opts) {
    var self = this;
    opts = $.extend({}, $.fn.grouple.options, opts);

    this.opts = opts;

    /* Allow Options to be set by the user */
    this.options = function(obj) {
      if(typeof obj === "string") {
        return opts[obj];
      }

      if(typeof obj === "object") {
        for(var prop in obj) {
          if(obj.hasOwnProperty(prop)) {
            opts[prop] = obj[prop];
          }
        }
      }

      // we want to refresh the view with the new options
      self.refresh();

      return opts;
    };

    this.refresh = function() {
      // redraw here
    };

    return this.each(function() {
      if($(this).data("grouple_instance") !== undefined) {
        return;
      }

      var instance = new Grouple(this, self.options);
      instance.render();

      $(this).data("grouple_instance", instance);
    });
  };

  $.fn.grouple.options = {
    strokeWidth: 0,
    strokeColor: "#000000"
  };
}(jQuery));
