
const moduleName = 'unicorn.factory.raven';


/*
 Decorator to add/override default $exceptionHandle
 1. if raven is enable, capture & send the exception to sentry
 2. otherwise keep it handled as default: log.error
 */
function ExceptionHandlerDecorator($delegate, $raven) {
  function ExceptionHandler(exception, cause) {
    const raven = $raven.get();
    if (raven) {
      const additionData = {
        culprit: $raven.getUrl(),
        extra: {
          exception,
          cause,
        },
      };
      raven.captureException(exception, additionData);
    } else {
      // continue default behavior: $log.error;
      $delegate(exception, cause);
    }
  }

  return ExceptionHandler;
}
ExceptionHandlerDecorator.$inject = ['$delegate', '$raven'];

/*
 * LogDecorator to override default function e.g $log.warn
 * to send logging message to sentry if raven is enable.
 */
function LogDecorator($raven, $delegate) {
  const raven = $raven.get();
  if (raven) {
    // e.g ['warn', 'error']
    const enableLevels = $raven.getLogs();

    enableLevels.forEach((method) => {
      // copy origin method
      const originMethod = $delegate[method];
      if (originMethod) {
        // override the method to add some raven function
        // eslint-disable-next-line
        $delegate[method] = (...args) => {
          const additionData = {
            culprit: $raven.getUrl(),
            tags: {
              key: 'console.log',
              level: 'warn',
            },
            extra: {
              // Let raven parser to handle object to string
              // - to avoid '[Object]' like string
              log_args: args,
            },
          };
          const message = [
            'logger::',
            `${method}::`,
            Array.prototype.join.call(args),
          ].join('');

          raven.captureMessage(message, additionData);

          // calling origin $log.LEVEL function body
          originMethod.apply(null, args);
        };
      }
    });
  }
  return $delegate;
}
LogDecorator.$inject = ['$raven', '$delegate'];

function RavenService($window, $injector, config) {
  const self = this;
  const initParam = config.initParam;

  if ($window.Raven && initParam && initParam.key) {
    $window.Raven.config(initParam.key, initParam.opts || {}).install();
  }

  const logLevels = ['debug', 'info', 'warn', 'error'];
  const activeLevelIndex = logLevels.indexOf(config.logLevel);

  const enableLevels = logLevels.slice(activeLevelIndex);

  self.VERSION = ($window.Raven) ? $window.Raven.VERSION : 'development';
  self.TraceKit = ($window.Raven) ? $window.Raven.TraceKit : 'development';

  self.isReady = () => {
    if (!$window.Raven) {
      return false;
    }
    return $window.Raven.isSetup();
  };

  self.get = () => {
    if (!self.isReady()) {
      return null;
    }
    return $window.Raven;
  };

  self.getLogs = () => enableLevels;

  let $location;
  self.getUrl = () => {
    $location = $location || $injector.get('$location');
    return $location.url();
  };
}

function RavenProvider() {
  // Default compiled list of common ignore rules from community
  // see: https://gist.github.com/impressiver/5092952
  const initConf = {
    opts: {
      // Will cause a deprecation warning,
      // but the demise of `ignoreErrors` is still under discussion.
      // See: https://github.com/getsentry/raven-js/issues/73
      ignoreErrors: [
        // Random plugins/extensions
        'top.GLOBALS',
        // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'http://tt.epicplay.com',
        'Can\'t find variable: ZiteReader',
        'jigsaw is not defined',
        'ComboSearch is not defined',
        'http://loading.retry.widdit.com/',
        'atomicFindClose',
        // Facebook borked
        'fb_xd_fragment',
        // ISP "optimizing" proxy - `Cache-Control: no-transform`
        // seems to reduce this. (thanks @acdha)
        // See http://stackoverflow.com/questions/4113268/how-to-stop-javascript-injection-from-vodafone-proxy
        'bmi_SafeAddOnload',
        'EBCallBackMessageReceived',
        // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
        'conduitPage',
        // Generic error code from errors outside the security sandbox
        // You can delete this if using raven.js > 1.0, which ignores these automatically.
        'Script error.',
      ],
      ignoreUrls: [
        // Facebook flakiness
        /graph\.facebook\.com/i,
        // Facebook blocked
        /connect\.facebook\.net\/en_US\/all\.js/i,
        // Woopra flakiness
        /eatdifferent\.com\.woopra-ns\.com/i,
        /static\.woopra\.com\/js\/woopra\.js/i,
        // Chrome extensions
        /extensions\//i,
        /^chrome:\/\//i,
        // Other plugins
        /127\.0\.0\.1:4001\/isrunning/i,  // Cacaoweb
        /webappstoolbarba\.texthelp\.com\//i,
        /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
      ],
    },
  };

  const defaultConf = {
    initParam: initConf,
    logLevel: 'info',
  };
  let config = {};

  this.setConfig = (_config) => {
    config = _.merge({}, defaultConf, _config);
    return this;
  };

  this.$get = ['$window', '$injector',
    ($window, $injector) => new RavenService($window, $injector, config),
  ];
}

angular.module(moduleName, ['unicorn.preprocess'])
  .provider('$raven', RavenProvider)
  .config(['$provide', 'ravenToken', 'isRelease', '$ravenProvider', 'sentryRelease',
    ($provide, ravenToken, isRelease, $ravenProvider, sentryRelease) => {
      $provide.decorator('$exceptionHandler', ExceptionHandlerDecorator);
      $provide.decorator('$log', LogDecorator);

      if (ravenToken !== 'undefined') {
        $ravenProvider.setConfig({
          initParam: {
            key: ravenToken,
            opts: {
              release: sentryRelease,
            },
          },
          logLevel: 'warn',
        });
      }
    }]);


export default moduleName;
