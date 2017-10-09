import moment from 'moment'

class BookListCtrl {
  static get $inject() {
    return [
      '$log', '$http', 'SettingsService', '$stateParams', '$scope',
      '$window', '$ionicViewSwitcher', '$ionicPopup',
      'RefresherFactory', 'StateService',
      'ClientModel', 'WechatService', 'LoadingService',
    ];
  }

  constructor(
    $log, $http, SettingsService, $stateParams, $scope,
    $window, $ionicViewSwitcher, $ionicPopup,
    RefresherFactory, StateService,
    ClientModel, WechatService, LoadingService
  ) {
    this.isCordova = $window.ionic.Platform.isWebView();

    this.$log = $log;
    this.$http = $http;
    this.SettingsService = SettingsService;
    this.$scope = $scope;
    this.$window = $window;
    this.StateService = StateService;
    this.$ionicViewSwitcher = $ionicViewSwitcher;
    this.$ionicPopup = $ionicPopup;
    this.ClientModel = ClientModel;
    this.clientId = $stateParams.clientId;
    this.WechatService = WechatService;
    this.LoadingService = LoadingService

    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );

    this.setWatcher();
    const timer_id = setInterval(this.refreshTick.bind(this), 1000 * 60);

    this.$scope.$on('$ionicView.beforeLeave', () => {
      if (timer_id) {
        clearInterval(timer_id);
      }
    });
  }

  refreshTick() {
    if (this.needRefresh) {
      this.fetchBookList();
    }
  }

  fetchBookList() {
    this.ClientModel.fetchBookList(this.clientId)
      .then((resp) => {
        this.bookList = resp.data.results;
        this.needRefresh = this.bookList.find(p => p.status == "PROCESSING") != null;
      });
  }

  calcRemainingMinutes(createdTime) {
    const created = moment(createdTime);
    const endDate = created.add(10, 'minutes');
    const remaing = endDate.diff(moment(), 'minutes');
    return Math.max(remaing, 1);
  }


  refreshFn() {
    this.fetchBookList();
    return this.ClientModel.get(this.clientId)
      .then((resp) => {
        this.client = resp.data;
      });
  }

  setWatcher() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.refresher.call();
      this.email = null;
    });

  }

  // TODO: verify that this is is working for
  //       1. wechat browser
  //       2. cordova like emulator
  preview(book) {
    var pdf_url = this.SettingsService.baseURL + "/" + book.pdf.substr(book.pdf.indexOf("private_media"));
    // TODO: add access_token for the pdf_url
    this.$window.open(pdf_url, '_system');
  }

  // TODO: verify that this is is working for
  //       2. cordova real device with wechat installed
  shareWechat(book) {
    this.WechatService.shareToSession({
      message: {
        title: '投资组合报告书',
        description: `${this.client.name} 的投资组合报告书`,
        media: {
          type: this.WechatService.plugin.Type.WEBPAGE,
          webpageUrl: book.pdf,
        },
      },
    });
  }

  backList() {
    this.$ionicViewSwitcher.nextDirection('back');
    this.StateService.doneTo('tab.crm');
  }

  getEmail(book) {

    const sendEmail = (e) => {
      if (this.email) {
        this.sendBook(book.id, this.email);
      } else {
        e.preventDefault();
        this.LoadingService.showFailedLoading('邮箱地址不正确');
      }
    }

    var myPopup = this.$ionicPopup.show({
      template: '<label class="item item-input"><input type="email" ng-model="vm.email" placeholder="请输入您的邮箱地址"></label>',
      title: '获取报告书',
      scope: this.$scope,
      buttons: [
        { text: '取消' },
        {
          text: '发送',
          type: 'button-positive',
          onTap: sendEmail,
        }
      ]
    });

  }

  sendBook(bookId, email) {
    const send = this.ClientModel.emailBook(bookId, email).then(() => {
      this.LoadingService.showToast('发送成功，请注意查收');
    }).catch((res) => {
      const { error_code } = res.data;
      let error = '建议书发送失败，请重试';
      if (error_code === 'too_frequent_email_code') {
        error = '发送太频繁，请稍后再试';
      }
      this.LoadingService.showFailedLoading(error);
    });
  }
}

const options = {
  controller: BookListCtrl,
  templateUrl: 'pages/crm/book-list.html',
};

export default options;
