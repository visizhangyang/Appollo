/* eslint-disable */

import Raphael from 'raphael/raphael.js';
import * as d3 from 'd3';

var ColorPicker, angle, pi;
var globalGradientId = 1;

angle = function(x, y) {
  return (x < 0) * 180 + Math.atan(-y / -x) * 180 / pi;
};

Raphael.colorpicker = function(x, y, size, initLevel, parentNode, element, selectors, dimensions, separation, $ionicScrollDelegate) {
  return new ColorPicker(x, y, size, initLevel, parentNode, element, selectors, dimensions, separation, $ionicScrollDelegate);
};

Raphael.fn.colorPickerIcon = function(x, y, r, parentNode, element) {
  var circle, gradient, padding, wheel;
  padding = 2 * r / 200;
  wheel = d3.select(parentNode).select("#" + element).insert('svg', 'svg')
    .style('position', "absolute")
    .style('width', x*2)
    .style('height', x*2);
  gradient = wheel.append("svg:defs")
    .append("svg:linearGradient")
    .attr("id", "gradient" + globalGradientId)
    .attr("x1", "5%")
    .attr("y1", "70%")
    .attr("x2", "81%")
    .attr("y2", "40%");
  gradient.append("svg:stop")
    .attr("offset", "0%")
    .attr("stop-color", "#000");
  gradient.append("svg:stop")
    .attr("offset", "22%")
    .attr("stop-color", "#0A69D5");
  gradient.append("svg:stop")
    .attr("offset", "42%")
    .attr("stop-color", "#00101A");
  gradient.append("svg:stop")
    .attr("offset", "70%")
    .attr("stop-color", "#074797");
  gradient.append("svg:stop")
    .attr("offset", "78%")
    .attr("stop-color", "#0A5FBB");
  gradient.append("svg:stop")
    .attr("offset", "100%")
    .attr("stop-color", "#002349");
  wheel.append("circle")
    .attr("cx", r + padding)
    .attr("cy", r + padding)
    .attr("r", r + padding)
    .attr("fill", `url('#gradient${globalGradientId}')`);
};
pi = Math.PI;
ColorPicker = function(x, y, size, initLevel, parentNode, element, selectors, dimensions, separation, $ionicScrollDelegate) {
  this.$ionicScrollDelegate = $ionicScrollDelegate;
  globalGradientId++;
  var bpad, containerEl, fi, h, handleScroll, height, isH, isHS, isHSB, offset, padding, r, size2, size20, style, t, w1, w3, wheel, wheelEl, width;
  if (size == null) {
    size = 200;
  }
  if (initLevel == null) {
    initLevel = 1;
  }
  if (selectors == null) {
    selectors = 1;
  }
  if (dimensions == null) {
    dimensions = 3;
  }
  if (separation == null) {
    separation = 0;
  }
  w3 = 3 * size / 200;
  w1 = size / 200;
  fi = 1.6180339887;
  if (dimensions === 1) {
    isH = true;
  }
  if (dimensions === 2) {
    isHS = true;
  }
  if (dimensions === 3) {
    isHSB = true;
  }
  size20 = size / 20;
  size2 = size / 2;
  padding = 2 * size / 200;
  height = size + padding;
  bpad = 1;
  if (dimensions === 3) {
    bpad = 10;
  }
  width = size + padding * bpad;
  t = this;
  let elementNode = d3.select(parentNode).select('#' + element).node();
  r = (elementNode ? Raphael(elementNode, width, height) : Raphael(x, y, width, height));
  r.colorPickerIcon(size2, size2, size2 - padding, parentNode, element);
  w1 < 1 && (w1 = 1);
  w3 < 1 && (w3 = 1);
  t.selectors = selectors;
  t.bcirc = r.circle(size2, size2, size2 - w1 * 3).attr({
    fill: "#000",
    "stroke-width": w3,
    "opacity": 0,
    "stroke": "#000"
  });
  if (isH) {
    t.bcirc.attr({
      fill: "#fff",
      opacity: 1,
      r: 120,
      "stroke-width": 0,
      stroke: "transparent"
    });
  }
  h = size20 * 2 + 2;
  if (isHSB) {
    t.brect = r.rect(size + padding + 0.5, w1 * 4 + 0.5, padding * 8, h * 9 - padding).attr({
      "stroke-width": 0,
      fill: "270-#fff-#fff"
    });
    t.btop = t.brect.clone().attr({
      stroke: "#000",
      fill: "#000",
      opacity: 0
    });
    style = t.btop.node.style;
    style.unselectable = "on";
    style.MozUserSelect = "none";
    style.WebkitUserSelect = "none";
    t.bheight = 10;
    t.miny = padding + t.bheight - 5;
    t.maxy = t.brect.attr("height") + padding - 5;
    t.btop.drag((function(dx, dy, x, y) {
      return t.docOnMove(dx, dy, x, y - offset.top);
    }), (function(x, y) {
      t.bOnTheMove = true;
      return t.setB(y - t.y - offset.top);
    }), function() {
      return t.bOnTheMove = false;
    });
    wheel = function(e) {
      var delta;
      delta = 0;
      if (!e) {
        e = window.event;
      }
      if (e.wheelDelta) {
        delta = e.wheelDelta / 120;
      }
      if (window.opera) {
        delta = delta * .1;
      } else if (e.detail) {
        delta = -e.detail;
      }
      if (delta) {
        handleScroll(delta);
      }
      if (e.preventDefault) {
        e.preventDefault();
        return e.returnValue = false;
      }
    };
    handleScroll = function(delta) {
      return t.setB(delta);
    };

  }
  t.H = t.S = t.B = 1;
  t.padding = padding;
  t.raphael = r;
  t.size2 = size2;
  t.size20 = size20;
  t.isH = isH;
  t.isHS = isHS;
  t.isHSB = isHSB;
  t.rd = 0;
  t.separation = separation;
  t.innerCircle = size2 - (size20 + w3 + size20 / 3);
  t.x = x;
  t.y = y;

  t.thumb = d3.select(parentNode).select('#wheel-thumb');

  wheelEl = d3.select(parentNode).select('#' + element).node();

  if (element !== "wheel") containerEl = document.getElementById("popcontainer");
  else containerEl = wheelEl.parentElement;

  offset = {
    top: wheelEl.offsetTop + containerEl.offsetTop,
    left: wheelEl.offsetLeft + containerEl.offsetLeft
  };

  t.levels = _.times(100, (i) => { return i*3.6-90 });
  var screen_move = function(selected) {
    const x = selected[0] - t.size2;
    const y = selected[1] - t.size2;
    const d = angle(x, y);

    var closestD = t.levels.reduce(function (prev, curr) {
      return (Math.abs(curr - d) < Math.abs(prev - d) ? curr : prev);
    });
    t.currentLevel = t.levels.indexOf(closestD) + 1;
    return t.setHS(selected[0], selected[1]);
  };

  function handleTouch() {
    var selected = d3.touches(this)[0];
    screen_move(selected);
  }

  function handleMove() {
    var selected = d3.mouse(this);
    screen_move(selected);
  }

  const wheelHandle = d3.select(parentNode).select('.wheel-container');
  if (ionic.Gestures.HAS_TOUCHEVENTS) {
    wheelHandle.on("touchmove", handleTouch);
    wheelHandle.on("touchstart", function () {
      screen_move(d3.touches(this)[0]);
    });
  } else {
    wheelHandle.on("mousemove", handleMove);
  }

  t.color(initLevel || 1);
  return this.onchanged && this.onchanged(this.color());
};
ColorPicker.prototype.setB = function(y) {
  y = ~~y;
  y < this.miny && (y = this.miny + 0.5);
  y > this.maxy && (y = this.maxy);
  this.B = Math.max(Math.min(((y - this.miny) / (this.maxy - this.miny) - 1) * -1, .9999), .01);
  this.bcirc.attr({
    "opacity": (this.B - 1) * -1
  });
  return this.onchange && this.onchange(this.color());
};
ColorPicker.prototype.setHS = function(x, y) {
  var R, X, Y, d, distance, extraPad, rd;
  X = x - this.size2;
  Y = y - this.size2;
  extraPad = 0;
  if (this.isH) {
    extraPad = this.size20 / 4;
  }
  R = this.size2 - this.size20 / 2 - this.padding - extraPad;
  d = angle(X, Y);

  rd = d * pi / 180;
  isNaN(d) && (d = 0);
  if (X * X + Y * Y > R * R || this.isH) {
    x = R * Math.cos(rd) + this.size2;
    y = R * Math.sin(rd) + this.size2;
    X = x - this.size2;
    Y = y - this.size2;
  }
  this.thumb
    .style('left', `${x - 15}px`)
    .style('top', `${y - 15}px`);
  this.H = (1 - d / 360) % 1;
  distance = Math.max((X * X + Y * Y) / R / R, 0.3);
  this.S = Math.min(distance, 1);
  if (this.isHSB) {
    this.brect.attr({
      fill: "270-hsb(" + [this.H, this.S] + ",1)-#000"
    });
  }
  return this.onchange && this.onchange(this.color());
};
ColorPicker.prototype.docOnMove = function(dx, dy, x, y) {
  if (this.hsOnTheMove) {
    this.setHS(x - this.x, y - this.y);
  }
  if (this.bOnTheMove) {
    return this.setB(y - this.y);
  }
};
ColorPicker.prototype.remove = function() {
  this.raphael.remove();
  return this.color = function() {
    return false;
  };
};
ColorPicker.prototype.color = function(level) {
  var x, y;
  if (level) {
    const d = this.levels[level-1];
    x = 0;
    let X = x-this.size2;
    let Y = Math.tan((d-(x<0)*180)*pi/180)*x ;
    let extraPad = 0;
    if (this.isH) {
      extraPad = this.size20 / 4;
    }
    const R = this.size2 - this.size20 / 2 - this.padding - extraPad;
    const rd = d * pi / 180;

    y = Y - this.size2;
    if (X * X + Y * Y > R * R) {
      x = R * Math.cos(rd) + this.size2;
      y = R * Math.sin(rd) + this.size2;
    }
    this.thumb
      .style('left', `${x - 15}px`)
      .style('top', `${y - 15}px`);

    return this;
  } else {
    return Raphael.hsl2rgb(this.H, this.S, this.B / 2).hex;
  }
};


