// inner imports
import { ROUTES } from '../../constants';
import { validateEmail } from '../../utils';
import settings from '../../config/settings';

// third party imports
import axios from 'axios';

export const login = async (email: string, password: string) => {
	const returnData: any = { error: false, data: null, message: null };

	try {
		if (!email || !password) {
			throw new Error('email or password missing');
		}

		if (!validateEmail(email)) {
			throw new Error('Please write valid email');
		}

		const payload = { user: { email, password } };
		const url = `${settings.config.baseApiUrl}/${ROUTES.auth}/login`;
		const tempData = await axios.post(url, payload);

		if (tempData.status !== 200) {
			const errorMessage = tempData.data?.message || 'Something went wrong';

			throw new Error(errorMessage);
		}

		returnData['data'] = tempData.data;
	} catch (error: any) {
		returnData['error'] = true;
		returnData['message'] = error?.response?.data?.message || error.message;
	}

	console.log('RETURN DATA', returnData);

	return returnData;
};
