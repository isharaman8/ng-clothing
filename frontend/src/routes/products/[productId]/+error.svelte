<script>
	import { page } from "$app/stores";
	import { HomeSolid } from "flowbite-svelte-icons";
</script>

<section class="h-screen grid place-content-center">
    <div class="text-center">
        <h1 class="text-4xl font-bold">{$page.error?.message}</h1>
        <a class="bg-[#9589ec] flex justify-center items-center gap-2 mt-4 px-[1.4rem] py-2 font-semibold text-sm rounded-md uppercase" href="/"><HomeSolid class="w-[.8rem]" /> Go back to home </a>
    </div>
</section>