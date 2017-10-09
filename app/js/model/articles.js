export default class ArticlesModel {
  constructor() {
    this.articles = {
      'flight-gift': {
        title: '首单福利',
        templateUrl: 'pages/articles/_flight-gift.html',
        imgBg: 'url("public/banner-flight.jpg")',
      },
      'cash-gift': {
        title: '千元奖金',
        templateUrl: 'pages/articles/_cash-gift.html',
        imgBg: 'url("public/banner-cash.jpg")',
        headerImg: 'url("public/article-cash.png")',
      },
      features: {
        title: '平台优势',
        templateUrl: 'pages/articles/_features.html',
      },
      weekly_products: {
        title: '每周热销',
        templateUrl: 'pages/articles/_weekly-products.html',
      },
    };
  }

  getBanners() {
    const banners = [
      'cash-gift',
      'flight-gift',
    ];
    return banners.map((slug) => {
      const article = this.articles[slug];
      return {
        imgBg: article.imgBg,
        articleSlug: slug,
      };
    });
  }
}
