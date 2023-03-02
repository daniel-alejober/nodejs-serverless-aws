import { dynamoDbClient } from "../db.js";
import {
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import currentDate from "../currentDate.js";
import { v4 as uuidv4 } from "uuid";

const createComment = async (req, res) => {
  const { title, comment } = req.body;

  try {
    const params = {
      TableName: process.env.AWS_TABLE_COMMENTS,
      Item: {
        commentId: uuidv4(),
        userId: req.id,
        title,
        comment,
        createAt: currentDate(),
        updateAt: currentDate(),
      },
    };
    await dynamoDbClient.send(new PutCommand(params));
    res.status(200).json({ success: true, message: "Comment created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create comment" });
  }
};

const commentsByUser = async (req, res) => {
  const userId = req.id;
  try {
    const { Items } = await dynamoDbClient.send(
      new ScanCommand({
        TableName: process.env.AWS_TABLE_COMMENTS,
      })
    );
    const commentsUser = Items.filter((comments) => comments.userId === userId);
    if (commentsUser.length === 0) {
      const error = new Error("This user has no comments yet!");
      return res.status(400).json({ message: error.message });
    }
    res.status(200).json(commentsUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error in server" });
  }
};

const getAllComents = async (req, res) => {
  try {
    const { Items } = await dynamoDbClient.send(
      new ScanCommand({
        TableName: process.env.AWS_TABLE_COMMENTS,
      })
    );
    res.status(200).json({ comments: Items });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error in server" });
  }
};

const getComment = async (req, res) => {
  try {
    const params = {
      TableName: process.env.AWS_TABLE_COMMENTS,
      Key: { commentId: req.params.commentId },
    };
    const { Item } = await dynamoDbClient.send(new GetCommand(params));
    res.status(200).json({ comment: Item });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error in server" });
  }
};

const updateComment = async (req, res) => {
  try {
    const paramsgetComment = {
      TableName: process.env.AWS_TABLE_COMMENTS,
      Key: { commentId: req.params.commentId },
    };
    const { Item } = await dynamoDbClient.send(
      new GetCommand(paramsgetComment)
    );
    if (!Item) {
      const error = new Error("This comment doesnt´exist");
      return res.status(400).json({ message: error.message });
    }

    const params = {
      TableName: process.env.AWS_TABLE_COMMENTS,
      Key: { commentId: req.params.commentId },
      UpdateExpression: "set #t=:title, #c=:comment, #u=:updateAt",
      ExpressionAttributeNames: {
        "#t": "title",
        "#c": "comment",
        "#u": "updateAt",
      },
      ExpressionAttributeValues: {
        ":title": req.body.title ? req.body.title : Item.title,
        ":comment": req.body.comment ? req.body.comment : Item.comment,
        ":updateAt": currentDate(),
      },
      ReturnValues: "ALL_NEW",
    };
    const { Attributes } = await dynamoDbClient.send(new UpdateCommand(params));
    res.status(200).json({ comment: Attributes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error in server" });
  }
};
const deleteComment = async (req, res) => {
  try {
    const params = {
      TableName: process.env.AWS_TABLE_COMMENTS,
      Key: { commentId: req.params.commentId },
    };
    await dynamoDbClient.send(new DeleteCommand(params));
    res.status(200).json({ message: "Comment deleted", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error in server" });
  }
};

export {
  createComment,
  commentsByUser,
  getComment,
  getAllComents,
  updateComment,
  deleteComment,
};
