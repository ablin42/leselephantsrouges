export function addAlert(alert: { alertType: string; content: string }, where: string) {
	let node = document.createElement("div"),
		alertDiv = document.getElementById("alert");
	let whereDOM = document.querySelector(where);

	node.setAttribute("id", "alert");
	node.setAttribute("class", `alert alert-${alert.alertType}`);
	node.setAttribute("role", "alert");
	if (alertDiv) {
		alertDiv.remove();
	}
	node.innerHTML += alert.content;

	if (whereDOM) whereDOM.after(node);
}

export function createAlertNode(message: string, alertType: string = "info") {
	return {
		alertType: alertType,
		content: `<button onclick="dismissAlert(this)" type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>${message}`
	};
}
