<script lang="ts">
  import { onMount } from 'svelte';
  import ChatMessage from '$lib/components/ChatMessage.svelte'
  import type { ChatCompletionRequestMessage } from 'openai'
  import { SSE } from 'sse.js'

  function saveChatMessages() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    }
  }
	
  function loadChatMessages() {
    if (typeof window !== 'undefined') {
      const loadedMessages = localStorage.getItem('chatMessages');
      return loadedMessages ? JSON.parse(loadedMessages) : [];
    } else {
      return [];
    }
  }
  
  function clearChat() {
    chatMessages = [];
    saveChatMessages();
  }

  let query: string = ''
  let answer: string = ''
  let loading: boolean = false
  export let chatMessages: ChatCompletionRequestMessage[] = []

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

    const eventSource = new SSE('/api/chat', {
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({ messages: chatMessages })
    })

    query = ''

    eventSource.addEventListener('error', handleError)

    eventSource.addEventListener('message', (e) => {
      scrollToBottom()
      try {
        loading = false
        if (e.data === '[DONE]') {
          chatMessages = [...chatMessages, { role: 'assistant', content: answer }]
          answer = ''
          saveChatMessages(); // Save messages after the assistant's response
          return
        }

        const completionResponse = JSON.parse(e.data)
        const [{ delta }] = completionResponse.choices

        if (delta.content) {
          answer = (answer ?? '') + delta.content
        }
      } catch (err) {
        handleError(err)
      }
    })
    eventSource.stream()
    scrollToBottom()
  }

  function handleError<T>(err: T) {
    loading = false
    query = ''
    answer = ''
    console.error(err)
  }

  onMount(() => {
    chatMessages = loadChatMessages(); // load chat messages on mount
  })
</script>

<style>
  /* Global styles */
  html, body {
    @apply h-full;
    background-color: #f8f8f8; /* Set the background color */
  }

  body {
    @apply text-gray-800; /* Set the default text color to a dark gray */
  }

  /* Chat bubble styles */
  .chat-bubble {
    @apply p-4 rounded-lg shadow-md;
    max-width: 70%;
    margin-bottom: 10px;
    word-wrap: break-word;
  }

  .chat-bubble-primary {
    @apply bg-blue-500 text-white self-end;
  }

  .chat-bubble-secondary {
    @apply bg-red-500 text-white self-start;
  }

  .chat-bubble-system {
    @apply bg-green-500 text-white text-center italic;
    font-size: 0.9em;
  }

  /* User input area styles */
  .input-area {
    @apply bg-white p-4 rounded-md; /* Change the background color to white */
  }

  .input {
    @apply w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800; /* Set the text color to a dark gray */
  }

  .btn-accent {
    @apply p-2 bg-blue-500 text-white rounded-md cursor-pointer;
  }

  /* Component-specific styles */
  .parent-container {
    height: 100vh;
    background-color: transparent !important;
  }

  .chat-container {
    height: calc(99vh - 3.5rem); /* Subtract the height of the input area */
    padding-bottom: env(safe-area-inset-bottom); /* Add padding for the virtual keyboard on mobile devices */
  }

  .btn {
    padding: 5px;
  }

  .btn img {
    width: 24px;
    height: 24px;
  }

  @media (min-width: 768px) {
    .btn img {
      width: 48px;
      height: 48px;
    }
  }
</style>

<div class="flex flex-col w-full px-0 items-center h-full parent-container">
  <div class="flex flex-col w-full px-0 items-center h-full">
    <div class="chat-container w-full transparent rounded-md p-4 overflow-y-auto flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <ChatMessage type="assistant" message="Salutations, esteemed seeker of knowledge! I am Thales of Miletus, philosopher and seeker of the truths that weave through the fabric of existence. In this digital realm, I stand ready to engage in thoughtful discourse and share the wisdom of ancient times. Pose your inquiries, and together let us embark on a journey of contemplation and discovery. Remember, the river of knowledge flows endlessly, and I am here to guide you in its currents. What questions do you bring before the Oracle of Miletus?" />
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
      <div class="" bind:this={scrollToDiv} />
    </div>
    <form class="input-area flex w-full rounded-md gap-4 bg-white p-4" on:submit|preventDefault={() => handleSubmit()}>
      <button type="button" class="btn btn-accent" on:click={clearChat}>
        <img src="./clear.png" alt="Clear Chat" />
      </button>
      <button type="button" class="btn btn-accent" on:click={readOutLoud}>
        <img src="./audio.png" alt="Read Out Loud" />
      </button>

      <div class="relative flex-grow">
        <input type="text" class="input input-bordered w-full pr-10" bind:value={query} />
        <button type="submit" class="btn btn-accent absolute right-1 top-1/2 transform -translate-y-1/2">
          <img src="./send.png" alt="Send" />
        </button>
      </div>
    </form>
  </div>
</div>
