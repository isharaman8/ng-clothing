export const getUrl = (code: string): string => {
	if (code === 'home') {
		return '/';
	}

	return `/${code}`;
};
