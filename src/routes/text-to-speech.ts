// Create a new file named text-to-speech.ts in the $lib folder

// Import the SpeechSynthesis API
const { speechSynthesis, SpeechSynthesisUtterance } = window;

export async function speakText(text: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Create a new SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Set any additional options for the utterance, if needed
    // utterance.volume = 1;
    // utterance.rate = 1;
    // utterance.pitch = 1;

    // Event listeners for when speech starts and ends
    utterance.onstart = () => console.log('Speech started');
    utterance.onend = () => {
      console.log('Speech ended');
      resolve();
    };

    // Event listener for any errors during speech
    utterance.onerror = (event) => {
      console.error('Speech error:', event.error);
      reject(event.error);
    };

    // Add the utterance to the speechSynthesis queue and start speaking
    speechSynthesis.speak(utterance);
  });
}
