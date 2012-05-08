/*! Grouple - v0.1.0 - 2012-05-07
* https://github.com/jonaphin/grouple
* Copyright (c) 2012 Jonathan Lancar; Licensed MIT */

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
    this.radiusSubsetsRail = this.radiusInner + ((this.radiusOuterInit - this.radiusInner) / 2);
    this.radiusSubcircle = function() { return  (self.radiusOuterEnd - self.radiusSubsetsRail); };
    this.radiusCurrent = this.radiusOuterEnd;

    this.bounds = {
      x: [$(container).position().left, $(container).position().left + self.canvasWidth],
      y: [$(container).position().top, $(container).position().top + self.canvasHeight]
    };

    this.status = "shrunk";

    /* initialize canvas */
    $(container).html('<div class="grouple-elems"></div><canvas class="grouple-canvas" width="'+this.canvasWidth+'" height="'+this.canvasHeight+'"></canvas>');
    var canvas = $(container).find("canvas")[0];
    var ctx = canvas.getContext("2d");

    /* render */
    this.render = function() {
      // Outer Circle Inner Stroke
      self.circle(self.centerX, self.centerY, self.radiusOuterInit, self.settings.outerCircleInnerStrokeColor);
      // Outer Circle outer Stroke
      self.stroke(self.settings.outerStrokeWidth, self.settings.outerStrokeColor);
      // Outer Circle
      self.circle(self.centerX, self.centerY, self.radiusOuterInit - (self.radiusCurrent*0.03), self.settings.outerFillColor);
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

      if(direction === "+" && Math.floor(self.radiusCurrent) >= Math.floor(toRadius)) {
        this.status = "expanded";
        return;
      } else if(direction === "-" && Math.ceil(self.radiusCurrent) <= Math.ceil(toRadius)) {
        this.status = "shrunk";
        return;
      }

      if(direction === "+") {
        self.radiusCurrent += 5; // will be replaced by SLOW(1) / MID(5) / FAST(10) / CUSTOM(X)
        //percentGrowth = 1;
        percentGrowth = (self.radiusCurrent - fromRadius) / (toRadius - fromRadius);
        this.status = "expanding";
      } else {
        self.radiusCurrent -= 5;
        percentGrowth = 1 - ((fromRadius - self.radiusCurrent) / (fromRadius - toRadius));
        this.status = "shrinking";
      }

      self.clear();

      self.circle(self.centerX, self.centerY, self.radiusCurrent, self.settings.outerCircleInnerStrokeColor);
      self.stroke(self.settings.outerStrokeWidth, self.settings.outerStrokeColor);
      self.circle(self.centerX, self.centerY, self.radiusCurrent - (self.radiusCurrent*0.03), self.settings.outerFillColor);
      self.circle(self.centerX, self.centerY, self.radiusInner, self.settings.innerFillColor);
      self.stroke(self.settings.innerStrokeWidth, self.settings.innerStrokeColor);

      self.expandSubsets(percentGrowth);

      setTimeout(function(){
        self.expand(fromRadius, toRadius, direction);
      }, 5);
    };

    this.shrink = function(fromRadius, toRadius) {
      self.expand(fromRadius, toRadius, "-");
    };

    this.expandSubsets = function(percentOfSize) {
      if(percentOfSize === 0) {
        $(container).find(".grouple-elems").hide();
      } else {
        $(container).find(".grouple-elems").show();
      }

      var el = $('.' + self.subsetClassName);

      el.css("background-size", (self.elementBackgroundSize * percentOfSize)+"px auto");
      el.css("height", Math.floor(self.radiusSubcircle()  * percentOfSize) +"px");
      el.css("width", Math.floor(self.radiusSubcircle() * percentOfSize) +"px");
      el.css("border-radius", (self.radiusCurrent * percentOfSize)+"px");
      el.css("position", "absolute");

      // TODO: make left and top a function of the parent container
      el.css("left", 9-(self.radiusSubcircle() * percentOfSize / 2)+"px");
      el.css("top", 9-(self.radiusSubcircle() * percentOfSize / 2)+"px");

      for(var i = 0; i < self.items.length; i++) {
        el = self.items[i];
        var angle = self.angleAtIndex(i);
        var new_coords = self.coordinatesAtAngle(angle, self.radiusCurrent - (self.radiusSubcircle() * 0.7 * percentOfSize));


        $("#grouple-ce-outer-"+(i+1)).css("left", (new_coords.x)+"px");
        $("#grouple-ce-outer-"+(i+1)).css("top", (new_coords.y)+"px");
      }
    };

    this.subcircle = function(angle, content) {
      var coords = self.coordinatesAtAngle(angle, self.radiusSubsetsRail);
      return new CircleElement(self, (self.items.length + 1), coords.x, coords.y, self.radiusSubcircle(), content);
    };

    this.coordinatesAtAngle = function(angle, radius) {
      var radians = Math.PI / 180;
      angle *= radians;

      return {
        x: self.centerX + (radius * Math.cos(angle)),
        y: self.centerY + (radius * Math.sin(angle))
      };
    };

    this.angleAtIndex = function(index) {
      if(index === 0 || self.items.length < 1) {
        return 0;
      }

      return (360 / self.items.length) * index;
    };

    /* Events */
    $(window).mousemove(function(e) {
      if(self.status === "expanding" || self.status === "shrinking") {
        return;
      }

      if(e.clientX >= self.bounds.x[0] && e.clientX <= self.bounds.x[1]) {
        if(e.clientY >= self.bounds.y[0] && e.clientY <= self.bounds.y[1]) {
          if(self.status === "expanded") {
            return;
          }
          self.expand(self.radiusOuterInit, self.radiusOuterEnd);
          return;
        }
      }

      if(self.status === "shrunk") {
        return;
      }
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
      var inner_html = "<div id='grouple-ce-outer-"+self.id+"' style='position:absolute;left:"+centerX+"px;top:"+centerY+"px;'>";
      inner_html    += "  <div class='"+self.parent.subsetClassName+"' style='background-image:url("+icon+");background-size:"+(self.elementBackgroundSize * 0)+"px auto;border-radius:20px;'></div>";
      inner_html    += "</div>";
    
      $(self.parent.container).find(".grouple-elems").append(inner_html);
    };

    this.render();
  };


  /* jQuery Plugin */

  // Collection method.
  $.fn.grouple = function(opts) {
    var self = this;
    opts = $.extend({}, $.fn.grouple.options, opts);

    this.opts = opts;

    if(window.groupleIdCounter === undefined) {
      window.groupleIdCounter = 0;
    }

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
    outerCircleInnerStrokeColor: "#FFFFFF",
    elementBackgroundSize: 45
  };
}(jQuery));
