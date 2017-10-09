/* eslint-disable */
import * as d3 from 'd3';

const moduleName = 'micai.screen.planChange';
const planChange = angular.module(moduleName, []);

function planSliderThumb() {
  var options = {
    restrict: 'E',
    require: '^^planSlider'
  };

  options.link = function ($scope, $el, $attr, $ctrl) {
    if (!$ctrl) {return;}
    $ctrl.addThumb($el[0]);
  };

  return options;
}

function planSlider (
  $ionicScrollDelegate,
  SliderFactory
) {
  var options = {
    restrict: 'EA',
    scope: {
      changeFn: '&mChange',
      mLevel: '=mLevel',
      viewScroll: '=mScrollDelegate'
    },
    controller: planSliderCtrl,
    controllerAs: 'vm',
    template:
    '<div class="plan-change-wrapper" ' +
    'on-drag-right="vm.onDrag($event)" ' +
    'on-drag-left="vm.onDrag($event)" ' +
    'on-tap="vm.onTap($event)"' +
    'on-release="vm.onRelease($event)">' +
    '<div class="range">' +
    '<plan-slider-thumb></plan-slider-thumb>' +
    '</div>' +
    '<div class="range-label">' +
    '<div>1</div>' +
    '<div>10</div>' +
    '</div>' +
    '</div>'
  };

  planSliderCtrl.$inject = ['$scope'];
  function planSliderCtrl ($scope) {
    var vm = this;
    var slider = null;
    var _is_freeze = false;

    var scrollDeletegate = $ionicScrollDelegate.$getByHandle($scope.viewScroll);

    vm.onTap = function (event) {
      if (!slider) {return;}
      freezeScroll(true);

      var coord = ionic.tap.pointerCoord(event.gesture);
      slider.onClickSlider(coord.x);
    };

    vm.onDrag = function (event) {
      if (!slider) {return;}

      freezeScroll(true);

      var coord = ionic.tap.pointerCoord(event.gesture);
      slider.onDragHandle(coord.x);
    };

    vm.onRelease = function (event) {
      if (!slider) {return;}

      freezeScroll(false);
    };

    vm.addThumb = function (el) {
      if (slider) {
        $log.error('Inproper config the thumb, tring to add twice');
        return;
      }

      slider = registerSlider(el);
    };

    function registerSlider (el) {
      var padding = 23;
      var _new_slider;

      _new_slider = new SliderFactory(el, vm.el, padding);
      var slideCallback = _.throttle(function (value) {
        if (value === $scope.mLevel) return;
        // it is queue callback to digest tasks
        $scope.$evalAsync(function () {
          $scope.changeFn({level:value});
        });
      }, 200);

      // Attach callback every time slider change its value
      _new_slider.attach(slideCallback);
      _new_slider.setMax(10);


      $scope.$watch('mLevel', function(newV) {
        if (newV) {
          _new_slider.value(newV);
        }
      });

      return _new_slider;
    }

    function freezeScroll(shouldFreeze) {
      if (shouldFreeze && !_is_freeze) {
        scrollDeletegate.freezeScroll(shouldFreeze);
      } else if (!shouldFreeze && _is_freeze) {
        scrollDeletegate.freezeScroll(false);
      }
      _is_freeze = shouldFreeze;
    }

  }

  options.link = {
    pre: function ($scope, $el, $attr) {
      var el = $el[0];
      if (!el || !el.parentElement) {
        $log.error('Inproper config Plansider directive, missing el or parentEl');
      }
      $scope.vm.el = $el[0].parentElement;
    }
  };

  return options;
}
planSlider.$inject = ['$ionicScrollDelegate', 'SliderFactory'];

