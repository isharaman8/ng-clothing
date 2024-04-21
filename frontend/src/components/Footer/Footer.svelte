<script lang="ts">
    const year = new Date().getFullYear();
</script>

<footer class="p-6 max-sm:p-2 border-t-2 border-neutral-400">
    <div class="flex px-[4rem] max-sm:p-2 justify-between items-center">
        <a href="/">
            <span class="text-4xl max-sm:text-3xl whitespace-nowrap font-extrabold">NG</span>
        </a>

        <div class="flex gap-8 max-sm:gap-4">
            <a class="hover:underline text-black" href="/about">About</a>
            <a class="hover:underline text-black" href="/support">Support</a>
            <a class="hover:underline text-black" href="/terms">Terms</a>
            <a class="hover:underline text-black" href="/feedback">Feedback</a>
        </div>
    </div>
    <div class="text-center mt-2">
       <p class="text-neutral-600 max-sm:text-sm">
           &copy; {year} NG Clothing, All rights reserved.
       </p>
    </div>
</footer>