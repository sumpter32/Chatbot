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
					saveChatMessages() // Save messages after assistant response
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
	.parent-container {
      height: 100vh;
     }
	 
	 .chat-container {
	  height: calc(99vh - 3.5rem); /* Subtract the height of the input area */
	  padding-bottom: env(safe-area-inset-bottom); /* Add padding for the virtual keyboard on mobile devices */
	}
	.input-area {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 env(safe-area-inset-left) 0 env(safe-area-inset-right);
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
	<div class="chat-container w-full bg-gray-900 rounded-md p-4 overflow-y-auto flex flex-col gap-4">
	  <div class="flex flex-col gap-2">
		<ChatMessage type="assistant" message="Welcome, good gentle! Thou art about to embark on a grand adventure, penned by none other than the Bard himself, William Shakespeare. In this tale of time and tumult, thou art the hero, a time traveler from the future, tasked with averting a catastrophic event. Pray, engage with the Bard, answer his queries, and shape thy story. Forsooth, thy choices will determine the course of history. Be prepared to face time paradoxes and the consequences of altering the past. Now, let us away to our adventure!" />
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
	<form class="input-area flex w-full rounded-md gap-4 bg-gray-900 p-4" on:submit|preventDefault={() => handleSubmit()}>
    <button type="button" class="btn btn-accent" on:click={clearChat}>
        <img src="./clear.png" alt="Clear Chat" />
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
