import db from '../../src/database/models';

class AppTestHelper {
  async resetDB(modelsArr) {
    if (modelsArr) {
      if (modelsArr && !Array.isArray(modelsArr)) {
        throw new Error(
          '"resetDB" expects an optional array of models as argument'
        );
      }
      for (let i = 0; i < modelsArr.length; i++) {
        await modelsArr[i].destroy({ where: {}, truncate: { cascade: true } });
      }
    } else {
      await db.User.destroy({ where: {}, truncate: { cascade: true } });
      await db.Role.destroy({ where: {}, truncate: { cascade: true } });
    }
  }
}

export default AppTestHelper;
