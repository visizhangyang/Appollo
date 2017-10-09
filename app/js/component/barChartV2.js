// factory ....
import * as d3 from 'd3';

const translation = {
	ALTERNATIVE: 'common_alternatives',
	STOCK: 'common_equity',
	FIXED_INCOME: 'common_fixed_income',
	CASH: 'common_cash'
};

function transCode(code, $tanslate) {
	return $tanslate.instant(translation[code]);
}

const moduleName = 'unicorn.component.barChart';

class BarChartV2 {
  constructor(node, options, $filter, $translate) {
    //$log.debug('initializing the bar chart :)');
    this.options = options || {};
    this.container = d3.select(node);
    this.setupVar();
    this.setupUtils();
    this.setupDOM();
    this.data = null;
    // money | percentage
    this.mode = 'money';
    this.$filter = $filter;
    this.$translate = $translate;
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
    this.xAxisHeight = 20;
    this.adjustedHeight = this.height - this.margin.bottom - this.xAxisHeight;

    // This is min value when percentage > 1;
    // FIXME: better suggestion ?
    this.maskHeight = 2;
  }

  setupUtils() {
    this.x = d3.scaleBand()
      .range([0 + this.margin.left, this.width - this.margin.right]).padding(0.7);
    this.y = d3.scaleLinear()
      .range([this.adjustedHeight - this.maskHeight, this.margin.top]);
  }

  setupDOM() {

  }

