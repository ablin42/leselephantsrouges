export function typeGuardInput(
	toBeDetermined: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
): toBeDetermined is React.ChangeEvent<HTMLInputElement> {
	if ((toBeDetermined as React.ChangeEvent<HTMLInputElement>).type) {
		return true;
	}
	return false;
}
