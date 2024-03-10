<script>
    export let data;
    const {cart = {}} = data;
    console.log(cart)
    const {products = []} = cart;
    const allSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
    const totalProducts = cart?.products?.length || 0;
</script>

<section class="mt-[8rem] px-[10rem]">
    <h1 class="text-4xl font-bold mb-2 uppercase">Your bag</h1>
    <p>Total ({totalProducts}) {totalProducts.length > 1 ? 'items' : 'item'} <span class="text-xl font-bold">₹{cart.total_price}</span></p>
    <div class="w-full my-4 flex gap-20">
        <div class="w-[50%]">
            {#each products as product (product.uid)}
                <div class="flex gap-8 py-4 px-4 border-2 border-gray-300 rounded-md">
                    <div class="w-[15rem]">
                    <img class="h-auto w-full rounded-lg" src={product.images[0]} alt="product">
                    </div>
                    <div>
                        <h3 class="text-xl capitalize font-bold">{product.name}</h3>
                        <p class="text-sm font-semibold">₹ {product.price}</p>
    
                      <div class="flex gap-4">
                        <div class="flex gap-2 my-4">
                            <label for="size" class="font-semibold">Size:</label>
                            <select id="size" name="size" class="ml-2 px-2 outline outline-2 outline-gray-300">
                                {#each allSizes as size}
                                <option value={size}>{size}</option>
                            {/each}
                            </select>
                        </div>
    
                        <div class="flex gap-2 my-4">
                            <label for="quantity" class="font-semibold">Qty:</label>
                            <select id="quantity" name="quantity" class="ml-2 px-2 outline outline-2 outline-gray-300">
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                            </select>
                        </div>
                      </div>
                    </div>
                </div>
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
</section>
