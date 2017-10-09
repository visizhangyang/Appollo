

class Controller {
  static get $inject() {
    return [
      '$log', '$http', 'SettingsService', '$stateParams', '$scope',
      '$window', '$ionicViewSwitcher',
      'StateService',
      'PortfolioModel', 'WechatService', '$ionicPopup', 'LoadingService', 'TranslateFactory'
    ];
  }

  constructor(
    $log, $http, SettingsService, $stateParams, $scope,
    $window, $ionicViewSwitcher,
    StateService,
    PortfolioModel, WechatService, $ionicPopup, LoadingService, TranslateFactory
  ) {
    this.$log = $log;
    this.$http = $http;
    this.SettingsService = SettingsService;
    this.$scope = $scope;
    this.$window = $window;
    this.StateService = StateService;
    this.$ionicViewSwitcher = $ionicViewSwitcher;
    this.PortfolioModel = PortfolioModel;
    this.clientId = $stateParams.clientId;
    this.WechatService = WechatService;
    this.$ionicPopup = $ionicPopup;
    this.LoadingService = LoadingService;

    this.portfolioList = null;

    var translateFactory = new TranslateFactory();
    this.language = translateFactory.get$translate().preferredLanguage();

    this.loadData();

  }


  loadData() {
    this.PortfolioModel.getPortfolioList(this.clientId).then(res => {
      this.portfolioList = res.data.results;
    });
  }

  toBookList() {
    this.StateService.forward('bookList', { clientId: this.clientId });
  }
}

const options = {
  controller: Controller,
  templateUrl: 'pages/crm/portfolio-list.html',
};

export default options;
