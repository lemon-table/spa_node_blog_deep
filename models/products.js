"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Products.init(
    {
      id: {
        type: DataTypes.INTEGER, // int 타입으로 변경
        primaryKey: true, // 주요 키로 설정
        autoIncrement: true // 자동 증가 설정
      },
      userId: DataTypes.STRING,
      title: DataTypes.STRING,
      content: DataTypes.STRING,
      author: DataTypes.STRING,
      password: DataTypes.STRING,
      status: DataTypes.STRING,
      createdAt: DataTypes.DATE
    },
    {
      sequelize,
      modelName: "Products"
    }
  );
  return Products;
};
