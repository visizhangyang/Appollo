// factory ....
import * as d3 from 'd3';

const moduleName = 'unicorn.component.barCompareChart';

const translation = {
  alternative_asset: '另类投资',
  stock_asset: '股票类',
  fixed_income: '固收类',
  cash_asset: '现金类',
};

function transCode(code) {
  return translation[code];
}

function BarCompareChartFactory($log, $filter) {
  const formatPercent = $filter('formatPercent');

  return class BarChart {
    constructor(node, options) {
      $log.debug('initializing the bar chart :)');
      this.options = options || {};
      this.container = d3.select(node);
      this.setupVar();
      this.setupUtils();
      this.setupDOM();
    }

    setupVar() {
      this.margin = {
        left: this.options.left || 0,
        top: this.options.top || 0,
        bottom: this.options.bottom || 0,
        right: this.options.right || 0,
      };

      this.width = this.container.node().clientWidth;
      this.height = this.options.height || 0;
      this.adjustedHeight = this.height - this.margin.bottom;

      // This is min value when percentage > 1;
      this.maskHeight = 44;
    }

    setupUtils() {
      this.x = d3.scaleBand()
        .range([0 + this.margin.left, this.width - this.margin.right]);
      this.y = d3.scaleLinear()
        .range([this.adjustedHeight - this.maskHeight, this.margin.top]);
    }

    setupDOM() {
      this.svg = this.container.append('svg')
        .attr('class', 'bar-chart')
        .attr('width', this.width)
        .attr('height', this.height);
      //
      // const gradient = this.svg.append('defs')
      //   .append('linearGradient')
      //   .attr('id', 'linearGradient-bar')
      //   .attr('x1', 0.15)
      //   .attr('y1', 0)
      //   .attr('x2', 1.16)
      //   .attr('y2', 1.13);
      // gradient.append('stop')
      //   .attr('stop-color', '#bababa')
      //   .attr('offset', '0%');
      // gradient.append('stop')
      //   .attr('stop-color', '#fff')
      //   .attr('offset', 0.37);
      // gradient.append('stop')
      //   .attr('stop-color', '#9e9e9e')
      //   .attr('offset', 0.64);
      // gradient.append('stop')
      //   .attr('stop-color', '#fdfdfd')
      //   .attr('offset', 1);

      this.plots = this.svg.append('g')
        .attr('class', 'plots');
    }

    drawGraph(data) {
      // attention，I'm gonna transit a bit
      const transitionDuration = 1500;
      this.x.domain(data.map((d) => d.code));
      this.y.domain([0, 100]);

      const targetBarList = this.plots.selectAll('g.target-bar')
        .data(data);
      // Actually these data will inherited from parent when create
      // but won't work for update exist dom, so have to manual pass the value
      this.plots.selectAll('.bar-rect').data(data);
      this.plots.selectAll('.target-text').data(data);
      targetBarList.exit().remove();
      const targetBar = targetBarList.enter()
        .append('g')
        .attr('class', 'target-bar');

      targetBar.append('text')
        .attr('class', 'target-text')
        .attr('y', this.y(0))
        .attr('dy', '-0.5rem')
        .attr('x', (d, index) => {
          let shift = 0;
          if ([1, 3, 5, 7].indexOf(index) > -1) {
            shift = 4;
          }
          return this.x(d.code) - shift + this.x.bandwidth() / 2;
        });

      targetBar.append('rect')
        .attr('class', (d) => `${d.code} bar-rect`)
        .attr('class', (d) => `${d.code} bar-rect`)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('x', (d, index) => {
          let shift = 0;
          if ([1, 3, 5, 7].indexOf(index) > -1) {
            shift = 4;
          }
          return this.x(d.code) - shift;
        })
        .attr('y', this.y(0))
        .attr('height', this.adjustedHeight - this.y(0))
        .attr('width', this.x.bandwidth() - 4);

      targetBar.append('rect')
        .attr('class', 'mask-rect')
        .attr('x', (d, index) => {
          let shift = 0;
          if ([1, 3, 5, 7].indexOf(index) > -1) {
            shift = 4;
          }
          return this.x(d.code) - shift;
        })
        .attr('fill', '#fff')
        .attr('opacity', 0.8)
        .attr('y', this.y(0))
        .attr('height', this.adjustedHeight - this.y(0))
        .attr('width', this.x.bandwidth() - 4);

      targetBar.append('text')
        .attr('class', 'target-cate-text')
        .attr('y', this.y(0) + this.maskHeight / 2)
        .attr('dy', '0.25rem')
        .text((d, index) => {
          if ([0, 2, 4, 6].indexOf(index) > -1) {
            return null;
          }
          return transCode(d.code);
        })
        .attr('x', (d, index) => {
          let shift = 0;
          if ([1, 3, 5, 7].indexOf(index) > -1) {
            shift = 4;
          }
          return this.x(d.code) - shift;
        });

      const t = d3.transition()
        .duration(transitionDuration);

      this.svg.selectAll('.bar-rect').transition(t)
        .attr('y', (d) => this.y(d.percentage))
        .attr('height', (d) => this.adjustedHeight - this.y(d.percentage));
      this.svg.selectAll('.target-text').transition(t)
        .attr('y', (d) => this.y(d.percentage))
        .text((d) => `${formatPercent(d.percentage)}%`);
    }
  };
}
BarCompareChartFactory.$inject = ['$log', '$filter'];

// eslint-disable-next-line
function barCompareChartDirective($log, BarCompareChartFactory) {
  return {
    scope: { data: '=barChartData' },
    link: function barChartLink($scope, $el) {
      const graph = new BarCompareChartFactory($el[0], {
        height: 175,
        top: 27,
        left: 13,
        right: 13,
        bottom: 9,
      });
      $log.debug('drawing bar char', graph, $scope.data);
      $scope.$watch(() => $scope.data, (newV) => {
        if (!newV) { return; }
        graph.drawGraph(newV);
      });
    },
  };
}
barCompareChartDirective.$inject = ['$log', 'BarCompareChartFactory'];

angular.module(moduleName, [])
  .factory('BarCompareChartFactory', BarCompareChartFactory)
  .directive('uBarCompareChart', barCompareChartDirective);

export default moduleName;