function SliderFactory() {

  // Private attribute
  var el;               // element of slider div
  var value;            // current slider value
  var max = 10;
  var min = 1;
  var step = 1;
  var callback;         // callback of updating value
  var handle;           // slider's drag handle
  var handleR = 15;     // handle radius
  var sliderLength;
  var padding;          // padding to correct the touch position
                        // which is different from wrapper and div
  var split_width = 1;

  // utils function
  var formatLeft = function (num) {
    return (num - handleR) + 'px';
  };
  var scale = d3.scaleLinear().domain([min, max]);
  var splitter_scale = scale.copy();

  function Slider(element, wrapper, pad) {
    // initial private value
    el = element;
    value = value || min;
    padding = pad || 23;

    var div = d3.select(el).classed('d3-slider', true);

    var wrapperDiv = d3.select(wrapper);
    sliderLength = parseInt(wrapperDiv.style("width"), 10);
    sliderLength = sliderLength - (2 * padding);

    scale.range([0, sliderLength]);
    // for drawing repeat linear background img
    // it is import to plus one more splitter width
    // so only (n-1) split bar could be show in slider
    splitter_scale.range([0, sliderLength + split_width]);


    handle = div.append('a')
      .classed('d3-slider-handle img-slider-handle-lines tap-disabled', true)
      .attr('xlink:href', '#')
      .attr('id', 'plan-change-handle');

    handle.style('left', formatLeft(scale(value)));
  }

  /**
   * Base on step attribute to get slider correction value
   * @param val: scale domain value of user intend to click
   * @returns {*}
   */
  function stepValue(val) {
    if (val === min || val === max) {
      return val;
    }

    var alignValue = val;
    if (step) {
      var valModStep = (val - min) % step;
      alignValue = val - valModStep;

      if (Math.abs(valModStep) * 2 >= step) {
        alignValue += (valModStep > 0) ? step : -step;
      }
      return alignValue;
    }
  }

  var animationOn = false;
  function moveHandle(clickValue) {
    var newValue = stepValue(clickValue);

    var oldPos = formatLeft(scale(stepValue(value)));
    var newPos = formatLeft(scale(newValue));

    if (animationOn) {
      handle.transition()
        .styleTween('left', function() { return d3.interpolate(oldPos, newPos); })
        .duration((typeof animate === "number") ? animate : 250);
    } else {
      handle.style('left', newPos);
    }
    if (callback) {
      callback(newValue);
    }
  }

  /**
   * Re-render the background color base on current risklevel value
   *
   */
  function renderBg() {
    var split_color = 'rgba(155, 155, 155, 0.3)';

    // length per level (including splitter)
    var level_width = splitter_scale(2);

    // repeating the pattern img in this way
    //
    // ---||---||---|| .... ||---||---
    //
    var splitter_img = [
      'repeating-linear-gradient(',
      'to right,',
      split_color + ',',
      split_color + ' ' + split_width + 'px ,',
      'transparent ' + split_width + 'px ,',
      'transparent ' + level_width + 'px',
      ')'
    ].join('');

    el.parentElement.setAttribute('style',
      'background-image:' + splitter_img);
  }

  Slider.prototype.value = function (target) {
    if (value) {
      moveHandle(target);
    }
    value = target;
    return Slider;
  };

  Slider.prototype.setMax = function (max_level) {
    max = max_level;
    scale.domain([min, max]);
    splitter_scale.domain([min, max]);
    renderBg();
  };

  Slider.prototype.attach = function (target) {
    callback = target;
    return Slider;
  };

  /**
   * On click slider, base on click_x to get move to value
   * then update slider
   */
  Slider.prototype.onClickSlider = function (clickPointX) {
    //var clickPointX = d3.event.offsetX || d3.event.layerX;
    //  0 ≤ x ≤ maxLength
    var pos = Math.max(0, Math.min(sliderLength, clickPointX));

    var clickValue = scale.invert(pos);
    moveHandle(clickValue);
  };

  Slider.prototype.onDragHandle = function (clickPointX) {
    var pos = Math.max(0, Math.min(sliderLength, clickPointX));
    var clickValue = scale.invert(pos);
    moveHandle(clickValue);
  };

  return Slider;
}

planChange.factory('SliderFactory', SliderFactory);
planChange.directive('planSlider', planSlider);
planChange.directive('planSliderThumb', planSliderThumb);

export default moduleName;
