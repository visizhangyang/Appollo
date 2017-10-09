#Requirements

1. Node.js^7.2.1
    - brew install node (for mac), sudo apt-get install npm (for linux)
    - curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash
    - source ~/.bashrc
    - nvm install 7.2.1
    
2. Few npm packages globally
    - npm install -g cnpm (for npm install replacement speeding build process)
    - ionic (for none production developer concern only)
    
            :::bash
            cnpm install -g ionic@beta

3. gulp
        :::bash
        npm install -g gulp

4. cordova
        :::bash
        npm install -g cordova

5. Install Xcode8.2

## Getting started

### Download Source Code
    :::bash
    git clone git@bitbucket.org:micai/hnwi_app.git

### Deploy

setup local.config.json:

1. `raven`: sentry's client token for report event 
2. `staticBaseUrl`: the url of static files serves, eg. index.html, app.js, manifest.json ...
3. `apiBaseUrl`: api url root
4. `sentry`: for sentry web api action options, eg. create version, upload sourcemaps files [gulp-sentry-release-options](https://www.npmjs.com/package/gulp-sentry-release)


```bash

  # For update bundle js, css relate files in server
  npm run build
  # it will compile files to build directory

  # If you are not update config.xml, cordova plugins, you could ignore the following updates
  # For update new cordova container (require build command in above)
  # step 1. setup the same source into cordova container
  gulp www
  
  # step 2. copy the file to local machine for XCODE use, run the command in local app directory
  scp -r YOURUSERNAME@unicorn:/home/mcops/hnwi_app/www ./www
  or ionic build ios

  # step 3.(if your ionic-cli >= 2.1.0), restore cordova env like plugins ... 
  ionic state restore
  
  # step 4. in XCODE, directly open the project in ./platforms/ios directory 
  #         - setup bundle ID match with iTunes connect app
  #         - setup version number, in format a.b.c. The first integer represents a major revision, the second a minor revision, and the third a maintenance release.
  #         - setup build string, update it before upload to iTunes connect
  
  # step 5. in XCODE archive => validate => upload to app store
  
   
```

More info about configure XCODE:

1. [config xcode project](https://developer.apple.com/library/ios/documentation/IDEs/Conceptual/AppDistributionGuide/ConfiguringYourApp/ConfiguringYourApp.html)
2. [upload to iTunes connect](https://developer.apple.com/library/ios/documentation/IDEs/Conceptual/AppDistributionGuide/UploadingYourApptoiTunesConnect/UploadingYourApptoiTunesConnect.html)
3. On project -> TARGETS -> General -> Signing, make sure "Automatically manage siging" is checked.
For Team, select "Beijing MICAI Investment Consulting Co Ltd"
4. On project -> TARGETS -> Build Settings -> Code sign identity, select "iOS Developer" for all choices.


## local development

Mainly use ionic cli to serve the content and fast live-reload, the options are inside `ionic.config.json`.
furthermore, it can combine some pre-defined hooks with gulp task in the format `gulp.task('serve:before', ['watch']);`

common commands for development

```bash

  # to trigger build files update if source files changed
  gulp watch
  
  # run app in IOS emulator
  ionic emulate ios  # this will trigger gulp task `www` to copy bundle js,css files
  
  # or with live reload if build files changes
  ionic emulate -l ios # anything change in watchPatterns (build files), will update it immediatelly
  
  # another options of reload is use cordova-app-loader, enter command+shift+h to home screen and enter app again
  #  and you will see the popup confirming the downloading update
  
  # or run app in browser (please do development against emulator if there is no special reason)
  ionic serve # or its alias `npm start`
  
```

```
Another way to install and start ionic if the above failed:

npm install yarn -g
yarn install
yarn global add cordova ionic
npm run build
gulp watch
ionic serve -d
```


## About cordova-app-loader (remote update app without app store submission)

[cordova-app-loader](https://github.com/markmarijnissen/cordova-app-loader)

The update dialog will trigged on first time lunch, `resume` event happend

The app will compare manifest.json from local and remote, to check whether there is update required,
 and to check which files to load.
 
Our gulp will update the manifest.json whenever there is build done.

To have the first version build files included in cordova container will speedup the first time experience,
 that is one of the reason we are copying the files via ssh to local machine cordova build
 
 
## About TestFlight

[TestFlight beta testing](https://developer.apple.com/library/ios/documentation/LanguagesUtilities/Conceptual/iTunesConnect_Guide/Chapters/BetaTestingTheApp.html)

## About Wechat Share

Wechat Share can be used in an APP, or in Wechat, can not be used in a browser
such as Chrome or Safari

### Share in a APP
1.  Apply a developer account on https://open.weixin.qq.com/
2.  Add cordova-plugin-wechat plugin. To do this, add a dependency to cordovaPlugins section
    in Package.json, below is the code
    ```bash
    
        {
            "variables": {
                "wechatappid": "wx36b355588c18fa93"
            },
            "locator": "https://github.com/bjmicai/cordova-plugin-wechat",
            "id": "cordova-plugin-wechat"
        }

    Notes: the official url of this plugin is https://github.com/xu-li/cordova-plugin-wechat,
    in the code we use micai fork: https://github.com/bjmicai/cordova-plugin-wechat,
    because micai fork supports file exension when sharing a file.
    
3.  Implement Wechat APIs, such as isInstalled, shareToSession, shareToTimeline, shareToFavorite.
    More detail, please refer the code at /app/js/factory/wechat.js.
4.  Call the APIs. In /app/js/pages/crm/book-list.js, shareToSession is called to share a
    pdf file to a friend.
    
### Share in Wechat

From the Wechat JS-SDK official web site, the API supports sharing music, video
or link. Sharing a file has not been found on the official web site.