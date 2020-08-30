export default class AppController {
  static handleError(error, req, res, next) {
    try {
      const { status, err } = JSON.parse(error.message);
      return res.status(status).json({ error: err });
    } catch (e) {
      return next(error.message);
    }
  }
}
