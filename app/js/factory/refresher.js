function isPromiseLike(obj) {
  return obj && angular.isFunction(obj.then);
}

export default function RefresherFactory(
  $q, $log, LoadingService, UserModel
) {
  return class Refresh {
    constructor(fn, scope) {
      this.refreshFn = fn;
      this.scope = scope.$new(true);
      this.loaded = false;
      this.requesting = false;

      // FIXME: might be a Performance issue ????
      //        - when scope is detached ...
      // think about nested refresher ?
      this.scope.$on('unusable.service', () => {
        this.onFail(false);
      });
      this.scope.$on('unusable.unauth', () => {
        this.onFail(false);
      });
    }

    call(final) {
      // wait till user is ready ..
      return UserModel.onSetupReady()
        .then(() => {
          this.requesting = true;

          const watcher = this.scope.$watch(this.requesting, (newV) => {
            if (!newV) {
              watcher();
              if (final) {
                final();
              }
            }
          });
          const promise = this.refreshFn();
          if (isPromiseLike(promise)) {
            promise.then(this.onLoaded.bind(this));
            promise.catch(() => {
              this.onFail(true);
            });
            return promise;
          }

          // if is not promise ...
          $log.warn('RefresherFactory: miss used refreshFn, should be promise');
          this.onLoaded();
          return $q.resolve();
        });
    }

    onLoaded() {
      $log.debug('refresher: onloaded');
      if (!this.requesting) {
        return;
      }
      this.loaded = true;
      this.requesting = false;
    }

    onFail(showFailed) {
      $log.debug('refresher: onFail, showFailed ?', showFailed);
      if (!this.requesting) {
        return;
      }
      this.requesting = false;

      if (showFailed) {
        LoadingService.showFailedLoading();
      }
    }
  };
}

RefresherFactory.$inject = ['$q', '$log', 'LoadingService', 'UserModel'];
