import { SalePercentSolid } from 'flowbite-svelte-icons';

export const ROUTES = Object.freeze({
	products: 'product',
	purchases: 'purchase',
	auth: 'auth',
	uploads: 's3',
	user: 'user',
	cart: 'cart'
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
	},
	addToCart: {
		success: {
			title: 'Added to cart successfully',
			description: 'Added to cart successfully'
		},
		failure: {
			title: 'Add to cart failed'
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

export const PRODUCT_ACCORDIAN = {
	offers: {
		title: 'SAVE EXTRA WITH 2 OFFERS',
		description: [
			'Get Rs.200 instant discount on your first Purchase above Rs.999 Coupon Code- NEW-200',
			'Whistles! Get extra 20% cashback on prepaid orders above Rs.499 Coupon Code- NEW-20'
		],
		icon: SalePercentSolid
	},
	return_policy: {
		title: '15 DAYS RETURN & EXCHANGE',
		description: ['Easy returns upto 15 days of delivery. Exchange available on selective pincodes.']
	}
};
