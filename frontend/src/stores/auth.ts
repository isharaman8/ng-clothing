import { persisted } from 'svelte-persisted-store';

export const authUserData = persisted('user', {});
