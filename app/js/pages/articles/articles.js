class ArticleCtrl {
  static get $inject() {
    return [
      '$rootScope', '$stateParams',
      'ArticlesModel', 'UserModel', 'StateService',
    ];
  }
  constructor(
    $rootScope, $stateParams,
    ArticlesModel, UserModel, StateService
  ) {
    this.$rootScope = $rootScope;
    this.UserModel = UserModel;
    this.StateService = StateService;

    this.slug = $stateParams.articleSlug;
    this.article = _.clone(ArticlesModel.articles[this.slug]);
    this.article.displayImg = this.article.headerImg || this.article.imgBg;

    if (this.slug !== 'weekly_products') {
      this.lightTheme = true;
    }
  }

  onClickHead() {
    if (this.slug === 'register-gift') {
      if (this.UserModel.isLogged()) {
        // whether user is verify ..
        this.StateService.go('accountProfile');
      } else {
        this.StateService.go('tab.account');
      }
    }
  }

  onClickSearchProducts() {
    this.StateService.replace('tab.products')
      .then(() => {
        this.$rootScope.$emit('searchProducts');
      });
  }
}

const moduleName = 'unicorn.articles';

angular.module(moduleName, [])
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider.state('articles', {
      url: '/articles/:articleSlug',
      controller: ArticleCtrl,
      controllerAs: 'vm',
      templateUrl: 'pages/articles/articles.html',
    });
  }]);

export default moduleName;
