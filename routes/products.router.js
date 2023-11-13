const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

//인증결과
const authMiddleware = require("../middlewares/auth-middleware.js");

const { Products } = require("../models");
const { User } = require("../models");

router.get("/", (req, res) => {
  res.send("내배캠 장터");
});

// 상품 목록 조회
router.get("/products", async (req, res) => {
  const { sort } = req.query;
  let sortOption = ["createdAt", "DESC"]; //default 최신순
  sortOption = sort && sort.toUpperCase() === "ASC" ? [["createdAt", "ASC"]] : [["createdAt", "DESC"]];

  try {
    const user = await User.findAll({});
    const userList = user.map((item) => ({
      id: item.id,
      nickname: item.nickname
    }));

    const attributes = ["id"];

    const productList = await Products.findAll({
      order: sortOption // Query String에 따라 대문자로 받아 정렬 방식 변경
    });

    // 이후 데이터 가공 및 반환
    const resultList = productList.map((item) => ({
      id: item.id,
      userId: item.userId,
      title: item.title,
      content: item.content,
      nickname: item.author,
      status: item.status,
      createdAt: item.createdAt
    }));

    // resultArray의 각 요소에 대해 반복
    resultList.forEach((item) => {
      // userList에서 userId와 일치하는 id를 가진 사용자 찾기
      const user = userList.find((user) => user.id === Number(item.userId));

      // userList에서 찾은 사용자의 nickname을 resultList nickname으로 추가
      if (user) {
        item.nickname = user.nickname;
      }

      // userId 속성 삭제
      delete item.userId;
    });

    res.json({
      success: true,
      message: "상품 목록 조회되었습니다.",
      data: resultList
    });
  } catch (error) {
    res.status(500).send({
      sucess: false,
      errerMessage: error
    });
  }
});

// 상품 상세 목록 조회 (상품ID로 조회)
router.get("/products/:Id", async (req, res) => {
  const { Id } = req.params;

  try {
    const users = await User.findAll({});
    const userList = users.map((item) => ({
      id: item.id,
      nickname: item.nickname
    }));
    const existsProducts = await Products.findOne({ where: { id: Id } });

    const user = userList.find((user) => user.id === Number(existsProducts.userId));

    const resultList = {
      id: existsProducts.id,
      title: existsProducts.title,
      content: existsProducts.content,
      nickname: user.nickname,
      status: existsProducts.status,
      createdAt: existsProducts.createdAt
    };

    if (!Id.length) {
      return res.status(406).json({
        success: false,
        errorMessage: "데이터 형식이 올바르지 않습니다."
      });
    }

    if (resultList !== null) {
      return res.json({
        success: true,
        message: "상품 상세정보 조회되었습니다.",
        data: {
          resultList
        }
      });
    } else {
      return res.status(407).json({
        success: false,
        errorMessage: "상품 조회에 실패하였습니다."
      });
    }
  } catch (error) {
    res.status(500).send({
      sucess: false,
      errerMessage: error
    });
  }
});

// 상품 등록
router.post("/products", authMiddleware, async (req, res) => {
  const { title, content, author, password } = req.body;

  // 상품 입력을 위한 id, 시간 가져오기
  const status = "FOR_SALE";
  const userId = res.locals.user.id;

  try {
    if (userId.length === 0) {
      return res.status(408).json({
        success: false,
        errorMessage: "사용자ID 조회에 실패하였습니다."
      });
    }

    let createdAt = new Date();

    const createdProducts = await Products.create({ userId, title, content, author, password, status, createdAt });
    res.json({
      success: true,
      message: "상품 등록되었습니다.",
      products: createdProducts
    });
  } catch (error) {
    res.status(500).send({
      sucess: false,
      errerMessage: error
    });
  }
});

// 상품 수정
router.put("/products/:Id", authMiddleware, async (req, res) => {
  const { Id } = req.params;
  const { title, content, status, userId } = req.body;
  const existsProducts = await Products.findOne({ where: { id: Id } });
  const userIdCHhk = res.locals.user.id;

  try {
    //productId 공백 확인
    if (existsProducts === null) {
      let errMsg = "데이터 형식이 올바르지 않습니다.";
      let errNum = 406;

      if (Id.length > 0) {
        errMsg = "사용자ID 조회에 실패하였습니다.";
        errNum = 408;
      }

      return res.status(errNum).json({
        success: false,
        errorMessage: errMsg
      });
    }

    //
    if (status !== "FOR_SALE" && status !== "SOLD_OUT") {
      return res.status(409).json({
        success: false,
        errorMessage: "상품의 상태는 FOR_SALE, SOLD_OUT만 기입 가능합니다."
      });
    }

    // 사용자iD 일치여부
    if (userId === userIdCHhk) {
      await Products.update(
        { title, content, status },
        {
          where: { id: Id }
        }
      );

      return res.status(200).json({
        success: true,
        message: "상품 정보를 수정했습니다."
      });
    } else {
      return res.status(410).json({
        success: false,
        errorMessage: "상품을 수정할 권한이 없습니다."
      });
    }
  } catch (error) {
    res.status(500).send({
      sucess: false,
      errerMessage: error
    });
  }
});

// 상품 삭제
router.delete("/products/:Id", authMiddleware, async (req, res) => {
  const { Id } = req.params;
  const { userId } = req.body;
  const existsProducts = await Products.findOne({ where: { id: Id } });
  const userIdCHhk = res.locals.user.id;

  try {
    //productId 공백 확인
    if (existsProducts === null) {
      let errMsg = "데이터 형식이 올바르지 않습니다.";
      let errNum = 406;

      if (Id.length > 0) {
        errMsg = "사용자ID 조회에 실패하였습니다.";
        errNum = 408;
      }

      return res.status(errNum).json({
        success: false,
        errorMessage: errMsg
      });
    }

    // 사용자ID 일치여부
    if (userId === userIdCHhk) {
      // 삭제 진행
      await Products.destroy({ where: { id: Id } });

      return res.status(200).json({
        success: true,
        message: "상품을 삭제했습니다."
      });
    } else {
      return res.status(410).json({
        success: false,
        errorMessage: "상품을 수정할 권한이 없습니다."
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      errorMessage: error
    });
  }
});

module.exports = router;
