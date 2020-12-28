/// <reference types='codeceptjs' />
type steps_file = typeof import('./testing/steps/steps_file.js');
type MainPage = typeof import('./testing/pages/Main.js');
type CommonPage = typeof import('./testing/pages/Common.js');
type DbHelper = import('./testing/helpers/dbHelper.js');
type ResembleHelper = import('codeceptjs-resemblehelper');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any, MainPage: MainPage, CommonPage: CommonPage }
  interface Methods extends Puppeteer, DbHelper, ResembleHelper {}
  interface I extends ReturnType<steps_file>, WithTranslation<DbHelper>, WithTranslation<ResembleHelper> {}
  namespace Translation {
    interface Actions {}
  }
}
