let nodemailer = require("nodemailer");
module.exports.emailVerify = async (options) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mohamed142000nasser@gmail.com", // generated ethereal user
      pass: "clbfuxvuejgvaiir", // generated ethereal password
    },
  });

  await transporter.sendMail(
    {
      from: '"Mohamed Nasser 👻" <mohamed142000nasser@gmail.com>', // sender address
      to: options.email, // list of receivers
      subject: " Hello", // Subject line
      html: `
      <div style = "background:red; color:white;padding:20px"> 
      <h1>${options.message}</h1>
      <img/ src = 'https://imgv3.fotor.com/images/homepage-feature-card/Fotor-AI-photo-enhancement-tool.jpg'>
      <a href = "http://localhost:3000/user/verify/${options.token}">verify<a>
      </div>
    `, // html body
    },
    (err, info) => {
      if (err) {
        console, log(err);
      } else {
        console.log(info);
      }
    }
  );
};
