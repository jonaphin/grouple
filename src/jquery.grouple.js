/*
 * grouple
 * https://github.com/jonaphin/grouple
 *
 * Copyright (c) 2012 Jonathan Lancar
 * Licensed under the MIT license.
 */
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
    this.radiusOuterEnd = (this.centerX < this.centerY ? this.centerX : this.centerY) * 0.9;
    this.radiusInner = this.radiusOuterEnd * 0.6;
    this.radiusOuterInit = this.radiusInner + ((this.radiusOuterEnd - this.radiusInner) / 2);

    /* initialize canvas */
    $(container).html('<canvas class="grouple-canvas" width="'+this.canvasWidth+'" height="'+this.canvasHeight+'"></canvas>');
    var canvas = $(container).find("canvas")[0];
    var ctx = canvas.getContext("2d");

    /* render */
    this.render = function() {
      // Outer Circle Inner Stroke
      self.circle(self.centerX, self.centerY, self.radiusOuterInit, self.settings.outerCircleInnerStrokeColor);
      // Outer Circle outer Stroke
      self.stroke(self.settings.outerStrokeWidth, self.settings.outerStrokeColor);
      // Outer Circle
      self.circle(self.centerX, self.centerY, self.radiusOuterInit - 3, self.settings.outerFillColor);
      // Inner Circle
      self.circle(self.centerX, self.centerY, self.radiusInner, self.settings.innerFillColor);
      // Inner Circle Stroke
      self.stroke(self.settings.innerStrokeWidth, self.settings.innerStrokeColor);
    };

    /* Animation */
    this.expand = function(fromRadius, toRadius) {
      if(parseInt(fromRadius) === parseInt(toRadius)) {
        return;
      }

      self.clear();

      if(fromRadius < toRadius) {
        fromRadius++;
      } else if(fromRadius > toRadius) {
        fromRadius--;
      }

      self.circle(self.centerX, self.centerY, fromRadius, self.settings.outerCircleInnerStrokeColor);
      self.stroke(self.settings.outerStrokeWidth, self.settings.outerStrokeColor);
      self.circle(self.centerX, self.centerY, fromRadius - 3, self.settings.outerFillColor);
      self.circle(self.centerX, self.centerY, self.radiusInner, self.settings.innerFillColor);
      self.stroke(self.settings.innerStrokeWidth, self.settings.innerStrokeColor);

      setTimeout(function(){
        self.expand(fromRadius, toRadius);
      }, 5);
    };

    /* Events */
    $(canvas).live("mouseover", function(e){
      self.expand(self.radiusOuterInit, self.radiusOuterEnd);
    }).live("mouseout", function(e){
      self.expand(self.radiusOuterEnd, self.radiusOuterInit);
    });

    /* Core Drawing Functions */
    this.circle = function(centerX, centerY, radius, fillColor) {
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    };

    this.stroke = function(width, color) {
      if(width === 0) {
        return;
      }

      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.stroke();
    };

    this.clear = function() {
      ctx.clearRect(0, 0, self.canvasWidth, self.canvasHeight);
    };

    /* Events Functions */
    this.event_to_canvas = function(event) {
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
    };
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

      var instance = new Grouple(this, opts);
      instance.render();

      $(this).data("grouple_instance", instance);
    });
  };

  $.fn.grouple.options = {
    innerStrokeWidth: 1,
    innerStrokeColor: "#A9A9A9",
    outerStrokeWidth: 1,
    outerStrokeColor: "#A9A9A9",
    innerFillColor: "#5E99CD",
    outerFillColor: "#EBEBEB",
    outerCircleInnerStrokeColor: "#FFFFFF"
  };
}(jQuery));
