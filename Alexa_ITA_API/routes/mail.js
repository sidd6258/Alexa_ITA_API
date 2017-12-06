var nodemailer = require("nodemailer");

exports.sendmail=function(req,res){
    var mailOptions={
            to : "siddharth6258@gmail.com",
            subject : "How are you",
            text : "I'm good"
        }
        console.log(mailOptions);
        smtpTransport.sendMail(mailOptions, function(error, response){
         if(error){
                console.log(error);
            res.end("error");
         }else{
                console.log("Message sent: " + response.message);
            res.end("sent");
             }
    });
 };