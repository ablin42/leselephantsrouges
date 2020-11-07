"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv/config");
function mailer(email, subject, text, url = `${process.env.BASEURL}`) {
    return __awaiter(this, void 0, void 0, function* () {
        let transporter = nodemailer_1.default.createTransport({
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
            text: text,
            html: ""
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
        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.log("MAILING ERROR:", err, mailOptions.to, mailOptions.subject);
                return true;
            }
            else
                console.log("MAIL SENT SUCCESSFULLY");
        });
        return false;
    });
}
exports.default = mailer;
