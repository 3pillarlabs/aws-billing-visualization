import { NewAwsBillingPage } from './app.po';

describe('new-aws-billing App', function() {
  let page: NewAwsBillingPage;

  beforeEach(() => {
    page = new NewAwsBillingPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
