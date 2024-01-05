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

	console.log('ID', id);
	console.log('SECTION', section);
	console.log('VALUE', _.includes(id, section) ? 'active' : '');

	return _.includes(id, section) ? 'active' : '';
};

export const CssMethods = { getActiveClass };
