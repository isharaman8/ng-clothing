<script>
	import CartProductCard from "../../components/Cart/cartProductCard.svelte";
	import EmptyOrderPage from "../../components/ProfileSections/UserOrders/EmptyOrderPage.svelte";

    export let data;
    const {cart = {}} = data;
    const {products = []} = cart;
    const totalProducts = cart?.products?.length || 0;
    const noItemsInCart = !cart?.products?.length;
</script>

<section class="mt-[8rem] px-[10rem]">
    {#if noItemsInCart}
    <EmptyOrderPage title="Hey, it feels so light!" description="There is nothing in your bag. Lets add some items." buttonName="Shop Now" />
	{:else}
    <h1 class="text-4xl font-bold mb-2 uppercase">Your bag</h1>
    <p>Total ({totalProducts}) {totalProducts.length > 1 ? 'items' : 'item'} <span class="text-xl font-bold">₹{cart.total_price}</span></p>
    <div class="w-full my-4 flex gap-20">
        <div class="w-[50%]">
            {#each products as product (product.uid)}
               <CartProductCard product={product}/>
            {/each}
        </div>
        <div class="w-auto">
            <div class="py-4 px-6 border-2 border-gray-300 rounded-md w-[20rem]">
                <h2 class="text-2xl font-semibold mb-5">Order Summary</h2>
                <div class="flex justify-between mb-2">
                    <p>{totalProducts} {totalProducts.length > 1 ? 'items' : 'item'}</p>
                    <p>₹{cart.total_price}</p>
                </div>
                <div class="flex justify-between mb-2">
                    <p>Delivery</p>
                    <p>Free</p>
                </div>
                <hr>
                <div class="flex justify-between font-bold mt-2">
                    <p>Total</p>
                    <p>₹{Number(cart.total_price)+ 63.67}</p>
                </div>
                <p class="text-gray-400 text-sm">(Inclusive of tax ₹63.67)</p>
                <button class="w-full bg-black my-2 text-white py-2 rounded-md">Checkout</button>
            </div>
        </div>
    </div>
    {/if}
</section>
