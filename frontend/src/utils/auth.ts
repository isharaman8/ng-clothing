export const getBearerToken = (obj: any) => {
	return `Bearer ${obj.auth_token}`;
};
