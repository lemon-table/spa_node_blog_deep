const express = require("express");
const app = express();
const userRouter = require("./routes/user.router.js");
const productsRouter = require("./routes/products.router.js");

app.use("/api", express.json(), express.urlencoded({ extended: false }), [userRouter, productsRouter]);
app.use(express.static("assets"));

app.listen(8080, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});
