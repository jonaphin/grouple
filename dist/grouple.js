/*! Grouple - v0.1.0 - 2012-04-28
* https://github.com/jonaphin/grouple
* Copyright (c) 2012 Jonathan Lancar; Licensed MIT */

(function($) {

  // Collection method.
  $.fn.grouple = function(options) {
    if(options === undefined) {
      options = {};
    }

    var self = this;

    this.circle = function() {

    };

    return this.each(function() {
      var canvas_width = $(this).width();
      var canvas_height = $(this).height();
      var center_x = canvas_width / 2;
      var center_y = canvas_height / 2;
      // choose the smaller side as outer radius
      var radius_outer = (center_x < center_y ? center_x : center_y) * 0.9;
      var radius_inner = radius_outer * 0.6;
      
      // stroke
      var line_width = options.stroke_width ? options.stroke_width : 0;

      $(this).html('<canvas class="grouple-canvas" width="'+canvas_width+'" height="'+canvas_height+'"></canvas>');

      var canvas = $(this).find("canvas")[0];
      var ctx = canvas.getContext("2d");
      ctx.fillStyle="#FF0000";
      ctx.beginPath();
      ctx.arc(center_x, center_y, radius_outer, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = line_width;
      ctx.strokeStyle = "black";
      ctx.stroke();

      ctx.fillStyle="#FFFFFF";
      ctx.beginPath();
      ctx.arc(center_x, center_y, radius_inner, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.translate(50,50);
      ctx.scale(0.35,0.75);

      ctx.restore();
    });
  };

  // Static method.
  $.circle = function() {
    return 'awesome';
  };

  // Custom selector.
  $.expr[':'].awesome = function(elem) {
    return elem.textContent.indexOf('awesome') >= 0;
  };

}(jQuery));
