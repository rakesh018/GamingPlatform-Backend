const transporter = require("../../../configs/mailTransporter");

let mailOptions = {
  from: "Admin",
  to: "rakeshbodapatla18@gmail.com",
  subject: "testing admin functionality",
  text: "hello from admin",
  html: "<b>Hello user!</b>",
};

//send mail
const sendMail = async (req, res) => {
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    }
    console.log(info);
    if(info){
        res.json(200).json({message:'email sent'})
    }
  });
  
};

module.exports = sendMail;
