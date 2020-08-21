export default class AppService {
  constructor(req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
  }
}
