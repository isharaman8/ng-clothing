export const ROUTES = Object.freeze({
	products: 'product',
	purchases: 'purchase',
	auth: 'auth',
	uploads: 's3',
	user: 'user'
});

export const defaultToastMessages = Object.freeze({
	login: {
		success: {
			title: 'Login Successful',
			description: 'Successfully logged in'
		},
		failure: {
			title: 'Login Failed'
		}
	},
	signup: {
		success: {
			title: 'Sigup Successful',
			description: 'Successfully Signed Up'
		},
		failure: {
			title: 'Sigup Failed'
		}
	}
});

export const DEFAULT_PROFILE_PICTURE = 'https://via.placeholder.com/150';
