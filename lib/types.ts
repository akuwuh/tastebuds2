export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  error?: boolean;
}

export enum ConversationMode {
  Idle = "IDLE",
  Listening = "LISTENING",
  Processing = "PROCESSING",
  Speaking = "SPEAKING",
}

export type ActiveFeature = "recipe" | "maps" | "order" | null;

export type FeatureIntent =
  | "idle"
  | "recipe:suggest"
  | "restaurant:prompt"
  | "restaurant:cuisine"
  | "restaurant:radius"
  | "restaurant:results"
  | "order:prompt"
  | "order:select"
  | "order:menu"
  | "order:cart"
  | "order:complete";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RecipeSearchResult {
  title: string;
  url: string;
  image: string;
  source: string;
  rating?: number;
  totalTime?: string;
}

export interface RestaurantSearchResult {
  id: string;
  name: string;
  address: string;
  rating: number;
  userRatingsTotal?: number;
  location: Coordinates;
  reviewSummary: string;
  placeUrl: string;
}

export interface DeliveryRestaurant extends RestaurantSearchResult {
  etaMinutes: number;
  deliveryFee: string;
}

export interface MockMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
}

export interface MockCartItem extends MockMenuItem {
  quantity: number;
}

export type RecipeFeaturePayload = {
  type: "recipe";
  query: string;
  results?: RecipeSearchResult[];
};

export type RestaurantFeaturePayload = {
  type: "maps";
  cuisine?: string;
  radius?: number;
  location?: Coordinates;
  results?: RestaurantSearchResult[];
  stage: "prompt" | "searching" | "results";
};

export type OrderFeaturePayload = {
  type: "order";
  stage: "prompt" | "restaurants" | "menu" | "cart" | "confirmation";
  restaurants?: DeliveryRestaurant[];
  selectedRestaurant?: DeliveryRestaurant;
  menu?: MockMenuItem[];
  cart?: MockCartItem[];
};

export type FeaturePayload =
  | RecipeFeaturePayload
  | RestaurantFeaturePayload
  | OrderFeaturePayload;

export interface ChatIntentResponse {
  intent: FeatureIntent;
  feature: ActiveFeature;
}

export interface ChatApiResponse {
  reply: string;
  intent?: ChatIntentResponse;
  featurePayload?: FeaturePayload;
}

