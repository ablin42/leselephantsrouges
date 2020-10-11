const nodemailer = require("nodemailer");
require("dotenv/config");

module.exports = async function sendValidationMail(email, subject, text, url = `${process.env.BASEURL}`) {
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.SERVER_EMAIL,
			pass: process.env.SERVER_EMAILPW
		}
	});

	let mailOptions = {
		from: process.env.SERVER_EMAIL,
		to: email,
		subject: subject,
		text: text
	};

	//if (email !== process.env.EMAIL) {
	//    mailOptions.html = "";

	transporter.sendMail(mailOptions, err => {
		if (err) {
			console.log("MAILING ERROR:", err, mailOptions.to, mailOptions.subject);
			return true;
		} else console.log("MAIL SENT SUCCESSFULLY");
	});

	return false;
};
