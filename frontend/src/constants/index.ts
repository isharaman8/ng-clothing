export const ROUTES = Object.freeze({
	products: 'product',
	purchases: 'purchase',
	auth: 'auth',
	uploads: 's3'
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
