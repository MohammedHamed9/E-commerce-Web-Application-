const nodemailer = require("nodemailer");
const dotenv=require('dotenv')
dotenv.config()
const transporter=nodemailer.createTransport({
  service:'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const EmailCtrl={
  sendrestPassEmail: async(subject,restUrl,user)=>{
    try {
      const name=user.name.split(' ')[0];
      const mailOptions={
        from:{name:'e-commerce app',address:process.env.EMAIL_USER},
        to:user.email,
        subject:subject,
        html:`<b>Hi ${name} ,<br>
        Forgot your password? 
        Submit a PATCH request with your new password to:<br> ${restUrl}<br>
        If you didn't forget your password, please ignore this email!<br>
        thank you.
</b>`
      }
      await transporter.sendMail(mailOptions)
    } catch (error) {
      console.log(error);
    } 
    
  },
  sendVerificationCode:async(email,code)=>{
    try {
      const mailOptions={
        from:{name:'e-commerce app',address:process.env.EMAIL_USER},
        to:email,
        subject:"the Verification of the email",
        html:`here is your verification code: <b>${code}</b>`,
      }
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports=EmailCtrl;