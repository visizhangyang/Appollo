
export default class UserModel {
  static get $inject() {
    return [
      '$q', '$log', '$http', '$rootScope', '$ionicHistory',
      'StateService', 'ApiService', 'DeviceService', 'TranslateFactory'
    ];
  }

  constructor(
    $q, $log, $http, $rootScope, $ionicHistory,
    StateService, ApiService, DeviceService, TranslateFactory
  ) {
    this.$log = $log;
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.$ionicHistory = $ionicHistory;
    this.StateService = StateService;
    this.ApiService = ApiService;
    this.bareUserApi = ApiService.baseApi.all('user');
    this.authUserApi = ApiService.authApi.all('user');
    this.DeviceService = DeviceService;
    this.features = {};

    let translateFactory = new TranslateFactory();
    this.$translate = translateFactory.get$translate();
    this.$translate.onReady().then(() => {
      this.errorCodeDict = {
        phone_unregistered: this.$translate.instant('user_error_code_phone_unregistered'),
        login_failed_error: '手机,验证码有误,请重试',
        serializer_validation_error: '提交的数据有误',
        phone_registered: '该手机号已被注册过了',
        user_has_active_phone: '您已经用这个手机号注册过了一次',
        phone_verification_error: '验证码不正确或已经过期，请尝试重新发送验证码',
        phone_not_found: '请先发送验证码到这个手机号',
        phone_verification_send_failed: '无法发送短信，请联系弥财支持团队',
        incorrect_password: this.$translate.instant('user_error_code_incorrect_password'),
        invalid_invite_code: this.$translate.instant('user_error_code_account_inactive'),
        account_inactive: '您的试用账户已过期，如果需要重新获得授权登录，请与弥财公司联系(support@micaiapp.com)',
      };

      this.errorCb = this.ApiService.errorMsgInterceptor(this.errorCodeDict);
    });



    this.setup = $q.defer();

    this.language = translateFactory.get$translate().preferredLanguage();
  }

  isLogged() {
    return !!this.$http.defaults.headers.common.Authorization;
  }

  onSetupReady() {
    return this.setup.promise;
  }

  ready(fn) {
    return this.onSetupReady().then(() => fn(this.authUserApi));
  }

  setLogged(token, saveStorage = true) {
    this.setup.resolve();
    if (token != null && token.length > 0) {
      this.$http.defaults.headers.common.Authorization = `Token ${token}`;
    } else {
      delete this.$http.defaults.headers.common.Authorization;
    }

    this.$http.defaults.headers.common['Accept-Language'] = this.language;

    if (saveStorage) {
      this.DeviceService.setToken(token)
        .catch((err) => {
          this.$log.error('Save device token failed', err);
        });
    }
  }

  /**
   * Init $http token: read from localStorage & save it to $http
   * - call it initial bootstrapping app
   *
   * @returns {*|r.promise|promise}
   */
  checkLogged() {
    this.DeviceService.getToken()
      .then((token) => {
        this.setLogged(token, false);
        this.initFeatures();
      }, (err) => {
        this.$log.error('Get device token failed', err);
        this.setLogged(null, false);
      });
  }

  listenLogout() {
    this.$rootScope.$on('unusable.unauth', () => {
      this.logout(false);
    });
  }

  logout(syncBackend) {
    if (syncBackend) {
      this.authUserApi.customPOST({}, 'logout');
    }
    this.setLogged(null);
    this.clearFeatures();

    this.$ionicHistory.clearHistory();
    return this.$ionicHistory.clearCache()
      .then(() => {
        this.StateService.forwardToRoot('landing');
      });
  }

  login(user) {
    return this.bareUserApi.customPOST(user, 'password_login')
      .then((resp) => {
        const token = resp.data.token;
        this.setLogged(token);
        this.initFeatures();
        return resp;
      },
      this.errorCb
      );
  }

