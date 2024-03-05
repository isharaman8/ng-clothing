export interface ReturnData {
	message: string | null | undefined;
	data: any;
	error: boolean;
}

export interface AccordianData {
	title: string;
	description: string[];
	icon?: ConstructorOfATypedSvelteComponent | undefined;
}
