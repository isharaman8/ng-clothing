import { persisted } from 'svelte-persisted-store';

const initPurchase: any = { checkout_purchase: [] };

export const purchaseData = persisted('purchase', initPurchase);
