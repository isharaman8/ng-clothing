<script lang="ts">
    export let breadcrumbs: string[];
    export let product: any;
</script>

<div class="flex gap-2 text-sm capitalize mb-4">
    <a href="/">Home</a>
    {#each breadcrumbs as title}
        <p>{title === product.uid ? product.name : title + ' >'}</p>
    {/each}
</div>