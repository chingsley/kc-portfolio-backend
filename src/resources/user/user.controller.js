// import UserService from './user.services';

// export default class UserController {
//   static async registerUser(req, res, next) {
//     try {
//       const { email, username } = req.body;
//       let user = await UserService.findBy({ email });
//       if (user) {
//         return res.status(409).json({
//           error: `email ${email} already exists. Duplicate email is not allowed`,
//         });
//       }

//       user = await UserService.findBy({ username });
//       if (user) {
//         return res.status(409).json({
//           error: `username ${username} already exists. Please choose another username`,
//         });
//       }
//       // await UserService.rejectDuplicateEmail(req, res);
//       // await UserService.rejectDuplicateUsername(req, res);
//       // await UserService.addUser(req.body)
//     } catch (error) {
//       return next(error.message);
//     }
//   }
// }
