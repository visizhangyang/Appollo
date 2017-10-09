
/**
 * @name wechat.js
 * @description
 *
 * # wechat.js
 * contain login and share function, compatible with cordova wechat plugin.
 *
 *
 * WeChat Object can be:
 * - string like: "abcdefg"
 * - object like:
 *  {
 *      thumbData?: string;   //base64 string image
 *      title? : 'title',
 *      description? : 'link description',
 *      data?: string; //base64 string (as url)
 *      url? : 'http://micaiapp.com/'
 *  }
 *
 */

export default class WechatService {
  static get $inject() {
    return [
      '$log', '$window', '$q',
    ];
  }

  constructor(
    $log, $window, $q
  ) {
    this.$q = $q;
    this.plugin = $window.Wechat;
    const isCordova = $window.ionic.Platform.isWebView();


    if (isCordova) {
      this.plugin.isInstalled((installed) => {
        this.installed = installed;
      }, (reason) => {
        $log.error(`wechat is not installed ${reason}`);
      });
    }

    // this.shareToSession = _.partialRight(
    //   this.shareTo,
    //   this.plugin ? this.plugin.Scene.session : null
    // );
    // this.shareToTimeline = _.partialRight(
    //   this.shareTo,
    //   this.plugin ? this.plugin.Scene.timeline : null
    // );
  }

  isInstalled() {
    return this.installed;
  }

  shareToSession(shareObj) {
    return this.shareTo(shareObj, this.plugin.Scene.SESSION);
  }

  shareToTimeline(shareObj) {
    return this.shareTo(shareObj, this.plugin.Scene.TIMELINE);
  }

  shareToFavorite(shareObj) {
    return this.shareTo(shareObj, this.plugin.Scene.FAVORITE);
  }

  shareTo(shareObj, scene) {
    const defer = this.$q.defer();

    if (!this.installed) {
      defer.reject('The wechat plugin is not loaded');
      return defer.promise;
    }

    if (!shareObj) {
      defer.reject('The data is empty');
      return defer.promise;
    }

    shareObj.scene = scene;

    this.plugin.share(shareObj, () => {
      defer.resolve();
    }, (error) => {
      defer.reject(error);
    });
    return defer.promise;
  }
}

