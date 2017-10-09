import * as d3 from 'd3';

const moduleName = 'unicorn.component.donut';

function DonutFactory($log, $filter) {
  const formatPercent = $filter('formatPercent');
  const transAsset = $filter('transAsset');
  return class Donut {
    constructor(node, type) {
      $log.debug('initializing the donut');
      this.type = type;
      this.setupDOM(node);
    }

    setupDOM(node) {
      const container = d3.select(node);
      const size = container.node().clientHeight;

      let innerRadius = 0;
      let outerRadius = size * 0.4;
      if (this.type == 'double') {
        innerRadius = size * 0.3125;
        outerRadius = size * 0.5;
      }
      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
      this.arc = arc;

      if (this.type == 'double') {
        this.labelArc = arc;
      }
      else {
        this.labelArc = d3.arc()
          .innerRadius(size * 0.4 + 15)
          .outerRadius(size * 0.4 + 15);
      }

      const labelArc = this.labelArc;

      this.svg = container.append('svg')
        .attr('width', size)
        .attr('height', size);

      this.group = this.svg.append('g')
        .attr('transform', `translate(${size / 2}, ${size / 2})`);

      this.pie = d3.pie().sort(null).value((d) => d.percentage);

      this.arcTween = function arcTween(a) {
        // eslint-disable-next-line
        const i = d3.interpolate(this._current, a);
        return t => arc(i(t));
      };

      this.arcTween2 = function arcTween2(a) {
        // eslint-disable-next-line
        const i = d3.interpolate(this._current, a);
        return t => labelArc(i(t));
      };
    }

    draw(data, totalInvestment) {
      const t = d3.transition()
        .delay(500)
        .duration(1000);

      this.group.selectAll('.arc').remove();
      const arc = this.group.selectAll('.arc')
          .data(this.pie(data))
        .enter().append('g')
          // .attr('transform', 'rotate(180)')
          .attr('class', 'arc');

      const path = arc
        .append('path')
        .attr('class', (d) => d.data.code)
        .each(function setupCurrent() {
          // eslint-disable-next-line
          this._current = { startAngle: 0, endAngle: 0 };
        });
      const text = arc.append('text')
        .each(function setupCurrent() {
          // eslint-disable-next-line
          this._current = { startAngle: 0, endAngle: 0 };
        })
        .attr('opacity', 0)
        .attr('transform', (d) => `translate(${this.labelArc.centroid(d)})`);


      if (this.type == 'double') {
        text.append('tspan').text((d) => transAsset(d.data.code));
      }

      var percentageText = text.append('tspan')
        .text((d) => {
          if (d.data.percentage < 2) {
            return '';
          }
          return `${formatPercent(d.data.percentage)}%`;
        });

      if (this.type == 'double') {
        percentageText.attr('x', 0).attr('dy', '1.1em');

        this.group.append('text')
          .text(`总资产${totalInvestment}万元`)
          .attr('class', 'total-investment');
      }

      path.transition(t)
        .attrTween('d', this.arcTween);
      text.transition(t)
        .attr('opacity', 1);
    }
  };
}
DonutFactory.$inject = ['$log', '$filter'];

// eslint-disable-next-line
function donutDirective($log, DonutFactory) {
  return {
    scope: { data: '=donutData', totalInvestment: '@', type: '@' },
    link: function donutLink($scope, $el) {
      const graph = new DonutFactory($el[0], $scope.type);
      $scope.$watch(() => $scope.data, (newV) => {
        if (!newV) { return; }
        graph.draw(newV, $scope.totalInvestment);
      });
    },
  };
}
donutDirective.$inject = ['$log', 'DonutFactory'];

angular.module(moduleName, [])
  .factory('DonutFactory', DonutFactory)
  .directive('uDonut', donutDirective);


export default moduleName;
