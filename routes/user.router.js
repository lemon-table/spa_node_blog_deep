const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// 이메일 형식 체크
function checkEmailFormat(email) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// 비밀번호를 해시화 하는 함수
function hashPassword(password) {
  // salt 생성
  const salt = crypto.randomBytes(16).toString("hex");
  // 해시 함수 생성
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");

  return { salt, hash };
}

// 비밀번호 확인 함수
function verifyPassword(password, hash, salt) {
  const hashVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash.toString("hex") === hashVerify.toString("hex");
}

//회원가입
const { User } = require("../models");

router.post("/users", async (req, res) => {
  const { email, nickname, password, confirmPassword } = req.body;

  // 비밀번호 해시화
  const { salt, hash } = hashPassword(password);
  const createdAt = new Date();

  try {
    // 비밀번호 확인 체크
    if (password !== confirmPassword) {
      res.status(401).send({
        sucess: false,
        errorMessage: "패스워드가 패스워드 확인란과 다릅니다."
      });
      return;
    }

    // 비밀번호 6자리 이상 체크
    if (password.length < 6) {
      res.status(402).send({
        sucess: false,
        errorMessage: "비밀번호는 6자리 이상 작성 바랍니다."
      });
      return;
    }

    const existsEmail = await User.findAll({
      where: {
        email
      }
    });

    // email 중복 체크
    if (existsEmail.length) {
      res.status(403).send({
        sucess: false,
        errorMessage: "이메일이 이미 사용중입니다."
      });
      return;
    }

    // 이메일 형식 체크
    if (!checkEmailFormat(email)) {
      res.status(404).send({
        sucess: false,
        errorMessage: "이메일 형식이 맞지 않습니다."
      });
      return;
    }

    // 계정 생성
    await User.create({ email, nickname, password: hash, salt, createdAt });
    res.status(201).send({
      sucess: true,
      message: "회원가입에 성공했습니다.",
      data: { email, nickname, createdAt }
    });
  } catch (error) {
    res.status(500).send({
      sucess: false,
      errerMessage: error
    });
  }
});

//로그인
router.post("/auth", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        email
      }
    });

    // 이메일, 비밀번호 확인
    const emailChk = user.email === email ? 1 : 0;
    const passwordChk = verifyPassword(password, user.password, user.salt);

    // NOTE: 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
    if (!user || !passwordChk || !emailChk) {
      res.status(405).send({
        sucess: false,
        errorMessage: "이메일 또는 패스워드가 틀렸습니다."
      });
      return;
    }

    res.send({
      sucess: true,
      token: jwt.sign({ userId: user.id }, "customized-secret-key", { expiresIn: "12h" }),
      user: res.locals.user
    });
  } catch (error) {
    res.status(500).send({
      sucess: false,
      errerMessage: error
    });
  }
});

module.exports = router;
