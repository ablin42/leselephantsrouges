declare module "flash";
declare module "express-sanitizer";
declare module "express-rate-limit";
declare module "rate-limit-mongo";
declare module "parse-error";

interface Session {
	formData?: object;
	_id?: string;
}

interface UserType {
	_id: _string;
	role: string;
	email: string;
	password: string;
	isVerfied: Boolean;
	date: Date;
	createdAt: Date;
	updatedAt: string;
	__v: number;
}

interface VideoType {
	_id: _string;
	url: string;
	title: string;
	description: string;
	isFiction: Boolean;
	authors: Array<string>;
	date: Date;
	createdAt: Date;
	updatedAt: string;
	mainImg?: string;
	__v: number;
}

interface EventType {
	_id: string;
	url?: string;
	address?: string;
	price?: string;
	title: string;
	description: string;
	staff?: Array<string>;
	eventStart?: Date;
	eventEnd?: Date;
	date: Date;
	createdAt: Date;
	updatedAt: Date;
	mainImg?: string;
	__v: number;
}

namespace Express {
	interface Request {
		session?: Session;
		user?: UserType;
		video?: VideoType;
		event?: EventType;
	}
}
