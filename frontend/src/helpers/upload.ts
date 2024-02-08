// inner imports
import { ROUTES } from '../constants';
import settings from '../config/settings';

export async function handleImageUpload(imageFile: File, authToken: string) {
	const result: any = { error: false, message: null, data: null };

	if (!imageFile || !authToken) {
		result['error'] = true;
		result['message'] = 'file and token are required';

		return result;
	}

	// Create a FormData object
	const formData = new FormData();

	formData.append('images', imageFile);

	const url = `${settings.config.baseApiUrl}/${ROUTES.uploads}/image-upload`;

	try {
		// Send the request to the server using the Fetch API
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				// Include the authorization token in the headers
				Authorization: `Bearer ${authToken}`
			},
			body: formData
		});

		// Handle the response from the server
		if (response.status === 200) {
			const data = await response.json(); // Assuming the server returns JSON
			// Handle the data from the server if needed
			result['data'] = data;
		} else {
			result['error'] = true;
			result['message'] = 'file and token are required';
		}
	} catch (error: any) {
		// Handle any errors that occurred during the fetch
		result['error'] = true;
		result['message'] = error.message;
	}

	return result;
}
