import uploadImgComponent from './upload-img';
import fileInputDirective from './file-input';
import backBtn from './back-btn';
import productItemCmp from './product-item';
import userLinkCmp from './user-link';
import UserLoginService from './user-login';
import UserSMSLoginService from './user-sms-login';
import UserSignUpService from './user-signup';
import onRequest from './on-request';
import NewBenchmarkService from './new-benchmark';
import refreshViewCmp from './refresh-view';
import FeedbackImage from './feedback-image';
import weeklyProductListCmp from './weekly-products-list';
import moneyTextCmp from './moneyText';
import supportTelCmp from './support-tel';
import customerItemCmp from './customer-item';
import slideWheelDirective from './slideWheel';

import barChartModule from './barChart';
import barChartV2Module from './barChartV2';
import projectionModule from './projectionGraph';
import barCompareChartModule from './barCompareChart';
import donutModule from './donut';
import returnModule from './expected-return-chart';
import planSlider from './plan-slider';
import currentAssetCmp from './current-asset';
import suggestAssetCmp from './suggest-asset';
import insuranceCmp from './insurance';
import proposalCmp from './proposal-cmp';
import moneySlideCmp from './moneySlide';
import SliderCmp from './slider';

import D3LineChart from './charts/d3-line-chart';
import D3LineChartComponent from './charts/d3-line-chart-period-component';
import RiskAdjustmentChart from './charts/risk-adjustment-chart';
import RiskAdjustmentChartComponent from './charts/risk-adjustment-chart-component';
import portfolioCmp from './portfolio-cmp';
import RiskLevelAdjustmentGraph from './risk-level-adjustment-graph';
import barchartCmp from './barchart-cmp';

import barchartVertialCompare from './charts/barchart-vertial-compare';
import barchartVertialCompareComponent from './charts/barchart-vertial-compare-component';
import fluctuation from './fluctuation';

const moduleName = 'unicorn.component';

angular.module(moduleName, [
    barChartModule, barCompareChartModule, donutModule, planSlider, returnModule,
    projectionModule,
])
    .directive('uploadImgComponent', uploadImgComponent)
    .directive('fileInput', fileInputDirective)
    .directive('slideWheel', slideWheelDirective)
    .directive('onRequest', onRequest)
    .directive('mFeedbackImage', FeedbackImage)
    .service('UserLoginService', UserLoginService)
    .service('UserSMSLoginService', UserSMSLoginService)
    .service('UserSignUpService', UserSignUpService)
    .service('NewBenchmarkService', NewBenchmarkService)
    .component('sliderCmp', SliderCmp)
    .component('moneySlide', moneySlideCmp)
    .component('productItem', productItemCmp)
    .component('userLink', userLinkCmp)
    .component('refreshView', refreshViewCmp)
    .component('weeklyProductListCmp', weeklyProductListCmp)
    .component('moneyTextCmp', moneyTextCmp)
    .component('supportTelCmp', supportTelCmp)
    .component('customerItemCmp', customerItemCmp)
    .component('currentAssetCmp', currentAssetCmp)
    .component('suggestAssetCmp', suggestAssetCmp)
    .component('insuranceCmp', insuranceCmp)
    .component('proposalCmp', proposalCmp)
    .component('backBtn', backBtn)
    .directive('d3LineChart', D3LineChart)
    .component('d3LineChartComponent', D3LineChartComponent)
    .directive('riskAdjustmentChart', RiskAdjustmentChart)
    .component('riskAdjustmentChartComponent', RiskAdjustmentChartComponent)
    .directive('barchartVertialCompare', barchartVertialCompare)
    .component('barchartVertialCompareComponent', barchartVertialCompareComponent)
    .component('portfolioCmp', portfolioCmp)
    .component('riskLevelAdjustmentGraph', RiskLevelAdjustmentGraph)
    .component('barchartCmp', barchartCmp)
    .directive('fluctuation', fluctuation);

export default moduleName;