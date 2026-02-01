import nodemailer from "nodemailer";
import "dotenv/config";

import jwt from "jsonwebtoken";

export const sendOtpEmail = async(otp, email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailConfigurations = {
    from: process.env.MAIL_USER,

    to: email,
    subject: "Password reset Otp",

    html: `<p> Your Otp For Password Reset is : <b>${otp}</b></p>`
  };

  transporter.sendMail(mailConfigurations, function (error, info) {
    if (error) throw Error(error);
    console.log("OTP Sent Successfully");
    console.log(info);
  });
};
