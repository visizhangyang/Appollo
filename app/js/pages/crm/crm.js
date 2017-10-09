import customerForm from './customer-form';
import customerAdditionForm from './customer-addition-form';
import customerEdit from './customer-edit';
import customerDetail from './customer-detail';
import reminder from './reminder';
import customerSearchModule from './customer-search';
import customerFilter from './customer-filter';
import customerFilterResult from './filter-result';
import questionnaire from './questionnaire';
import risklevel from './risklevel';
import risklevelChange from './risklevel-change';
import assetForm from './asset-form';
import assetFormAllocation from './asset-form-allocation';
import assetFormInsurance from './asset-form-insurance';
import asset from './asset';
import proposal from './proposal';
import proposalPerf from './proposal-perf';
import proposalForm from './proposal-form';
import proposalAdjust from './proposal-adjust';
import bookList from './book-list';
import portfolioAnalysis from './portfolio-analysis';
import portfolioCompare from './portfolio-compare';
import portfolioPreview from './portfolio-preview';
import portfolioPerf from './portfolio-perf';
import efProfile from './ef-profile';
import kyc from './kyc';
import assetSummary from './asset-summary';
import portfolioBook from './portfolio-book';
import portfolioList from './portfolio-list';
import portfolioDetails from './portfolio-details';


class ConfigState {
    constructor($stateProvider) {
        this.$stateProvider = $stateProvider;
    }

    applyOption(stateName, url, option) {
        this.$stateProvider
            .state(stateName, {
                url,
                params: option.params,
                controller: option.controller,
                templateUrl: option.templateUrl,
                controllerAs: 'vm',
            });
        return this;
    }
}

function Config($stateProvider) {
    const state = new ConfigState($stateProvider);
    state.applyOption(
        'customerForm',
        '/crm/new-customer',
        customerForm
    )
        .applyOption(
        'customerAdditionForm',
        '/crm/new-customer-addition',
        customerAdditionForm
        )
        .applyOption(
        'customerDetail',
        '/crm/customer-detail/:id',
        customerDetail
        )
        .applyOption(
        'reminder',
        '/crm/reminder',
        reminder
        )
        .applyOption(
        'customer-filter',
        '/crm/filter',
        customerFilter
        )
        .applyOption(
        'filter-result',
        '/crm/filter-result',
        customerFilterResult
        )
        .applyOption(
        'questionnaire',
        '/crm/questionnaire/:id',
        questionnaire
        )
        .applyOption(
        'risklevel',
        '/crm/risklevel/:id',
        risklevel
        )
        .applyOption(
        'risklevelChange',
        '/crm/risklevel-change/:id',
        risklevelChange
        )
        .applyOption(
        'assetForm',
        '/crm/asset-form/:id/risk-level/:risklevel',
        assetForm
        )
        .applyOption(
        'assetFormAllocation',
        '/crm/asset-allocation/:id',
        assetFormAllocation
        )
        .applyOption(
        'assetFormInsurance',
        '/crm/asset-insurance/:id',
        assetFormInsurance
        )
        .applyOption(
        'asset',
        '/crm/asset/:id',
        asset
        )
        .applyOption(
        'proposal',
        '/crm/proposal/:id',
        proposal
        )
        .applyOption(
        'proposalPerf',
        '/crm/proposalPerf/:id',
        proposalPerf
        )
        .applyOption(
        'proposalForm',
        '/crm/proposal-form/:id',
        proposalForm
        )
        .applyOption(
        'proposalFormDetail',
        '/crm/proposal-form/:id/portfolio/:portfolioId/tab/:tab',
        proposalForm
        )
        .applyOption(
        'proposalAdjust',
        '/crm/proposal-adjust/:clientId',
        proposalAdjust
        )
        .applyOption(
        'proposalAdjustDetail',
        '/crm/proposal-adjust/:clientId/portfolio/:portfolioId',
        proposalAdjust
        )
        .applyOption(
        'portfolioBook',
        '/crm/:clientId/portfolio-book/:bookId',
        portfolioBook
        )
        .applyOption(
        'portfolioList',
        '/crm/:clientId/portfolio-list',
        portfolioList
        )
        .applyOption(
        'bookList',
        '/crm/:clientId/book-list',
        bookList
        )
        .applyOption(
        'customerEdit',
        '/crm/edit-customer/:id',
        customerEdit
        ).applyOption(
        'portfolioAnalysis',
        '/crm/portfolio-analysis/:clientId/:portfolioId',
        portfolioAnalysis
        ).applyOption(
        'portfolioCompare',
        '/crm/portfolio-compare/:clientId',
        portfolioCompare
        ).applyOption(
        'portfolioPreview',
        '/crm/portfolio-preview/:clientId/:portfolioId',
        portfolioPreview
        ).applyOption(
        'portfolioPerf',
        '/crm/portfolio-perf/:clientId/:portfolioId',
        portfolioPerf
        ).applyOption(
        'efProfile',
        '/crm/ef-profile/:clientId',
        efProfile
        ).applyOption(
        'proposalEFProfile',
        '/crm/proposal-ef-profile/:clientId',
        efProfile
        ).applyOption(
        'kyc',
        '/crm/kyc/:clientId',
        kyc
        ).applyOption(
        'asset-summary',
        '/crm/asset-summary/:clientId',
        assetSummary
        ).applyOption(
        'portfolioDetails',
        '/crm/:clientId/portfolio-details/:portfolioId',
        portfolioDetails
        );
}

Config.$inject = ['$stateProvider'];

const moduleName = 'unicorn.crm';

angular.module(moduleName, [
    'ionic',
    customerSearchModule,
])
    .config(Config);

export default moduleName;
