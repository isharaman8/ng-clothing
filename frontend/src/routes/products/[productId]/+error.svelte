<script>
	import { page } from "$app/stores";
</script>

<section class="h-screen grid place-content-center">
    <div>
        <h1 class="text-2xl">{$page.error?.message}</h1>
    </div>
</section>