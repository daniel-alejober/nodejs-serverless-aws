import { dynamoDbClient } from "../db.js";
import generatedJWT from "../jwt/generatedJWT.js";
import currentDate from "../currentDate.js";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const { Items } = await dynamoDbClient.send(
      new ScanCommand({
        TableName: process.env.AWS_TABLE,
      })
    );

    const userExist = Items.some((user) => user.email === email);
    if (userExist) {
      const error = new Error("This user is already exist");
      return res.status(400).json({ message: error.message });
    }

    const salt = bcrypt.genSaltSync(10);
    const newPassword = bcrypt.hashSync(password, salt);

    const params = {
      TableName: process.env.AWS_TABLE,
      Item: {
        userId: uuidv4(),
        name,
        email,
        password: newPassword,
        createAt: currentDate(),
      },
    };
    await dynamoDbClient.send(new PutCommand(params));
    res.status(200).json({ success: true, message: "User created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create user" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { Items } = await dynamoDbClient.send(
      new ScanCommand({
        TableName: process.env.AWS_TABLE,
      })
    );
    res.status(200).json(Items);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error in server" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { Items } = await dynamoDbClient.send(
      new ScanCommand({
        TableName: process.env.AWS_TABLE,
      })
    );
    const user = Items.filter((user) => user.email === req.body.email);
    if (user.length === 0) {
      const error = new Error("This user doesn´t exist");
      return res.status(400).json({ message: error.message });
    }

    const confirmPassword = bcrypt.compareSync(
      req.body.password,
      user[0].password
    );

    if (!confirmPassword) {
      const error = new Error("This password is wrong");
      return res.status(400).json({ message: error.message });
    }

    const token = generatedJWT({ id: user[0].userId, name: user[0].name });

    const { password, ...others } = user[0];
    res
      .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .json({ user: others });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error in server" });
  }
};

const logoutUser = (req, res) => {
  try {
    if (req.id) {
      res.clearCookie("access_token", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.status(200).json({ success: true, message: "Cookie Clear" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error in server" });
  }
};

export { createUser, getAllUsers, loginUser, logoutUser };
