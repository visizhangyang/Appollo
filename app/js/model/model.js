import ProductModel from './product';
import UserModel from './user';
import OrderModel from './order';
import ArticlesModel from './articles';
import AccountModel from './account';
import ClientModel from './client';
import ClientKycModel from './clientKyc';
import PortfolioModel from './portfolio';
import EFModel from './ef';
import KYCModel from './kyc';

const moduleName = 'unicorn.model';

angular.module(moduleName, ['restangular'])
  .service('ClientKycModel', ClientKycModel)
  .service('KYCModel', KYCModel)
  .service('ArticlesModel', ArticlesModel)
  .service('UserModel', UserModel)
  .service('OrderModel', OrderModel)
  .service('AccountModel', AccountModel)
  .service('ClientModel', ClientModel)
  .service('ProductModel', ProductModel)
  .service('PortfolioModel', PortfolioModel)
  .service('EFModel', EFModel);

export default moduleName;
