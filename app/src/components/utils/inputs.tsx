import { typeGuardInput } from "./typeGuards";

const MAX_SIZE = 25000000;
const FILE_EXT = ["png", "jpg", "jpeg", "gif"];

export function checkFile(file: File | null) {
	if (!file) return "Aucun fichier détecté";
	let isAllowedExt = FILE_EXT.includes(file!.name.split(".")[1].toLowerCase());
	if (!isAllowedExt) return 'Extension de fichier non autorisée (["png", "jpg", "jpeg", "gif"])';
	if (MAX_SIZE < file!.size) return "Fichier trop volumineux (> 25 MB)";
}

export function checkFiles(files: FileList) {
	if (!files) {
		console.log("abort form submission and display error");
	}

	const dt = new DataTransfer();
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		let isAllowedExt = FILE_EXT.includes(files[i].name.split(".")[1].toLowerCase());
		if (isAllowedExt && MAX_SIZE > files[i].size) dt.items.add(file);
	}

	return dt.files;
}

export async function handleInput(
	e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
	formData: any,
	formSetter: Function
) {
	let target = e.target;
	let value: string | boolean = target.value.trim();
	if (typeGuardInput(e) && target.type === "checkbox") value = e.target.checked;
	const name = target.name;

	formSetter({
		...formData,
		[name]: value
	});
}
