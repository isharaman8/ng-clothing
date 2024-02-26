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
	},
	updateProfile: {
		success: {
			title: 'Profile Updated Successfully',
			description: 'Profile Updated Successfully'
		},
		failure: {
			title: 'Profile Update Failed'
		}
	}
});

export const DEFAULT_PROFILE_PICTURE = 'https://via.placeholder.com/150';

export const STATUS_COLOR: any = Object.freeze({
	pending_verification: {
		text: 'text-gray-700',
		background: 'bg-gray-100'
	},
	verified: {
		text: 'text-blue-700',
		background: 'bg-blue-100'
	},
	cancelled: {
		text: 'text-red-700',
		background: 'bg-red-100'
	},
	fulfilled: {
		text: 'text-green-700',
		background: 'bg-green-100'
	},
	in_transit: {
		text: 'text-yellow-700',
		background: 'bg-yellow-100'
	},
	delivered: {
		text: 'text-green-700',
		background: 'bg-green-100'
	}
});

export const ORDER_TYPE_MAP: any = Object.freeze({
	cancelled: 'cancelled',
	all_orders: 'all_orders',
	completed: 'delivered,fulfilled',
	pending: 'pending_verification,in_transit'
});
