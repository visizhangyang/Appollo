/* eslint-disable */

var gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),
  del = require('del'),
  md5 = require('md5'),
  fs = require('fs'),
  runSequence = require('run-sequence'),
  argv = process.argv,
  gutil = require('gulp-util'),
  git = require('git-rev'),
  sass = require('gulp-sass'),
  cleanCSS = require('gulp-clean-css');


// TODO: disable the source map if in cordova build ...

/**
 * Ionic hooks
 * Add ':before' or ':after' to any Ionic project command name to run the specified
 * tasks before or after the command.
 */
// gulp.task('serve:before', ['watch']);
gulp.task('emulate:before', ['www']);
// gulp.task('deploy:before', ['build']);
gulp.task('build:before', ['build']);

// we want to 'watch' when livereloading
var shouldWatch = argv.indexOf('-l') > -1 || argv.indexOf('--livereload') > -1;
gulp.task('run:before', [shouldWatch ? 'watch' : 'build']);


/**
 * Ionic Gulp tasks, for more information on each see
 * https://github.com/driftyco/ionic-gulp-tasks
 *
 * Using these will allow you to stay up to date if the default Ionic 2 build
 * changes, but you are of course welcome (and encouraged) to customize your
 * build however you see fit.
 */


var isRelease = argv.indexOf('--release') > -1;
var localConfig = "./local.config.json";
var ravenToken;
var sentry = {};
var config = {};

if (fs.existsSync(localConfig)) {
  try {
    config = require(localConfig);
    ravenToken = config && config.raven;
    if (config && config.sentry) {
      sentry = config.sentry;
    }
  } catch (e) {
    gutil.log(gutil.colors.magenta('Load local config failed'));
  }
}

var sentryRelease = null;
if (sentry.opt && sentry.opt.API_KEY) {
  sentryRelease = require('gulp-sentry-release')('./package.json', sentry.opt);
}


var paths = {
  app: 'app/',

  build: 'build/',
  dist: 'build/dist/',
  tmp: 'build/tmp/',

  bower_lib: 'app/lib/',

  template_resolve: __dirname + '/app/js/',
  bundle_lib_dist: 'app/js/build/',

  sentrySrc: [
    'build/dist/*.js.map',
    'build/dist/*.bundle.js',
  ],

  cordova: 'www/',

  sass: ['./scss/**/*.scss']
}

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('preprocess', ['read_git_v'], function () {
  return gulp.src(paths.app + './preprocess.js')
    .pipe($.preprocess({
      context: {
        isRelease: isRelease,
        ravenToken: ravenToken,
        sentryRelease: git_version_str,
        apiBaseUrl: config.apiBaseUrl,
      }
    }))
    .pipe(gulp.dest(paths.bundle_lib_dist));
});

gulp.task('templates', function () {
  return gulp.src(paths.app + 'js/**/*.html')
    .pipe($.newer(paths.build + 'templates.js'))
    .pipe($.plumber())
    .pipe($.htmlmin({}))
    .pipe($.angularTemplatecache({
      module: 'unicorn.templates',
      standalone: true,
      base: paths.template_resolve
    }))
    .pipe($.plumber.stop())
    .pipe(gulp.dest(paths.bundle_lib_dist));
});

var copyHTML;
gulp.task('html', function () {
  var copyHTML = copyHTML || require('ionic-gulp-html-copy');
  return copyHTML({
    src: paths.app + 'index.html',
    dest: paths.dist
  });
});

