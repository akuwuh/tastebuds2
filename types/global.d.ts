export {};

interface RecipeNutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

interface RecipeDisplayData {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  difficulty: "Easy" | "Medium" | "Hard";
  cookTime: string;
  prepTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  image?: string;
  nutrition?: RecipeNutritionInfo;
  tags?: string[];
}

interface RecipeDisplayQueueItem {
  id: string;
  recipes: RecipeDisplayData[];
  searchQuery?: string;
  dietary?: string[];
  timestamp: number;
}

interface BookingRestaurantInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  cuisine: string;
  rating?: number;
  image?: string;
}

interface BookingDetails {
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

interface RestaurantBookingData {
  restaurant: BookingRestaurantInfo;
  booking: BookingDetails;
  confirmationNumber?: string;
  status: "pending" | "confirmed" | "cancelled";
}

interface BookingDisplayQueueItem {
  id: string;
  bookings: RestaurantBookingData[];
  searchQuery?: string;
  timestamp: number;
}

declare global {
  var recipeDisplayQueue: RecipeDisplayQueueItem[] | undefined;
  var bookingDisplayQueue: BookingDisplayQueueItem[] | undefined;

  interface SpeechRecognitionResultAlternative {
    transcript: string;
    confidence: number;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionResultAlternative;
    [index: number]: SpeechRecognitionResultAlternative;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    continuous?: boolean;
    onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
    onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    start(): void;
    stop(): void;
    abort(): void;
  }

  interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
  }

  var SpeechRecognition: SpeechRecognitionConstructor | undefined;
  var webkitSpeechRecognition: SpeechRecognitionConstructor | undefined;
}

