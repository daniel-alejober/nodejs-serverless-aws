import jwt from "jsonwebtoken";

const generatedJWT = (dataJWT) => {
  return jwt.sign(dataJWT, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export default generatedJWT;
