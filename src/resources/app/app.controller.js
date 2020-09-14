export default class AppController {
  static handleError(error, req, res, next) {
    try {
      const { status, err, errorCode } = JSON.parse(error.message);
      return res.status(status).json({ error: err, errorCode });
    } catch (e) {
      return next(error.message);
    }
  }
}
