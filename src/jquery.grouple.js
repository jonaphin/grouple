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

    this.id = this.settings.id;
    this.subsetClassName = "grouple-subset-" + this.id;
    this.container = container;
    this.canvasWidth = $(container).width();
    this.canvasHeight = $(container).height();
    this.centerX = this.canvasWidth / 2;
    this.centerY = this.canvasHeight / 2;
    // choose the smaller side as outer radius
    this.radiusOuterEnd = (this.centerX < this.centerY ? this.centerX : this.centerY) * 0.9;
    this.radiusInner = this.radiusOuterEnd * 0.6;
    this.radiusOuterInit = this.radiusInner + ((this.radiusOuterEnd - this.radiusInner) / 2);
    this.radiusSubsetsRail = this.radiusOuterInit;
    this.radiusSubcircle = this.radiusOuterEnd - this.radiusInner;

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

      for(var i = 0; i < 360; i+=45) {
        self.items.push(self.subcircle(i, "profile_pic.png"));
      }
    };

    /* Animation */
    this.expand = function(fromRadius, toRadius, direction) {
      var percentGrowth;

      if(direction === undefined || direction !== "-") {
        direction = "+";
      }

      if(direction === "+" && fromRadius >= toRadius) {
        return;
      } else if(direction === "-" && fromRadius <= toRadius) {
        return;
      }

      self.clear();

      if(direction === "+") {
        fromRadius += 1; // 1 will be replaced by SLOW(1) / MID(5) / FAST(10) / CUSTOM(X)
        percentGrowth = fromRadius / toRadius;
      } else {
        fromRadius -= 1;
        percentGrowth = 1 - (toRadius / fromRadius);
      }

      self.circle(self.centerX, self.centerY, fromRadius, self.settings.outerCircleInnerStrokeColor);
      self.stroke(self.settings.outerStrokeWidth, self.settings.outerStrokeColor);
      self.circle(self.centerX, self.centerY, fromRadius - 3, self.settings.outerFillColor);
      self.circle(self.centerX, self.centerY, self.radiusInner, self.settings.innerFillColor);
      self.stroke(self.settings.innerStrokeWidth, self.settings.innerStrokeColor);

      self.expandSubsets(percentGrowth);

      setTimeout(function(){
        self.expand(fromRadius, toRadius, direction);
      }, 5);
    };

    this.shrink = function(fromRadius, toRadius) {
      self.expand(fromRadius, toRadius, "-");
    }

    this.expandSubsets = function(percentOfSize) {
      var el = $('.' + self.subsetClassName);
      el.css("background-size", (45 * percentOfSize)+"px auto");
      el.css("height", ((self.radiusSubcircle * percentOfSize) - 3)+"px");
      el.css("width", ((self.radiusSubcircle * percentOfSize) - 3)+"px");
      el.css("left", 9-(self.radiusSubcircle * percentOfSize / 2)+"px")
      el.css("top", 9-(self.radiusSubcircle * percentOfSize / 2)+"px")
      el.css("border-radius", (self.radiusSubcircle * percentOfSize)+"px")
      el.css("position", "absolute")
    }

    this.subcircle = function(angle, content) {
      var coords = self.coordinatesAtAngle(angle, self.radiusSubsetsRail);
      return new CircleElement(self, (self.items.length + 1), coords.x, coords.y, self.radiusSubcircle, content);
    };

    this.coordinatesAtAngle = function(angle, radius) {
      var radians = Math.PI / 180;
      angle *= radians;

      return {
        x: self.centerX + (radius * Math.cos(angle)),
        y: self.centerY + (radius * Math.sin(angle))
      };
    };

    /* Events */
    $(canvas).live("mouseover", function(e){
      self.expand(self.radiusOuterInit, self.radiusOuterEnd);
    }).live("mouseout", function(e){
      self.shrink(self.radiusOuterEnd, self.radiusOuterInit);
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

  /* Circle Element */
  var CircleElement = function(parentGrouple, id, centerX, centerY, radius, icon) {
    var self = this;

    this.parent = parentGrouple;
    this.id = id;
    this.radius = radius;

    this.render = function() {
      self.divCircle(centerX, centerY, radius, icon);
    };

    this.divCircle = function(centerX, centerY, radius, icon) {
      $(self.parent.container).append("<div style='position:absolute;left:"+centerX+"px;top:"+centerY+"px;'>\
        <div class='"+self.parent.subsetClassName+"' style='background-image:url("+icon+");background-size:"+(45 * 0)+"px auto;border-radius:20px;height:"+(35*0)+"px;width:"+(35*0)+"px;'></div> \
      </div>");
    }

    this.render();
  }


  /* jQuery Plugin */

  // Collection method.
  $.fn.grouple = function(opts) {
    var self = this;
    opts = $.extend({}, $.fn.grouple.options, opts);

    this.opts = opts;

    if(window.groupleIdCounter === undefined)
      window.groupleIdCounter = 0;

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

      opts['id'] = window.groupleIdCounter++;

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