gulp.task('scripts', function () {
  return gulp.src([
    paths.bower_lib + 'ionic/js/ionic.bundle.js',
    paths.bower_lib + 'ngstorage/ngStorage.js',
    paths.bower_lib + 'lodash/dist/lodash.js',
    paths.bower_lib + 'restangular/dist/restangular.js',
    paths.bower_lib + 'raven-js/dist/raven.js'
  ])
    .pipe($.sourcemaps.init())
    .pipe($.concat('vendors.bundle.js'))
    .pipe($.if(
      isRelease,
      $.uglify()
    ))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('sass-lib-deprecated', function (done) {
  gulp.src([paths.bower_lib + 'ionic/scss/*',
  '!' + paths.bower_lib + 'ionic/scss/ionicons/*'])
    .pipe($.changed(paths.tmp + 'scss/'))
    .pipe(gulp.dest(paths.tmp + 'scss/'))
    .on('end', function () {
      gulp.src([paths.bower_lib + '/Ionicons/scss/*'])
        .pipe($.changed(paths.tmp + 'scss/ionicons/'))
        .pipe(gulp.dest(paths.tmp + 'scss/ionicons/'))
        .on('end', done);
    });
});

var sassBuild;
gulp.task('sass-deprecated', function () {
  sassBuild = sassBuild || require('ionic-gulp-sass-build');
  return sassBuild({
    src: paths.app + 'scss/app.scss',
    dest: paths.tmp, // dist tmp, ignore it..
    sassOptions: {
      includePaths: [
        paths.tmp + 'scss'
      ]
    }
  })
    .pipe($.base64({
      maxImageSize: 1024 * 1024, // 1MB
      extensions: [/datauri/],
      baseDir: paths.app + 'scss'
    }))
    .pipe($.if(
      isRelease,
      $.cleanCss({ keepSpecialComments: 0 })
    ))
    .pipe(gulp.dest('build/dist'))
});


gulp.task('sass-remove-ionic-ionicons', function () {
  return del('app/lib/ionic/scss/ionicons')
})

gulp.task('sass-copy-ionicons-to-ionic-ionicons', ['sass-remove-ionic-ionicons'], function () {
 return gulp.src('app/lib/Ionicons/scss/**/*')
    .pipe(gulp.dest('app/lib/ionic/scss/ionicons'))
})

gulp.task('sass-v2', function () {
  gulp.src(paths.app + 'scss/app.scss')
    .pipe($.sourcemaps.init())
    .pipe(sass({
      includePaths: [paths.bower_lib],
    }))
    .on('error', err=>console.error(err))
    .pipe($.base64({
      maxImageSize: 1024 * 1024, // 1MB
      extensions: [/datauri/],
      baseDir: paths.app + 'scss'
    }))
    .pipe($.if(!isRelease, $.sourcemaps.write('.')))
    .pipe($.if(isRelease, cleanCSS()))
    .pipe(gulp.dest('build/dist'))
})

gulp.task('font', function () {
  return gulp.src([paths.bower_lib + 'Ionicons/fonts/*'])
    .pipe(gulp.dest(paths.dist + 'fonts/'));
});

gulp.task('public', function () {
  return gulp.src([paths.app + 'public/**/*'])
    .pipe(gulp.dest(paths.dist + 'public'));
});

gulp.task('clean',[], function () {
  del('www');
  return del('build');
});

var buildBrowserify;
gulp.task('watch', ['clean'], function (done) {
  runSequence(
    'sass-copy-ionicons-to-ionic-ionicons',
    ['sass-v2', 'html', 'templates', 'preprocess', 'scripts', 'font', 'public', 'app-loader'],
    function () {
      $.watch([paths.app + 'js/**/*.scss', paths.app + 'scss/**/*.scss'], function () { gulp.start('sass-v2'); });
      $.watch(paths.app + 'js/**/*.html', function () { gulp.start('templates'); });
      $.watch(paths.app + 'index.html', function () { gulp.start('html'); });
      $.watch([
        paths.app + 'js/**/*.js',
        '!**/build/**/*.js'
      ],
        function (event) {
          lint(event.path);
        });
      $.watch([
        paths.dist + "app.css",                   // from sass
        paths.dist + "vendors.bundle.js",         // from build
        paths.dist + "app.bundle.js",             // from build
        paths.dist + "fonts/**",
        paths.dist + "public/home-pro-left.png",
        paths.dist + "public/home-pro-right.png",
        paths.dist + "public/avatar1.png",
      ], function () { gulp.start('manifest'); });
      $.watch(paths.app + './preprocess.js', function () { gulp.start('preprocess'); });
      browserify(true)
        .on('end', function () {
          done();
        });
    }
  );
});


gulp.task('default', ['build']);
gulp.task('build', [], function (done) {
  runSequence(
    'sass-copy-ionicons-to-ionic-ionicons',
    ['sass-v2', 'html', 'templates', 'preprocess', 'scripts', 'font', 'public', 'app-loader'],
    function () {
      browserify(false)
        .on('end', function () {
          runSequence('manifest', 'buster', function () {
            done();
          });
        });
    }
  );
});


gulp.task('app-loader', function () {
  return gulp.src([
    paths.app + 'loader/*.js'
  ])
    .pipe(gulp.dest(paths.dist));
});

gulp.task('manifest', function () {
  return gulp.src([
    paths.dist + "app.css",                   // from sass
    paths.dist + "vendors.bundle.js",         // from build
    paths.dist + "app.bundle.js",             // from build
    paths.dist + "fonts/**",
    paths.dist + "public/home-pro-left.png",
    paths.dist + "public/home-pro-right.png",
    paths.dist + "public/avatar1.png",
  ], {
      base: paths.dist
    })
    .pipe($.cordovaAppLoaderManifest()) // version missing, root might need to be strip
    .pipe(gulp.dest(paths.dist));
});


gulp.task('www', function () {
  gulp.src(paths.app + 'loader/index.html')
    .pipe($.preprocess({
      context: {
        staticBaseUrl: config.staticBaseUrl,
      }
    }))
    .pipe(gulp.dest(paths.cordova));
  return gulp.src([
    paths.dist + '**/*',
    '!' + paths.dist + 'index.html',
    '!' + paths.dist + '**/*.map'
  ])
    .pipe(gulp.dest(paths.cordova));
});

var eslint = require('ionic-gulp-eslint');

gulp.task('lint', function () {
  var app_js = [
    paths.app + 'js/**/*.js',
    '!**/build/**/*.js'
  ];
  return lint(app_js);
});
var lint = function (src) {
  return eslint({
    src: src
  });
};

var browserify = function (watch) {
  buildBrowserify = buildBrowserify || require('ionic-gulp-browserify-es2015');
  return buildBrowserify({
    watch: watch,
    src: paths.app + 'js/app.js',
    outputPath: paths.dist,
    minify: isRelease,
    sourceType: 'module',
    es5: true,
    browserifyOptions: {
      debug: true // sourcemaps option
    },
    uglifyOptions: {
      mangle: false
    },
    babelifyOptions: {
      plugins: []
    }
  });
};


gulp.task('buster', function (done) {
  if (isRelease) {
    gulp.src(paths.dist + 'index.html')
      .pipe($.revAppend())
      .pipe(gulp.dest(paths.dist))
      .on('end', done);
  } else {
    done();
  }
});


gulp.task('sentry:create', ['read_git_v'], function (done) {
  if (!sentryRelease) {
    return done();
  }
  return gulp.src(paths.sentrySrc, { base: paths.dist })
    .pipe(sentryRelease.createVersion(git_version_str));
});

gulp.task('sentry:release', ['sentry:create'], function (done) {
  if (!sentryRelease) {
    gutil.log(gutil.colors.magenta(
      'Failed to release sentry version due to settings'
    ));
    return done();
  }
  return gulp.src(paths.sentrySrc, { base: paths.dist })
    .pipe(sentryRelease.release(git_version_str));
});

gulp.task('postBuild', function () {
  // runSequence('sentry:release');

  // FIXME: del it only after sentry uploaded
  del('build/dist/*.map');
});

gulp.task('sentry:delete', ['read_git_v'], function (done) {
  if (!sentryRelease) {
    return done();
  }
  return gulp.src(paths.sentrySrc, { base: paths.dist })
    .pipe(sentryRelease.deleteVersion(git_version_str));
});

var git_version_str;
gulp.task('read_git_v', function (done) {
  readGitCommit(function (git_v) {
    git_version_str = git_v;
    done();
  })
});

function readGitCommit(callback) {
  git.long(function (str) {
    var git_available = !!str;
    if (git_available) {
      callback(str);
    } else {
      gutil.log(gutil.colors.magenta(
        'Failed read git version, might lack git env, fallback to local config'
      ));
      callback(sentry.version);
    }
  })
}