  drawGraph() {
    const data = this.data;
    const mode = this.mode;

    if (data == null) return;

    if (this.svg) {
      this.svg.remove();
    }

    this.svg = this.container.append('svg')
      .attr('class', 'bar-chart')
      .attr('width', this.width)
      .attr('height', this.height);

    this.plots = this.svg.append('g')
      .attr('class', 'plots');
    // console.log('data', JSON.stringify(data));
    // attention，I'm gonna transit a bit
    const transitionDuration = 0;
    window.x = this.x.domain(data.map((d) => d.code));
    this.setYDomain(data);

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

    this.targetBar = targetBar;

    targetBar.append('rect')
      .attr('class', (d) => `${d.code} bar-rect`)
      .attr('class', (d) => `${d.code} bar-rect`)
      .attr('rx', 0)
      .attr('ry', 0)
      .attr('x', (d, i) => (this.x(d.code)))
      .attr('y', this.y(0))
      .attr('height', this.adjustedHeight - this.y(0))
      .attr('width', this.x.bandwidth());

    const t = d3.transition()
      .duration(transitionDuration);
    this.transition = t;

    this.svg.selectAll('.bar-rect').transition(t)
      .attr('y', (d) => this.getY(d))
      .attr('height', (d) => this.adjustedHeight - this.getY(d));

    const xAxis = d3.axisBottom()
      .scale(this.x).tickFormat((d) => transCode(d, this.$translate)).tickSize(0).tickPadding(5);

    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${this.height - this.margin.bottom - this.xAxisHeight})`)
      .call(xAxis);

    this.drawMoreGraph(t);

  }

  drawMoreGraph() {
    this.targetBar.append('text')
      .attr('class', 'target-text')
      .attr('y', (d, i) => this.getY(d))
      .attr('dy', '-5px')
      .attr('font-size', '10px')
      .attr('x', (d, i) => this.x(d.code) + this.x.bandwidth() / 2);

    this.svg.selectAll('.target-text').transition(this.transition)
      .text(d => this.getValueFormat(d));
  }

  setYDomain(data) {
    if (this.mode == 'money') {
      this.y.domain([0, d3.max(data, (d) => d.amount)]);
    }
    else {
      this.y.domain([0, d3.max(data, (d) => d.percentage)]);
    }
  }

  getY(d) {
    if (this.mode == 'money') {
      return this.y(d.amount);
    }
    else {
      return this.y(d.percentage);
    }
  }

  getValueFormat(d) {
    if (this.mode == 'money') {
      const formatMoney = this.$filter('formatMoney');
      return this.$translate.instant('common_eur_symbol') + formatMoney(d.amount) + this.$translate.instant('common_amount_unit');
    } else {
      const formatPercent = this.$filter('formatPercent');
      return `${formatPercent(d.percentage)}%`
    }
  }
}

class BarChartV2Ex extends BarChartV2 {
  setYDomain(data) {
    if (this.mode == 'money') {
      this.y.domain([0, d3.max(data, (d) => d.totalAmount)]);
    }
    else {
      this.y.domain([0, d3.max(data, (d) => Math.max(d.percentage, d.totalPercentage))]);
    }
  }

  getTotalY(d) {
    if (this.mode == 'money') {
      return this.y(d.totalAmount);
    }
    else {
      return this.y(d.totalPercentage);
    }
  }

  getValueFormat(d) {
    if (this.mode == 'money') {
      const formatMoney = this.$filter('formatMoney');
      return this.$translate.instant('common_eur_symbol') + formatMoney(d.totalAmount) + this.$translate.instant('common_amount_unit');
    } else {
      const formatPercent = this.$filter('formatPercent');
      return `${formatPercent(d.totalPercentage)}%`
    }
  }

  drawMoreGraph() {
    var data = this.data;
    const totalBarList = this.plots.selectAll('g.total-bar').data(data);
    totalBarList.selectAll('.bar-rect').data(data);

    const totalBar = totalBarList.enter()
      .append('g')
      .attr('class', 'total-bar');

    totalBar.append('rect')
      .attr('class', (d) => `total bar-rect`)
      .attr('rx', 0)
      .attr('ry', 0)
      .attr('x', (d, i) => (this.x(d.code)))
      .attr('y', this.y(0))
      .attr('height', this.adjustedHeight - this.y(0))
      .attr('width', this.x.bandwidth());

    totalBar.selectAll('.bar-rect').transition(this.transition)
      .attr('y', (d) => this.getTotalY(d))
      .attr('height', (d) => this.adjustedHeight - this.getTotalY(d));

    totalBar.append('text')
      .attr('class', 'total-text')
      .attr('y', (d, i) => this.getTotalY(d))
      .attr('dy', '-5px')
      .attr('font-size', '10px')
      .attr('x', (d, i) => this.x(d.code) + this.x.bandwidth() / 2);

    this.svg.selectAll('.total-text').transition(this.transition)
      .text(d => this.getValueFormat(d));

  }
}

function BarChartFactory($log, $filter) {
	return BarChartV2;
}
BarChartFactory.$inject = ['$log', '$filter'];

function BarChartFactoryEx($log, $filter) {
  return BarChartV2Ex;
}
BarChartFactoryEx.$inject = ['$log', '$filter'];

// eslint-disable-next-line
function barChartDirective($log, BarChartFactory, $filter, $translate) {
	return {
		scope: {
			data: '<barChartData',
			mode: '=',
		},
		link: function barChartLink($scope, $el) {
			const el = $el[0];
			const graph = new BarChartFactory(el, {
				height: el.offsetHeight,
				top: 15,
				left: 20,
				right: 20,
				bottom: 0,
			}, $filter, $translate);
			//$log.debug('drawing bar char', graph, $scope.data);
			$scope.$watch(() => $scope.data, (newV) => {
				if (!newV) { return; }
				graph.data = newV;
				graph.drawGraph();
			});

			$scope.$watch(() => $scope.mode, (newV) => {
				if (!newV) { return; }
				graph.mode = newV;
				graph.drawGraph();
			});
		},
	};
}
barChartDirective.$inject = ['$log', 'BarChartFactory', '$filter', '$translate'];

function barChartDirectiveEx($log, BarChartFactoryEx, $filter, $translate) {
  return barChartDirective($log, BarChartFactoryEx, $filter, $translate);
}
barChartDirectiveEx.$inject = ['$log', 'BarChartFactoryEx', '$filter', '$translate'];

angular.module(moduleName, [])
	.factory('BarChartFactory', BarChartFactory)
	.directive('uBarChartV2', barChartDirective)
  .factory('BarChartFactoryEx', BarChartFactoryEx)
  .directive('uBarChartV2Ex', barChartDirectiveEx);

export default moduleName;
