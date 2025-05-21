import axios from "axios";

const api = axios.create({
	baseURL: "/api", // adjust if you're using a full backend domain
	headers: {
		"Content-Type": "application/json",
	},
});

export default api;
