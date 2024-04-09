<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import * as store from 'svelte/store';
	import { CloseOutline } from 'flowbite-svelte-icons';

	// inner imports
	import Loader from '../../misc/Loader.svelte';
	import { parseBoolean } from '../../../utils';
	import { authUserData } from '../../../stores';
	import { showToast } from '../../misc/Toasts/toasts';
	import { defaultToastMessages } from '../../../constants';
	import LabeledInput from '../../misc/LabeledInput/LabeledInput.svelte';
	import LabeledSelect from '../../misc/LabeledSelect/LabeledSelect.svelte';
	import { addOrUpdateUserAddress, deleteUserAddress } from '../../../helpers/user';

	// functions
	function handleValueChange(event: any) {
		if (event.target.name === 'postal_code') {
			newAddress[event.target.name] = +event.target.value;
		} else {
			newAddress[event.target.name] = event.target.value;
		}
	}

	async function localHandleAddOrUpdateAddress() {
		let success: any, failure: any;

		if (newAddress.uid) {
			success = defaultToastMessages.updateAddress.success;
			failure = defaultToastMessages.updateAddress.failure;
		} else {
			success = defaultToastMessages.addAddress.success;
			failure = defaultToastMessages.addAddress.failure;
		}

		buttonLoading = true;

		try {
			const data = await addOrUpdateUserAddress(userDetails, newAddress, userAddress, userAddress.uid);

			if (data.error) {
				throw new Error(data.message);
			}

			showToast(success.title, success.description, 'success');

			// param as shouldReload
			handleOnClose(true);
		} catch (error: any) {
			showToast(failure.title, error.message, 'error');
		} finally {
			buttonLoading = false;
		}
	}

	async function localHandleDeleteAddress() {
		let success = defaultToastMessages.deleteAddress.success,
			failure = defaultToastMessages.deleteAddress.failure;

		buttonLoading = true;

		try {
			const data = await deleteUserAddress(userDetails, userAddress.uid);

			if (data.error) {
				throw new Error(data.message);
			}

			showToast(success.title, success.description, 'success');

			// param as shouldReload
			handleOnClose(true);
		} catch (error: any) {
			showToast(failure.title, error.message, 'error');
		} finally {
			buttonLoading = false;
		}
	}

	// props
	export let userAddress: any = {};
	export let handleOnClose: any = () => {};

	// variables
	const extraLabelClasses = 'w-full';
	const addressInputClasses = 'w-full';
	const nonAddressInputClasses = 'w-full';
	const labeledInputClasses = 'mt-2 w-full flex-col';
	const userDetails: any = store.get(authUserData);

	let newAddress: any = {
		uid: _.defaultTo(userAddress.uid, null),
		type: _.defaultTo(userAddress.type, null),
		city: _.defaultTo(userAddress.city, null),
		active: parseBoolean(userAddress.active, true),
		country: _.defaultTo(userAddress.country, null),
		primary: parseBoolean(userAddress.primary, false),
		user_name: _.defaultTo(userAddress.user_name, null),
		postal_code: _.defaultTo(userAddress.postal_code, null),
		contact_number: _.defaultTo(userAddress.contact_number, null),
		address_line_1: _.defaultTo(userAddress.address_line_1, null),
		address_line_2: _.defaultTo(userAddress.address_line_2, null),
		state_province: _.defaultTo(userAddress.state_province, null),
		user_id: _.defaultTo(userAddress.user_id, userDetails.user.uid)
	};
	let selectTypeOptions = [
		{ value: 'work', title: 'Work' },
		{ value: 'home', title: 'Home' }
	];
	let selectPrimaryOptions = [
		{ value: false, title: 'No' },
		{ value: true, title: 'Yes' }
	];
	let selectCountriesOptions = [
		{ value: 'IN', title: 'India' },
		{ value: 'AF', title: 'Afghanistan' },
		{ value: 'AL', title: 'Albania' },
		{ value: 'DZ', title: 'Algeria' },
		{ value: 'AS', title: 'American Samoa' },
		{ value: 'AD', title: 'Andorra' },
		{ value: 'AO', title: 'Angola' },
		{ value: 'AI', title: 'Anguilla' },
		{ value: 'AQ', title: 'Antarctica' },
		{ value: 'AG', title: 'Antigua and Barbuda' },
		{ value: 'AR', title: 'Argentina' },
		{ value: 'AM', title: 'Armenia' },
		{ value: 'AW', title: 'Aruba' },
		{ value: 'AU', title: 'Australia' },
		{ value: 'AT', title: 'Austria' },
		{ value: 'AZ', title: 'Azerbaijan' },
		{ value: 'BS', title: 'Bahamas' },
		{ value: 'BH', title: 'Bahrain' },
		{ value: 'BD', title: 'Bangladesh' },
		{ value: 'BB', title: 'Barbados' },
		{ value: 'BY', title: 'Belarus' },
		{ value: 'BE', title: 'Belgium' },
		{ value: 'BZ', title: 'Belize' },
		{ value: 'BJ', title: 'Benin' },
		{ value: 'BM', title: 'Bermuda' },
		{ value: 'BT', title: 'Bhutan' },
		{ value: 'BO', title: 'Bolivia' },
		{ value: 'BA', title: 'Bosnia and Herzegovina' },
		{ value: 'BW', title: 'Botswana' },
		{ value: 'BV', title: 'Bouvet Island' },
		{ value: 'BR', title: 'Brazil' },
		{ value: 'IO', title: 'British Indian Ocean Territory' },
		{ value: 'BN', title: 'Brunei Darussalam' },
		{ value: 'BG', title: 'Bulgaria' },
		{ value: 'BF', title: 'Burkina Faso' },
		{ value: 'BI', title: 'Burundi' },
		{ value: 'KH', title: 'Cambodia' },
		{ value: 'CM', title: 'Cameroon' },
		{ value: 'CA', title: 'Canada' },
		{ value: 'CV', title: 'Cape Verde' },
		{ value: 'KY', title: 'Cayman Islands' },
		{ value: 'CF', title: 'Central African Republic' },
		{ value: 'TD', title: 'Chad' },
		{ value: 'CL', title: 'Chile' },
		{ value: 'CN', title: "People's Republic of China" },
		{ value: 'CX', title: 'Christmas Island' },
		{ value: 'CC', title: 'Cocos (Keeling) Islands' },
		{ value: 'CO', title: 'Colombia' },
		{ value: 'KM', title: 'Comoros' },
		{ value: 'CG', title: 'Republic of the Congo' },
		{ value: 'CD', title: 'Democratic Republic of the Congo' },
		{ value: 'CK', title: 'Cook Islands' },
		{ value: 'CR', title: 'Costa Rica' },
		{ value: 'CI', title: "Cote d'Ivoire" },
		{ value: 'HR', title: 'Croatia' },
		{ value: 'CU', title: 'Cuba' },
		{ value: 'CY', title: 'Cyprus' },
		{ value: 'CZ', title: 'Czech Republic' },
		{ value: 'DK', title: 'Denmark' },
		{ value: 'DJ', title: 'Djibouti' },
		{ value: 'DM', title: 'Dominica' },
		{ value: 'DO', title: 'Dominican Republic' },
		{ value: 'EC', title: 'Ecuador' },
		{ value: 'EG', title: 'Egypt' },
		{ value: 'SV', title: 'El Salvador' },
		{ value: 'GQ', title: 'Equatorial Guinea' },
		{ value: 'ER', title: 'Eritrea' },
		{ value: 'EE', title: 'Estonia' },
		{ value: 'ET', title: 'Ethiopia' },
		{ value: 'FK', title: 'Falkland Islands (Malvinas)' },
		{ value: 'FO', title: 'Faroe Islands' },
		{ value: 'FJ', title: 'Fiji' },
		{ value: 'FI', title: 'Finland' },
		{ value: 'FR', title: 'France' },
		{ value: 'GF', title: 'French Guiana' },
		{ value: 'PF', title: 'French Polynesia' },
		{ value: 'TF', title: 'French Southern Territories' },
		{ value: 'GA', title: 'Gabon' },
		{ value: 'GM', title: 'Republic of The Gambia' },
		{ value: 'GE', title: 'Georgia' },
		{ value: 'DE', title: 'Germany' },
		{ value: 'GH', title: 'Ghana' },
		{ value: 'GI', title: 'Gibraltar' },
		{ value: 'GR', title: 'Greece' },
		{ value: 'GL', title: 'Greenland' },
		{ value: 'GD', title: 'Grenada' },
		{ value: 'GP', title: 'Guadeloupe' },
		{ value: 'GU', title: 'Guam' },
		{ value: 'GT', title: 'Guatemala' },
		{ value: 'GN', title: 'Guinea' },
		{ value: 'GW', title: 'Guinea-Bissau' },
		{ value: 'GY', title: 'Guyana' },
		{ value: 'HT', title: 'Haiti' },
		{ value: 'HM', title: 'Heard Island and McDonald Islands' },
		{ value: 'VA', title: 'Holy See (Vatican City State)' },
		{ value: 'HN', title: 'Honduras' },
		{ value: 'HK', title: 'Hong Kong' },
		{ value: 'HU', title: 'Hungary' },
		{ value: 'IS', title: 'Iceland' },
		{ value: 'ID', title: 'Indonesia' },
		{ value: 'IR', title: 'Islamic Republic of Iran' },
		{ value: 'IQ', title: 'Iraq' },
		{ value: 'IE', title: 'Ireland' },
		{ value: 'IL', title: 'Israel' },
		{ value: 'IT', title: 'Italy' },
		{ value: 'JM', title: 'Jamaica' },
		{ value: 'JP', title: 'Japan' },
		{ value: 'JO', title: 'Jordan' },
		{ value: 'KZ', title: 'Kazakhstan' },
		{ value: 'KE', title: 'Kenya' },
		{ value: 'KI', title: 'Kiribati' },
		{ value: 'KP', title: 'North Korea' },
		{ value: 'KR', title: 'South Korea' },
		{ value: 'KW', title: 'Kuwait' },
		{ value: 'KG', title: 'Kyrgyzstan' },
		{ value: 'LA', title: "Lao People's Democratic Republic" },
		{ value: 'LV', title: 'Latvia' },
		{ value: 'LB', title: 'Lebanon' },
		{ value: 'LS', title: 'Lesotho' },
		{ value: 'LR', title: 'Liberia' },
		{ value: 'LY', title: 'Libya' },
		{ value: 'LI', title: 'Liechtenstein' },
		{ value: 'LT', title: 'Lithuania' },
		{ value: 'LU', title: 'Luxembourg' },
		{ value: 'MO', title: 'Macao' },
		{ value: 'MG', title: 'Madagascar' },
		{ value: 'MW', title: 'Malawi' },
		{ value: 'MY', title: 'Malaysia' },
		{ value: 'MV', title: 'Maldives' },
		{ value: 'ML', title: 'Mali' },
		{ value: 'MT', title: 'Malta' },
		{ value: 'MH', title: 'Marshall Islands' },
		{ value: 'MQ', title: 'Martinique' },
		{ value: 'MR', title: 'Mauritania' },
		{ value: 'MU', title: 'Mauritius' },
		{ value: 'YT', title: 'Mayotte' },
		{ value: 'MX', title: 'Mexico' },
		{ value: 'FM', title: 'Micronesia, Federated States of' },
		{ value: 'MD', title: 'Moldova, Republic of' },
		{ value: 'MC', title: 'Monaco' },
		{ value: 'MN', title: 'Mongolia' },
		{ value: 'MS', title: 'Montserrat' },
		{ value: 'MA', title: 'Morocco' },
		{ value: 'MZ', title: 'Mozambique' },
		{ value: 'MM', title: 'Myanmar' },
		{ value: 'NA', title: 'Namibia' },
		{ value: 'NR', title: 'Nauru' },
		{ value: 'NP', title: 'Nepal' },
		{ value: 'NL', title: 'Netherlands' },
		{ value: 'NC', title: 'New Caledonia' },
		{ value: 'NZ', title: 'New Zealand' },
		{ value: 'NI', title: 'Nicaragua' },
		{ value: 'NE', title: 'Niger' },
		{ value: 'NG', title: 'Nigeria' },
		{ value: 'NU', title: 'Niue' },
		{ value: 'NF', title: 'Norfolk Island' },
		{ value: 'MK', title: 'The Republic of North Macedonia' },
		{ value: 'MP', title: 'Northern Mariana Islands' },
		{ value: 'NO', title: 'Norway' },
		{ value: 'OM', title: 'Oman' },
		{ value: 'PK', title: 'Pakistan' },
		{ value: 'PW', title: 'Palau' },
		{ value: 'PS', title: 'State of Palestine' },
		{ value: 'PA', title: 'Panama' },
		{ value: 'PG', title: 'Papua New Guinea' },
		{ value: 'PY', title: 'Paraguay' },
		{ value: 'PE', title: 'Peru' },
		{ value: 'PH', title: 'Philippines' },
		{ value: 'PN', title: 'Pitcairn' },
		{ value: 'PL', title: 'Poland' },
		{ value: 'PT', title: 'Portugal' },
		{ value: 'PR', title: 'Puerto Rico' },
		{ value: 'QA', title: 'Qatar' },
		{ value: 'RE', title: 'Reunion' },
		{ value: 'RO', title: 'Romania' },
		{ value: 'RU', title: 'Russian Federation' },
		{ value: 'RW', title: 'Rwanda' },
		{ value: 'SH', title: 'Saint Helena' },
		{ value: 'KN', title: 'Saint Kitts and Nevis' },
		{ value: 'LC', title: 'Saint Lucia' },
		{ value: 'PM', title: 'Saint Pierre and Miquelon' },
		{ value: 'VC', title: 'Saint Vincent and the Grenadines' },
		{ value: 'WS', title: 'Samoa' },
		{ value: 'SM', title: 'San Marino' },
		{ value: 'ST', title: 'Sao Tome and Principe' },
		{ value: 'SA', title: 'Saudi Arabia' },
		{ value: 'SN', title: 'Senegal' },
		{ value: 'SC', title: 'Seychelles' },
		{ value: 'SL', title: 'Sierra Leone' },
		{ value: 'SG', title: 'Singapore' },
		{ value: 'SK', title: 'Slovakia' },
		{ value: 'SI', title: 'Slovenia' },
		{ value: 'SB', title: 'Solomon Islands' },
		{ value: 'SO', title: 'Somalia' },
		{ value: 'ZA', title: 'South Africa' },
		{ value: 'GS', title: 'South Georgia and the South Sandwich Islands' },
		{ value: 'ES', title: 'Spain' },
		{ value: 'LK', title: 'Sri Lanka' },
		{ value: 'SD', title: 'Sudan' },
		{ value: 'SR', title: 'Suriname' },
		{ value: 'SJ', title: 'Svalbard and Jan Mayen' },
		{ value: 'SZ', title: 'Eswatini' },
		{ value: 'SE', title: 'Sweden' },
		{ value: 'CH', title: 'Switzerland' },
		{ value: 'SY', title: 'Syrian Arab Republic' },
		{ value: 'TW', title: 'Taiwan, Province of China' },
		{ value: 'TJ', title: 'Tajikistan' },
		{ value: 'TZ', title: 'United Republic of Tanzania' },
		{ value: 'TH', title: 'Thailand' },
		{ value: 'TL', title: 'Timor-Leste' },
		{ value: 'TG', title: 'Togo' },
		{ value: 'TK', title: 'Tokelau' },
		{ value: 'TO', title: 'Tonga' },
		{ value: 'TT', title: 'Trinidad and Tobago' },
		{ value: 'TN', title: 'Tunisia' },
		{ value: 'TR', title: 'Türkiye' },
		{ value: 'TM', title: 'Turkmenistan' },
		{ value: 'TC', title: 'Turks and Caicos Islands' },
		{ value: 'TV', title: 'Tuvalu' },
		{ value: 'UG', title: 'Uganda' },
		{ value: 'UA', title: 'Ukraine' },
		{ value: 'AE', title: 'United Arab Emirates' },
		{ value: 'GB', title: 'United Kingdom' },
		{ value: 'US', title: 'United States of America' },
		{ value: 'UM', title: 'United States Minor Outlying Islands' },
		{ value: 'UY', title: 'Uruguay' },
		{ value: 'UZ', title: 'Uzbekistan' },
		{ value: 'VU', title: 'Vanuatu' },
		{ value: 'VE', title: 'Venezuela' },
		{ value: 'VN', title: 'Vietnam' },
		{ value: 'VG', title: 'Virgin Islands, British' },
		{ value: 'VI', title: 'Virgin Islands, U.S.' },
		{ value: 'WF', title: 'Wallis and Futuna' },
		{ value: 'EH', title: 'Western Sahara' },
		{ value: 'YE', title: 'Yemen' },
		{ value: 'ZM', title: 'Zambia' },
		{ value: 'ZW', title: 'Zimbabwe' },
		{ value: 'AX', title: 'Åland Islands' },
		{ value: 'BQ', title: 'Bonaire, Sint Eustatius and Saba' },
		{ value: 'CW', title: 'Curaçao' },
		{ value: 'GG', title: 'Guernsey' },
		{ value: 'IM', title: 'Isle of Man' },
		{ value: 'JE', title: 'Jersey' },
		{ value: 'ME', title: 'Montenegro' },
		{ value: 'BL', title: 'Saint Barthélemy' },
		{ value: 'MF', title: 'Saint Martin (French part)' },
		{ value: 'RS', title: 'Serbia' },
		{ value: 'SX', title: 'Sint Maarten (Dutch part)' },
		{ value: 'SS', title: 'South Sudan' },
		{ value: 'XK', title: 'Kosovo' }
	];
	let buttonLoading = false;
