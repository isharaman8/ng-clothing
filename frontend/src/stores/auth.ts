import { persisted } from 'svelte-persisted-store';

const initialData: any = {};

export const authUserData = persisted('user', initialData);
