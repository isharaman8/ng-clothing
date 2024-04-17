import { persisted } from 'svelte-persisted-store';

const initPurchase: any = { checkout_purchase: [], single_purchase: null };

export const purchaseData = persisted('purchase', initPurchase);