export default function slideWheelDirective($ionicScrollDelegate) {
  return {
    scope: {
      level: '=slideLevel',
    },
    transclude: true,
    templateUrl: 'component/slideWheel.html',
    link: function link($scope, $el) {
      let parentNode = $el[0];
      const r = 1;
      const size = 300;
      let degs = 0;
      let complementary = degs - 180;
      const wheel = d3.select(parentNode).select("#wheel")
        .style("position", "absolute")
        .style("width", "" + size + "px")
        .style("height", "" + size + "px");

      const pad = 2 * r / 200;
      const shadow = d3.select(parentNode).select("#shadow")
        .style("position", "absolute")
        .style("margin-top", "-" + (r - pad / 2) + "px")
        .style("margin-left", "-" + (r - pad / 2) + "px")
        .style("width", "" + (size - pad) + "px")
        .style("height", "" + (size - pad) + "px");

      d3.range(4).map(function(d, i) {
        shadow.select("#s" + (i + 1))
          .style("width", size - pad + "px")
          .style("height", size - pad + "px")
          .style("margin-top", Math.sin(degs * (3.14 / 180)) * size / 20 + "px")
          .style("margin-left", Math.cos(degs * (3.14 / 180)) * -1 * size / 20 + "px");
        degs -= 90;
        if (degs < 0) {
          degs += 360;
        }
        complementary = degs - 180;
        if (complementary < 0) {
          complementary = degs + 180;
        }
        return shadow.select("#s" + (i + 1)).node();
      });

      const cp = Raphael.colorpicker(
        0, 0, size, $scope.level, parentNode, "wheel", 1, 1, 0, $ionicScrollDelegate
      );

      $scope.$watch('level', (newV, oldV) => {
        if (oldV !== newV) {
          cp.color(newV);
        }
      });
      const onChange = function (clr) {
        $scope.$apply(() => {
          $scope.level = cp.currentLevel;
        });
        const color = Raphael.rgb2hsl(Raphael.getRGB(clr));
        degs = color.h * 360;
        shadow.style('-webkit-transform', "rotate3d(0, 0, 1, " + degs + "deg)");
        shadow.style('-o-transform', "rotate(" + degs + "deg)");
        shadow.style('-ms-transform', "rotate(" + degs + "deg)");
        shadow.style('transform', "rotate(" + degs + "deg)");
      };
      cp.onchange = _.throttle(onChange, 100);

      $scope.onDrag = function() {
        $ionicScrollDelegate.freezeScroll(true);
      };

      $scope.onDragEnd = function() {
        $ionicScrollDelegate.freezeScroll(false);
      }
    }
  }
}

slideWheelDirective.$inject = ["$ionicScrollDelegate"];
