/*! Grouple - v0.1.0 - 2012-04-28
* https://github.com/jonaphin/grouple
* Copyright (c) 2012 Jonathan Lancar; Licensed MIT */

(function($) {

  // Collection method.
  $.fn.grouple = function(opts) {
    opts = $.extend({}, $.fn.grouple.options, opts);

    var self = this;

    this.circle = function() {

    };

    return this.each(function() {
      var canvasWidth = $(this).width();
      var canvasHeight = $(this).height();
      var centerX = canvasWidth / 2;
      var centerY = canvasHeight / 2;
      // choose the smaller side as outer radius
      var radiusOuter = (centerX < centerY ? centerX : centerY) * 0.9;
      var radiusInner = radiusOuter * 0.6;

      $(this).html('<canvas class="grouple-canvas" width="'+canvasWidth+'" height="'+canvasHeight+'"></canvas>');

      var canvas = $(this).find("canvas")[0];
      var ctx = canvas.getContext("2d");
      ctx.fillStyle="#FF0000";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radiusOuter, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = opts.strokeWidth;
      ctx.strokeStyle = opts.strokeColor;
      ctx.stroke();

      ctx.fillStyle="#FFFFFF";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radiusInner, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.translate(50,50);
      ctx.scale(0.35,0.75);

      ctx.restore();
    });
  };

  $.fn.grouple.options = {
    strokeWidth: 0,
    strokeColor: "#000000"
  };
}(jQuery));
