const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const [authType, authToken] = (authorization || "").split(" ");
  if (!authToken || authType !== "Bearer") {
    res.status(400).send({
      sucess: false,
      errorMessage: "로그인 후 이용 가능한 기능입니다."
    });
    return;
  }

  try {
    const { userId } = jwt.verify(authToken, "customized-secret-key");
    User.findByPk(userId).then((user) => {
      if (!user) {
        res.status(400).send({
          sucess: false,
          errorMessage: "로그인 후 이용 가능한 기능입니다."
        });
        return;
      }
      res.locals.user = user;

      next();
    });
  } catch (err) {
    res.status(400).send({
      sucess: false,
      errorMessage: "로그인 후 이용 가능한 기능입니다."
    });
  }
};
