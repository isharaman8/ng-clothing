<script lang="ts">
    import { ChevronRightSolid, ChevronDownSolid } from "flowbite-svelte-icons";
    import type { AccordianData } from "../../interfaces";

    export let accordian: AccordianData;

    let open = false;

    function toggleAccordion() {
        open = !open;
    }

    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            toggleAccordion();
        }
    }
</script>

<hr>
<div role="button" tabindex="0" class="w-full py-4 cursor-pointer" on:keypress={handleKeyPress} on:click={toggleAccordion}>
    <div class="flex justify-between items-center font-semibold">
        {accordian.title}
        {#if open}
            <ChevronDownSolid class="w-[.7rem]"/>
        {:else}
            <ChevronRightSolid class="w-[.4rem]"/>
        {/if}
    </div>

    {#if open}
        {#each accordian.description as description}
            <div class="flex gap-2 items-center my-2">
                {#if accordian.icon}
                    <svelte:component this={accordian.icon} class="w-[2rem]"/>
                {/if}
                <p>{description}</p>
            </div>
        {/each}
    {/if}
</div>
