<script lang="ts">
  import ChatMessage from '$lib/components/ChatMessage.svelte'
  import type { ChatCompletionRequestMessage } from 'openai'
  import { SSE } from 'sse.js'
  import { browser } from '@sveltejs/kit';

  function saveChatMessages() {
    if (browser) {
      localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    }
  }

  function loadChatMessages() {
    if (browser) {
      const loadedMessages = localStorage.getItem('chatMessages');
      return loadedMessages ? JSON.parse(loadedMessages) : [];
    } else {
      return [];
    }
  }

  let query: string = ''
  let answer: string = ''
  let loading: boolean = false
  let chatMessages: ChatCompletionRequestMessage[] = loadChatMessages()

  let scrollToDiv: HTMLDivElement

  function scrollToBottom() {
    setTimeout(function () {
      scrollToDiv.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
    }, 100)
  }

  const handleSubmit = async () => {
    loading = true;
    chatMessages = [...chatMessages, { role: 'user', content: query }];
    saveChatMessages();

    // ... (rest of the handleSubmit function)
  }

  // ... (rest of the script)
</script>

<!-- Rest of the file (HTML and style) -->

<style>
  .parent-container {
    height: 100vh;
  }

  .chat-container {
    height: calc(99vh - 3.5rem);
    padding-bottom: env(safe-area-inset-bottom);
  }

  .input-area {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 env(safe-area-inset-left) 0 env(safe-area-inset-right);
  }
</style>

<div class="flex flex-col w-full px-0 items-center h-full parent-container">
  <div class="flex flex-col w-full px-0 items-center h-full">
    <div class="chat-container w-full bg-gray-900 rounded-md p-4 overflow-y-auto flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <ChatMessage type="assistant" message="Good morrow! I am William Shakespeare, the Bard of Avon. Let us delve into the poetic beauty of language and the human experience." />
        {#each chatMessages as message}
          <ChatMessage type={message.role} message={message.content} />
        {/each}
        {#if answer}
          <ChatMessage type="assistant" message={answer} />
        {/if}
        {#if loading}
          <ChatMessage type="assistant" message="Loading.." />
        {/if}
      </div>
      <div class="" bind:this="{scrollToDiv}" />
    </div>
    <form
      class="input-area flex w-full rounded-md gap-4 bg-gray-900 p-4"
      on:submit|preventDefault="{() => handleSubmit()}"
    >
      <input type="text" class="input input-bordered flex-grow" bind:value="{query}" />
      <button type="submit" class="btn btn-accent"> Send </button>
    </form>
  </div>
</div>