</script>

<div class="fixed top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center backdrop-blur-md max-sm:overflow-auto">
	<div class="max-w-[80%] min-w-[70%] max-sm:min-w-[90%] mt-[6rem] max-sm:mt-[50rem] bg-white p-8 rounded-md">
		<div class="w-full flex justify-between items-center">
			<h1 class="max-w-[80%] text-left text-2xl mb-2 font-medium text-gray-700">
				{newAddress.uid === null ? 'Add New Address' : 'Update Address'}
			</h1>
			<CloseOutline class="text-gray-700 cursor-pointer" on:click={() => handleOnClose(false)} />
		</div>
		<div class="flex gap-4 max-sm:flex-col">
			<LabeledSelect
				name={'type'}
				{extraLabelClasses}
				options={selectTypeOptions}
				selectValue={newAddress.type}
				labelHeading={'Address Type'}
				placeholder={'Select Address Type'}
				handleOnChange={handleValueChange}
			/>
			<LabeledSelect
				name={'primary'}
				{extraLabelClasses}
				labelHeading={'Primary'}
				options={selectPrimaryOptions}
				selectValue={newAddress.primary}
				handleOnChange={handleValueChange}
				placeholder={'Is Address Primary'}
			/>
			<LabeledSelect
				name={'country'}
				{extraLabelClasses}
				labelHeading={'Country'}
				options={selectCountriesOptions}
				selectValue={newAddress.country}
				handleOnChange={handleValueChange}
				placeholder={'Select Country'}
			/>
		</div>
		
		<div class="flex gap-4 max-sm:flex-col">
			<LabeledInput
				name="city"
				labelText="City Name"
				value={newAddress.city}
				placeholder="City Name"
				onInput={handleValueChange}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={nonAddressInputClasses}
			/>
			<LabeledInput
				name="user_name"
				labelText="Contact Name"
				placeholder="Contact Name"
				value={newAddress.user_name}
				onInput={handleValueChange}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={nonAddressInputClasses}
			/>
		</div>
		<div class="flex gap-4 max-sm:flex-col">
			<LabeledInput
				name="postal_code"
				labelText="Postal Code"
				placeholder="Postal Code"
				onInput={handleValueChange}
				value={newAddress.postal_code}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={nonAddressInputClasses}
			/>
			<LabeledInput
				name="contact_number"
				labelText="Contact Number"
				placeholder="Contact Number"
				onInput={handleValueChange}
				value={newAddress.contact_number}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={nonAddressInputClasses}
			/>
			<LabeledInput
				placeholder="State/Province"
				name="state_province"
				labelText="State/Province"
				value={newAddress.state_province}
				onInput={handleValueChange}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={nonAddressInputClasses}
			/>
		</div>
		<div class="flex gap-4 max-sm:flex-col">
			<LabeledInput
				name="address_line_1"
				placeholder="Address One"
				labelText="Address Line 1"
				onInput={handleValueChange}
				value={newAddress.address_line_1}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={addressInputClasses}
			/>
			<LabeledInput
				name="address_line_2"
				placeholder="Address Two"
				labelText="Address Line 2"
				onInput={handleValueChange}
				value={newAddress.address_line_2}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={addressInputClasses}
			/>
		</div>

		<span class="w-full flex max-sm:flex-col justify-between items-center">
			<button
				disabled={buttonLoading}
				on:click={localHandleAddOrUpdateAddress}
				class="mt-4 p-4 rounded-lg bg-gray-700 disabled:bg-gray-500 text-gray-100 font-medium max-sm:w-full"
			>
				{#if buttonLoading}
					<Loader borderColor="border-white" />
				{:else}
					{newAddress.uid === null ? 'Add Address' : 'Update Address'}
				{/if}
			</button>

			{#if userAddress.uid}
				<button
					disabled={buttonLoading}
					on:click={localHandleDeleteAddress}
					class="mt-4 p-4 rounded-lg bg-red-700 disabled:bg-red-500 text-gray-100 font-medium max-sm:w-full"
				>
					{#if buttonLoading}
						<Loader borderColor="border-white" />
					{:else}
						Delete Address
					{/if}
				</button>
			{/if}
		</span>
	</div>
</div>
