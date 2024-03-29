const express = require("express");
const { user } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const login = async (req, res, next) => {
  const { email, mot_de_passe } = req.body;
 

  const userFound = await user.findOne({ where: { email: email } });

  if (!userFound) {
    return res.status(404).json({ message: "utilisateur n'existe pas" });
  }


// how to compare the password with the Bcrypt in java 
              

  const validPassword = await bcrypt.compare(
    mot_de_passe,
    userFound.mot_de_passe
  );
  if (!validPassword) {
    return res.status(404).json({ message: "mot de passe incorrect" });
  }
  const token = jwt.sign(
    { id: userFound.id, nom: userFound.nom, role: userFound.role },
    "secret",
    {
      expiresIn: 86400, // 24 hours
    }
  );
  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 week in milliseconds
  });

  const claims = jwt.verify(token, "secret");
  const x = claims.role;
  res.status(200).json({ message: "utilisateur connecte avec succes", x });
};

const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "utilisateur deconnecte avec succes" });
};
const getUser = async (req, res, next) => {

  try {
  const cookie = req.cookies['jwt'];
  const claims = jwt.verify(cookie, 'secret');
  if (!claims) {
      return res.status(401).json({message: "utilisateur non connecte"})
  }
  const userr = await user.findOne({where: {id: claims.id}});
  const {mot_de_passe, ...data} = await userr.toJSON();
  res.send(data);
}catch(err){
  return res.status(401).json({message: "utilisateur non connecte"})
}
next
};
module.exports = {
  login,
  logout,
  getUser
};
