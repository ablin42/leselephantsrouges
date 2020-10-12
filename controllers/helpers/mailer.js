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

	console.log(url);

	if (email !== process.env.EMAIL) {
		mailOptions.html = `
				<div  style="position: sticky; max-width: 1340px !important;
						margin: 1em auto;
						flex: 1;
						padding: 15px;
						width: 100%;
						margin: auto;">
					<div  style="text-align: center; background: #eeecec;
						height: auto;
						padding: 30px;
						position: relative;
						box-shadow: none;">
						<h1 style=" 
						color: #0a3d62;
						font-weight: bold;
						font-size: 55px;
						text-align: center
					">${subject}</h1>
						<div style="
						padding: 2rem 1rem;
						margin: auto;
						font-size: 22px;
						color: #142837;
						margin-bottom: 30px;" role="alert">
							${text}
						</div>
						<a href="${url}"  style="display: block;
						width: 100%;
						height: 50px;
						line-height: 50px;
						border: none;
						color: #44a2e6;
						outline: none;
						cursor: pointer;
						width: 50%;
						margin: auto;
						text-decoration: none;
						font-size: 50px;" >CLIQUEZ ICI!</a>
					</div>
				</div>
		`;
	}
	transporter.sendMail(mailOptions, err => {
		if (err) {
			console.log("MAILING ERROR:", err, mailOptions.to, mailOptions.subject);
			return true;
		} else console.log("MAIL SENT SUCCESSFULLY");
	});

	return false;
};