  tobOAuthLogin(partner, access_token) {
    return this.bareUserApi.customPOST({
      partner,
      access_token,
    }, 'common_oauth_login')
      .then((resp) => {
        const token = resp.data.token;
        this.setLogged(token);
        this.initFeatures();
        return resp;
      },
      this.errorCb
      );
  }

  smsLogin(phone, code) {
    const isSecondStep = !!code;

    return this.bareUserApi.customPOST({ phone, code }, 'login')
      .then((resp) => {
        if (isSecondStep) {
          const token = resp.data.token;
          this.setLogged(token);
          this.initFeatures();
        }
        return resp;
      },
      this.errorCb
      );
  }

  signup(phone, code, password, inviteCode) {
    const isSecondStep = !!code;

    return this.bareUserApi.customPOST({
      phone,
      code,
      password,
      invite_code: inviteCode,
    }, 'register')
      .then((resp) => {
        if (isSecondStep) {
          const token = resp.data.token;
          this.setLogged(token);
          this.initFeatures();
        }
        return resp;
      },
      this.errorCb
      );
  }

  resetPassword(code, password) {
    const fn = (api) => api.customPOST({ code, password }, 'set_password').catch(this.errorCb);
    return this.ready(fn);
  }

  fetchDetail() {
    const fn = (api) => api.customGET('user_details');
    return this.ready(fn);
  }

  postDetail(params) {
    const fn = (api) => api.customPOST(params, 'user_details')
      .catch(this.errorCb);

    return this.ready(fn);
  }

  postFeedback(userFeedback) {
    const formData = new FormData();
    Object.keys(userFeedback).forEach((key) => {
      if (key === 'images') {
        userFeedback[key].forEach((item) => {
          formData.append(`${key}`, item);
        });
      } else {
        formData.append(key, userFeedback[key]);
      }
    });

    const fn = (api) => api.customPOST(formData, 'feedback', undefined,
      { 'Content-Type': undefined }
    ).catch(this.errorCb);
    return this.ready(fn);
  }

  fetchNameCard() {
    const fn = (api) => api.customGET('name_card');
    return this.ready(fn);
  }

  postNameCard(params) {
    const fn = (api) => api.customPOST(params, 'name_card', undefined, {
      'Content-Type': undefined,
    });
    const promise = this.ready(fn);
    return promise.catch(this.errorCb);
  }

  fetchProducts(payload) {
    const fn = (api) => api.all('products').getList(payload);
    return this.ready(fn);
  }

  fetchCollection(payload) {
    const fn = (api) => api.all('collections').getList(payload);
    return this.ready(fn);
  }

  postCollect(payload) {
    const fn = (api) => api.customPOST(payload, 'collections');
    return this.ready(fn);
  }

  deleteCollect(collectionId) {
    const fn = (api) => api.all('collections').one(`${collectionId}`).remove();
    return this.ready(fn);
  }

  fetchMessages() {
    /* deprecated
    const fn = (api) => api.all('messages').getList();
    return this.ready(fn);
    */
  }

  fetchQuestionnaire() {
    /* deprecated
    return this.bareUserApi.all('questionnaire_schema').customGET();
    */
  }

  postQuestionnaire(data) {
    /* deprecated
    const fn = (api) => api.all('clients').customPOST(data, 'questionnaire');
    return this.ready(fn);
    */
  }

  fetchTargets() {
    return this.bareUserApi.all('asset_target').customGET();
  }

  fetchRiskalyzeSchema() {
    return this.bareUserApi.all('riskalyze_schema').customGET();
  }

  fetchFeatures() {
    return this.authUserApi.all('features').customGET();
  }

  initFeatures() {
    this.clearFeatures();
    if (this.isLogged()) {
      this.fetchFeatures().then((result) => {
        result.data.features.forEach((feature) => {
          this.features[feature] = true;
        });
      });
    };
  }

  clearFeatures() {
    this.features = {};
  }
}

