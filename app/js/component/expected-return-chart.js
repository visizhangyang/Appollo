import * as d3 from 'd3';

const module = 'unicorn.component.expectedReturnChart';

function ChartFactory() {
  return class Chart {
    constructor(node, options) {
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

      this.width = this.container.node().clientWidth
        - this.margin.left - this.margin.right;
      this.height = (this.options.height || 0) - this.margin.top - this.margin.bottom;
    }

    setupUtils() {
      this.x = d3.scaleLinear()
        .range([0, this.width]);

      this.y = d3.scaleLinear()
        .range([this.height, 0]);

      this.xAxis = d3.axisBottom()
        .tickSize(0)
        .tickPadding(10)
        .tickFormat((d) => `${d}年`)
        .scale(this.x);

      this.yAxis = d3.axisLeft()
        .tickSize(-this.width)
        .tickPadding(10)
        .scale(this.y);

      this.line = d3.line()
        .x((d) => this.x(d.index))
        .y((d) => this.y(d.amount));
    }

    setupDOM() {
      this.svg = this.container.append('svg')
        .attr('class', 'line-chart')
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

      this.svg.append('g')
        .attr('class', 'x-axis axis')
        .attr('transform', `translate(0, ${this.height})`);

      this.svg.append('g')
        .attr('class', 'y-axis axis');

      this.svg.append('path')
        .attr('class', 'line-path');
    }

    drawGraph(data) {
      const [minY, maxY] = d3.extent(data, (d) => d.amount);
      const margin = (maxY - minY) / 3;
      this.x.domain(d3.extent(data, (d) => d.index));
      this.y.domain([minY - margin, maxY + margin]);


      this.svg.select('g.x-axis')
        .call(this.xAxis);

      this.svg.select('g.y-axis')
        .call(this.yAxis);

      this.svg.select('.line-path')
        .datum(data)
        .attr('d', this.line);

      const lineDots = this.svg.selectAll('.line-dot')
        .data(data);
      lineDots.exit().remove();
      lineDots.enter()
        .append('circle')
        .attr('class', 'line-dot')
        .attr('r', 4);

      this.svg.selectAll('.line-dot')
        .attr('cy', (d) => this.y(d.amount))
            .attr('cx', (d) => this.x(d.index));
    }
  };
}
ChartFactory.$inject = ['$log'];

function chartDirective(ExpectReturnChartFactory) {
  return {
    scope: { data: '=chartData' },
    link: function chartLink($scope, $el) {
      const graph = new ExpectReturnChartFactory($el[0], {
        height: 210,
        top: 10,
        left: 88,
        right: 48,
        bottom: 24,
      });

      $scope.$watch(() => $scope.data, (newV) => {
        if (!newV) { return; }
        graph.drawGraph(newV);
      });
    },
  };
}
chartDirective.$inject = ['ExpectReturnChartFactory'];


angular.module(module, [])
  .factory('ExpectReturnChartFactory', ChartFactory)
  .directive('uExpectReturnChart', chartDirective);

export default module;
