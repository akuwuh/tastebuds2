# TasteBuds: Savor Connections Through Shared Flavor Journeys

## Inspiration
The TasteBuds project was born out of the loneliness that can creep into everyday meals. During a late-night hackathon brainstorming session, our team realized how often we scroll past food photos without truly connecting with the people behind them. We wanted to transform passive likes into conversations that celebrate culture, nostalgia, and experimentation. Drawing inspiration from neighborhood potlucks and global recipe swaps, we envisioned a platform where storytelling and sensory discovery meet.

## Building the Experience
We built TasteBuds on a modern, composable stack to give creators and diners a seamless experience:

1. **Next.js App Router** powers dynamic routes for curated collections and personal tasting journals, keeping navigation buttery smooth.
2. **Supabase** provides real-time presence for communal tasting rooms, so friends see each other join in the moment.
3. **OpenAI Embeddings** help match users by flavor profiles, turning descriptions like “citrusy with a floral finish” into vectors in a shared \(\mathbb{R}^{768}\) space.
4. **ElevenLabs narration** adds an audio layer, letting storytellers voice their tasting notes for accessible, multisensory sharing.

To bring it all together, we wired Tailwind CSS for rapid styling, orchestrated API routes for secure profile syncing, and leaned on Vercel edge functions to deliver low-latency pairings across time zones.

## Challenges We Overcame
- **Flavor Matching Complexity:** Translating poetic food language into structured data required custom token weighting. We iterated with cosine similarity thresholds of \(0.78 \leq \tau \leq 0.92\) before finding the sweet spot that balances serendipity with relevance.
- **Real-Time Cohesion:** Synchronizing live tasting rooms meant wrangling Supabase channels, optimistic UI updates, and graceful reconnection flows for flaky café Wi-Fi.
- **Narration UX:** Integrating audio narration introduced buffering hiccups. We compressed speech segments on the fly and cached them via edge storage to keep playback crisp.

## What We Learned
- **Storytelling drives engagement.** The most active rooms weren’t the ones with the fanciest dishes, but the ones where hosts described the memories behind each bite.
- **Accessibility is multifaceted.** Audio narration, adjustable contrast themes, and keyboard-first controls collectively broadened our audience.
- **Metrics guide iteration.** Instrumenting onboarding funnels and retention cohorts taught us where users hesitated, which informed copy tweaks and tutorial tooltips.

## Looking Ahead
We plan to launch seasonal tasting challenges, integrate smart kitchen devices for live cook-alongs, and open-source our flavor embedding toolkit so other developers can craft culinary communities of their own.

TasteBuds isn’t just about food—it’s about savoring human connection, one shared story at a time.
