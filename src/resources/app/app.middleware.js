export default class AppMiddleware {
  static validateImageUpload(req, res, next) {
    if (req.files) {
      if (Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: 'no images were uploaded' });
      }
      const allowedFormats = ['image/jpeg', 'image/png'];

      const { image } = req.files;
      if (!image) {
        return res.status(400).json({
          error:
            'missing field "image". Image file must be uploaded as field "image"',
        });
      }
      const IMAGE_SIZE_LIMIT = 3000000;
      if (image.size > IMAGE_SIZE_LIMIT) {
        return res.status(400).json({
          error: `cannot upload image greater than ${(
            IMAGE_SIZE_LIMIT / 1000
          ).toString()}KB in size`,
        });
      }
      if (!allowedFormats.includes(image.mimetype)) {
        return res
          .status(415)
          .json({ error: 'image format must be jpeg or png' });
      }
    }
    return next();
  }
}
