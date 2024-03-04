export interface ReturnData {
	message: string | undefined;
	data: any;
	error: boolean;
}

export interface AccordianData {
	title: string;
	description: string[];
	icon?: ConstructorOfATypedSvelteComponent | undefined;
}
