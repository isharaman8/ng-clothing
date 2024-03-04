<script>
	import { page } from '$app/stores';
    import { CartOutline } from 'flowbite-svelte-icons';
	import ProductAccordian from '../../../components/ProductAccordian/ProductAccordian.svelte';
    import { PRODUCT_ACCORDIAN } from '../../../constants';

    export let data;

    const {pathname} = $page.url;
    const breadcrumbs = pathname.split("/").slice(1);
    const { product = {} } = data;
    const allSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
    const sizes = Object.keys(product.available_sizes || {});
    const reviewsCount = product.reviews ? product.reviews.length : 0;
    const singularOrPlural = reviewsCount === 1 ? 'review' : 'reviews';
    const defaultImage = 'https://via.placeholder.com/800';
</script>

<section class="w-full flex gap-10 mt-[8rem] px-[4rem]">
    <div class="w-[50%]">
        <div class="flex gap-4">
            <div class="w-[85%] h-[70vh]">
                <img class="h-full object-cover" src={product.images[0] || defaultImage} alt="product-img">
            </div>
            <div class="w-[15%]">
                {#each product.images as image}
                    <div class="bg-slate-300">
                        <img src={image} alt="img">
                    </div>
                {/each}
            </div>
        </div>
    </div>
    <div class="w-[35%] border-l-2">
        <div class="flex gap-2 text-sm capitalize mb-4">
            <a href="/">Home ></a>
            {#each breadcrumbs as title}
            <p>{title === product.uid ? product.name : title + " >"}</p>
            {/each}
        </div>
        <h1 class="text-4xl font-bold capitalize">{product.name}</h1>
        <p class="capitalize my-4">{product.description}</p>
        <h2 class="text-2xl font-semibold">₹ {product.price}</h2>
        <p class="text-gray-600 text-sm">Inclusive of all taxes</p>
        <div class="text-sm my-2">{reviewsCount === 0 ? "No reviews" : `${reviewsCount} ${singularOrPlural}`}</div>
        <hr class="my-2">
        <p class="font-semibold uppercase">Select size</p>
        <div class="flex gap-4 my-2">
            {#each allSizes as size}
                <button class={`${!sizes.includes(size) ? 'cursor-not-allowed bg-gray-300 opacity-50' : 'cursor-pointer bg-white'} border border-gray-400 rounded-sm px-4 py-2`} disabled={!sizes.includes(size)}>{size}</button>
            {/each}
        </div>
        <div class="flex gap-4 my-5">
            <button class="bg-[#9589ec] flex justify-center items-center gap-2 px-[2rem] py-2 font-semibold text-sm rounded-md uppercase"><CartOutline class="w-[.8rem]"/> Add to cart</button>
            <button class="border-2 flex justify-center items-center gap-2 border-gray-400 text-gray-600 px-[3.6rem] py-2 font-semibold text-sm rounded-md uppercase">Buy Now</button>
        </div>

        <ProductAccordian accordian = {PRODUCT_ACCORDIAN.offers}/>
        <ProductAccordian accordian = {PRODUCT_ACCORDIAN.return_policy}/>
    </div>
</section>
