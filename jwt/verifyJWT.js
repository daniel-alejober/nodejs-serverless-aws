import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "You are not authenticated", success: false });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.id = decodedToken.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token", success: false });
  }
};

export default verifyJWT;
