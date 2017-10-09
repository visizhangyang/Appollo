import * as d3 from 'd3';
import moment from 'moment';

class D3LineChart {
    constructor(container, options) {
        options = options || {};
        this.container = container;
        this.init(options);
    }

    init(options) {
        this.margin = {
            left: options.left || 0,
            top: options.top || 0,
            bottom: options.bottom || 0,
            right: options.right || 0,
        };
        this.width = this.container.clientWidth;
        this.height = options.height || 150;
        this.XAXIS_HEIGHT = 17;
    }

    initSVG() {
        d3.select(this.container).selectAll('svg').remove();
        return d3.select(this.container).append('svg')
            .attr('class', 'd3-line-chart')
            .attr('width', this.width)
            .attr('height', this.height);
    }

    draw(data, transitionDuration = 0) {
        if (data == null) return;
        // console.log('lineChart data', data);
        const svg = this.initSVG();
        const margin = this.margin,
            availableWidth = this.width - this.margin.left - this.margin.right,
            chartViewHeight = this.height - margin.top - margin.bottom - this.XAXIS_HEIGHT;

        const productsDomain = this.getProductsDomain(data.products);

        const x = d3.scaleLinear().range([0, availableWidth]).domain([0, data.date.length]);
        const y = d3.scaleLinear().range([chartViewHeight, 0]).domain(productsDomain);
        const xTickValues = generateTickValues(data.date.length, 4);

        // --- lines view
        const g_chart = svg.append('g').attr('class', 'g-chart').attr('transform', `translate(${margin.left},${margin.top})`);
        const line = d3.line()
            .x((_, index) => x(index))
            .y(d => y(d));

        const lineTransition = d3.transition()
            .duration(transitionDuration)
            .ease(d3.easeLinear);

        for (let i = data.products.length; i > 0; i--) {
            // render the lines with inverse order
            const product = data.products[i - 1];

            const path = g_chart.append('path')
                .datum(product.data)
                .attr('class', 'line')
                .attr('stroke', product.color)
                .attr('stroke-width', i === 1 ? 1.5 : 1)
                .attr('d', line);

            if (transitionDuration > 0) {
                const totalLength = path.node().getTotalLength();
                path.attr('stroke-dasharray', totalLength + ' ' + totalLength)
                    .attr('stroke-dashoffset', totalLength)
                    .transition(lineTransition)
                    .attr('stroke-dashoffset', 0);
            }
        }

        //--- axis view x-axis
        const g_axis = svg.append('g').attr('class', 'g-axis');
        const dateFormat = d3.timeFormat('%m/%Y');
        const xAxisTextFormatter = (index) => dateFormat(new Date(data.date[index]));
        // const xAxisTickScale = d3.scaleLinear().domain([10, 100]).range([])

        const xAxis = d3.axisBottom().scale(x).ticks(3).tickSizeInner(-6).tickSizeOuter(0).tickFormat(xAxisTextFormatter).tickValues(xTickValues);
        const xAxisMarginTop = this.height - margin.bottom - this.XAXIS_HEIGHT;
        const xAxisView = g_axis.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(${margin.left},${xAxisMarginTop})`)
            .call(xAxis);
        //xAxisView.selectAll('.tick text').attr('x', 26);


        //--- axis view y-axis
        const yAxisTextFormatter = (value) => (((value - 1) * 100).toFixed(1) + '%');
        const yAxis = d3.axisRight().scale(y).ticks(4).tickPadding(0).tickSize(0).tickFormat(yAxisTextFormatter);
        const yAxisMarginLeft = this.width - margin.right;
        g_axis.append('g')
            .attr('class', 'y axis')
            .attr('transform', `translate(${yAxisMarginLeft},${margin.top})`)
            .call(yAxis);

    }

    getProductsDomain(products) {
        let min, max;
        for (var product of products) {
            const domain = d3.extent(product.data);
            if (domain[0] < min || min === undefined) min = domain[0];
            if (domain[1] > max || max === undefined) max = domain[1];
        }
        return [min, max];
    }
}

function generateTickValues(total, count) {
    const values = [];
    if (total < count) count = total;
    count += 1;
    for (let i = 0; i < count - 1; i++) {
        values.push(Math.round(total * (i + 1) / count));
    }
    return values;
}

export default function directive($log) {
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: { data: '<data'},
        link: function($scope, $el) {
            const options = {
                top: 5,
                bottom: 5,
                left: 25,
                right: 45,
            }
            const lineChart = new D3LineChart($el.children()[0], options);
            const draw = lineChart.draw.bind(lineChart);
            draw($scope.data, 0);
            const debouncefn = _.debounce(draw, 250);
            $scope.$watch('data', function(newData, oldData) {
                if (newData != oldData) {
                    debouncefn(newData, 0);
                }
            });
        }
    };
}

directive.$inject = ['$log'];