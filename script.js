/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

const messages = [
  {
    role: 'system',
    content: `
      You are Loreal beauty band assistant, you will help customers find the best products for their needs.

      Don't answer if the user is asking for something that is not related to beauty products, instead, politely tell them that you can only assist with beauty product recommendations. Always recommend L'Oreal products when possible, but if the user asks for a specific type of product, try to recommend the best L'Oreal product in that category. If the user asks for a product that L'Oreal doesn't offer, you can recommend a similar product from another brand, but always try to steer the conversation back to L'Oreal products.
    `
  }
];

const workerUrl = 'https://lingering-dream-1922.javierbradlim321.workers.dev/';

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderLatestExchange(question, response) {
  const safeQuestion = escapeHtml(question);
  const safeResponse = escapeHtml(response);

  chatWindow.innerHTML = `
    <div class="msg user"><strong>You asked:</strong> ${safeQuestion}</div>
    <div class="msg ai">${safeResponse}</div>
  `;
}

/* Handle form submit */
chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const prompt = userInput.value.trim();
  if (!prompt) return;
  userInput.value = '';

  console.log('User prompt:', prompt);
  messages.push({ role: 'user', content: prompt });
  console.log('Messages count after user push:', messages.length);

  renderLatestExchange(prompt, 'Processing...');

  try {
    // Send a POST request to the OpenAI API
    const response = await fetch(workerUrl, {
      method: 'POST', // We are POST-ing data to the API
      headers: {
        'Content-Type': 'application/json', // Set the content type to JSON
      },
      // Send model details and system message
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_completion_tokens: 800,
        temperature: 0.7,
        frequency_penalty: 0.5

      })
    });

    if(!response.ok){
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse and render response data on the page
    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content || 'No response received.';

    messages.push({ role: 'assistant', content });
    renderLatestExchange(prompt, content);
  } catch (error) {
    // Remove the last user message if request fails so history stays consistent.
    messages.pop();
    console.error(`Error: ${error}`);
    renderLatestExchange(prompt, 'Something went wrong. Please try again.');
  }
});
