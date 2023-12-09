<script lang="ts">
	import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
	export let type: ChatCompletionRequestMessageRoleEnum
	export let message: string
	export let sent: boolean = false // New property to indicate if the message has been sent
	export let isTyping: boolean = false // New property to indicate if the assistant is typing
  </script>
  
  <div class="chat {type === 'user' ? 'chat-end' : 'chat-start'} justify-end">
	<div class="chat-image avatar">
	  <div class="w-10 rounded-full">
		<img src="{type === 'user' ? 'https://ui-avatars.com/api/?name=Me' : './assistant-icon.png'}" alt="{type} avatar" />
	  </div>
	</div>
	<div class="chat-header">
	  {type === 'user' ? '' : ''}
	</div>
	<div class="chat-bubble {type === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'}">
	  {message}
	  {#if sent}
		<span class="sent-indicator">✓</span>
	  {/if}
	  {#if isTyping}
		<span class="typing-indicator">...</span>
	  {/if}
	</div>
  </div>
  
  <style>
	/* Add these styles for the sent and typing indicators */
	.sent-indicator {
	  margin-left: 4px;
	  color: #2ecc71; /* Set the color to a green shade */
	}
  
	.typing-indicator {
	  font-size: 0.8em;
	  color: #3498db; /* Set the color to a blue shade */
	}
  </style>
  