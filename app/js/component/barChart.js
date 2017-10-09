// factory ....
import * as d3 from 'd3';

const translation = {
  ALTERNATIVE: '另类投资',
  STOCK: '股票类',
  FIXED_INCOME: '固收类',
  CASH: '现金类',
};

function transCode(code) {
  return translation[code];
}

const moduleName = 'unicorn.component.barChart';

function BarChartFactory($log, $filter) {
  const formatPercent = $filter('formatPercent');

  return class BarChart {
    constructor(node, options) {
      //$log.debug('initializing the bar chart :)');
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
      // FIXME: better suggestion ?
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

      this.plots = this.svg.append('g')
        .attr('class', 'plots');
    }

    drawGraph(data) {
      // attention，I'm gonna transit a bit
      const transitionDuration = 1500;
      this.x.domain(data.map((d) => d.code));
      this.y.domain([0, d3.max(data, (d) => d.percentage)]);

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

      targetBar.append('rect')
        .attr('class', (d) => `${d.code} bar-rect`)
        .attr('class', (d) => `${d.code} bar-rect`)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('x', (d, i) => (this.x(d.code) + i * 3))
        .attr('y', this.y(0))
        .attr('height', this.adjustedHeight - this.y(0))
        .attr('width', this.x.bandwidth());

      targetBar.append('rect')
        .attr('class', 'mask-rect')
        .attr('x', (d, i) => (this.x(d.code) + i * 3))
        .attr('fill', '#fff')
        .attr('opacity', 0.8)
        .attr('y', this.y(0))
        .attr('height', this.adjustedHeight - this.y(0))
        .attr('width', this.x.bandwidth());

      targetBar.append('text')
        .attr('class', 'target-cate-text')
        .attr('y', this.y(0) + this.maskHeight / 2)
        .attr('dy', '12px')
        .attr('font-size', '12px')
        .text((d) => transCode(d.code))
        .attr('x', (d, i) => this.x(d.code) + i * 3 + this.x.bandwidth() / 2);

      targetBar.append('text')
        .attr('class', 'target-text')
        .attr('y', this.y(0) + this.maskHeight / 2)
        .attr('dy', '-5px')
        .attr('font-size', '10px')
        .attr('x', (d, i) => this.x(d.code) + i * 3 + this.x.bandwidth() / 2);


      const t = d3.transition()
        .duration(transitionDuration);

      this.svg.selectAll('.bar-rect').transition(t)
        .attr('y', (d) => this.y(d.percentage))
        .attr('height', (d) => this.adjustedHeight - this.y(d.percentage));

      this.svg.selectAll('.target-text').transition(t)
        .text((d) => `${formatPercent(d.percentage)}%`);
    }
  };
}
BarChartFactory.$inject = ['$log', '$filter'];

// eslint-disable-next-line
function barChartDirective($log, BarChartFactory) {
  return {
    scope: { data: '=barChartData' },
    link: function barChartLink($scope, $el) {
      const el = $el[0];
      const graph = new BarChartFactory(el, {
        height: el.offsetHeight,
        top: 0,
        left: 0,
        right: 10,
        bottom: 0,
      });
      //$log.debug('drawing bar char', graph, $scope.data);
      $scope.$watch(() => $scope.data, (newV) => {
        if (!newV) { return; }
        graph.drawGraph(newV);
      });
    },
  };
}
barChartDirective.$inject = ['$log', 'BarChartFactory'];

angular.module(moduleName, [])
  .factory('BarChartFactory', BarChartFactory)
  .directive('uBarChart', barChartDirective);

export default moduleName;
