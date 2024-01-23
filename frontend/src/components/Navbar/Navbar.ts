import _ from 'lodash';

export const getUrl = (code: string): string => {
	if (code === 'home') {
		return '/';
	}

	return `/${code}`;
};

// css related
const getActiveClass = (id: string, section: string) => {
	if (section === 'home' && id === '/') {
		return 'active';
	}

	return _.includes(id, section) ? 'active' : '';
};

export const CssMethods = { getActiveClass };
