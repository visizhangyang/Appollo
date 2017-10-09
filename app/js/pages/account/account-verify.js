/* eslint-disable */
function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = decodeURI(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], {type:mimeString});
}
/* eslint-enable */

class AccountVerifyCtrl {
  static get $inject() {
    return [
      '$timeout', '$log', 'StateService', 'UserModel',
      'isRelease',
    ];
  }
  constructor(
    $timeout, $log, StateService, UserModel,
    isRelease
  ) {
    this.$timeout = $timeout;
    this.$log = $log;
    $log.debug('AccountVerify: enter');
    this.StateService = StateService;
    this.UserModel = UserModel;
    this.verify = {};
    if (!isRelease) {
      this.verify.file = dataURItoBlob(
        'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
      );
      this.verify.filename = 'test-placeholder';
    }
  }

  onSelected(file) {
    // resize the file
    this.$log.debug('AccountVerifyCtrl:: got a file size(kb)', file.size / 1024);
    this.verify.filename = file.name;

    // larger than 50KB
    if (file.size > 50 * 1024) {
      this.saveResizeImage(file);
    } else {
      this.verify.file = file;
    }
  }

  saveResizeImage(file) {
    const reader = new FileReader();
    const canvas = document.createElement('canvas');

    reader.onload = (e) => {
      const dataURL = e.target.result;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const vhRatio = img.height / img.width;
        canvas.width = 800;
        canvas.height = canvas.width * vhRatio;
        ctx.drawImage(img,
          0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL(file.type, 0.8);
        const blob = dataURItoBlob(dataUrl);
        this.$log.debug('AccountVerifyCtrl:: after resize size(kb)', blob.size / 1024);

        this.$timeout(() => {
          this.verify.file = blob;
          this.verify.filename = file.name;
        }, 0);
      };
      img.src = dataURL;
    };

    reader.readAsDataURL(file);
  }

  postVerify() {
    const formData = new FormData();
    formData.append('image', this.verify.file, this.verify.filename);

    const postPromise = this.UserModel.postNameCard(formData);
    postPromise
      .then(() => {
        this.StateService.doneTo('accountVerifyDone');
      }, (error) => {
        this.$log.log('submit error', error);
      });
    return postPromise;
  }
}

const state = {
  name: 'accountVerify',
  options: {
    url: '/account/verify',
    controller: AccountVerifyCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/account/account-verify.html',
  },
};

export default state;

