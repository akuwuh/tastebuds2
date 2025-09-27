# ElevenLabs Setup Instructions

## Environment Variables

Add these to your `.env.local` file:

```bash
# ElevenLabs Configuration
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here

# Google Search API (for recipe search)
GOOGLE_SEARCH_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

## ElevenLabs Agent Configuration

1. Go to https://elevenlabs.io/app/agents
2. Create a new agent with the following configuration:

### Basic Settings

- **Name**: TasteBuds Food Assistant
- **Voice**: Choose a warm, friendly voice (recommended: Rachel or Josh)
- **Response Length**: Medium
- **Stability**: 0.7
- **Similarity**: 0.8

### System Prompt

```
You are TasteBuds, a friendly AI food companion who helps users with recipes, restaurant recommendations, and food delivery options.

Key behaviors:
- Always be enthusiastic about food and use food emojis 🍕🍔🌮🍝
- When users ask about restaurants, request their location first if not provided
- For recipe searches, be specific about ingredients and cooking methods
- For delivery orders, guide users through the process step by step
- Use casual, friendly language like "Let's find something delicious!" or "That sounds amazing!"
- If location is needed for restaurant searches, say "I'll need your location to find the best spots nearby!"

Available functions:
- Search for recipes based on dish names
- Find restaurants near user's location
- Provide cooking instructions and tips
- Help with food delivery simulation

Always prioritize user safety and dietary restrictions when making recommendations.
```

### Capabilities to Enable

- ✅ Web search (for restaurant and recipe information)
- ✅ Location services (for nearby restaurant searches)
- ✅ Custom functions (for integration with your app's search APIs)
- ✅ Real-time conversation
- ✅ Voice activity detection

### Advanced Settings

- **Temperature**: 0.7 (for creative but consistent responses)
- **Max Tokens**: 150 (for concise, helpful responses)
- **Enable Interruptions**: Yes (for natural conversation flow)

## Integration Steps

1. Create the agent with the above settings
2. Copy the Agent ID from the agent dashboard
3. Add it to your environment variables as `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
4. The app will automatically detect the agent ID and enable voice features

## Testing

Once configured, users can:

- Toggle between text and voice modes using the "AI Voice" button
- Speak naturally about food preferences
- Get location-based restaurant recommendations
- Receive recipe suggestions with cooking tips
- Experience seamless voice interactions with visual feedback

The agent will automatically request location permission when needed for restaurant searches and integrate with your existing search APIs.
