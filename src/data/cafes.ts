export type FilterId =
  | "open"
  | "wifi"
  | "outlets"
  | "quiet"
  | "calls"
  | "outdoor";

export type Cafe = {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  distance: string;
  longitude: number;
  latitude: number;
  isOpen: boolean;
  closesAt: string;
  wifi: "Okay" | "Good" | "Great";
  outlets: "None" | "A few" | "Many";
  noise: "Quiet" | "Conversational" | "Lively";
  calls: "Not ideal" | "Brief calls" | "Calls welcome";
  outdoor: boolean;
  freshness: string;
  confirmations: number;
  seatTip: string;
  laptopPolicy: string;
  price: "$" | "$$" | "$$$";
  accessible: boolean;
  color: "green" | "blue" | "amber" | "pink";
  rotation: number;
  submitted?: boolean;
};

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: "open", label: "Open now" },
  { id: "wifi", label: "Great Wi-Fi" },
  { id: "outlets", label: "Outlets" },
  { id: "quiet", label: "Quiet" },
  { id: "calls", label: "Calls OK" },
  { id: "outdoor", label: "Outdoor" },
];

export const CAFES: Cafe[] = [
  {
    id: "juniper",
    name: "Juniper Coffee",
    neighborhood: "Lower Haight",
    address: "611 Sketchbook St",
    distance: "0.2 mi",
    longitude: -122.4282,
    latitude: 37.7726,
    isOpen: true,
    closesAt: "6:00 PM",
    wifi: "Great",
    outlets: "Many",
    noise: "Quiet",
    calls: "Calls welcome",
    outdoor: false,
    freshness: "3 days ago",
    confirmations: 14,
    seatTip: "Window bar near the back has six outlets.",
    laptopPolicy: "Laptops welcome all day",
    price: "$$",
    accessible: true,
    color: "green",
    rotation: -2,
  },
  {
    id: "field-day",
    name: "Field Day Café",
    neighborhood: "Hayes Valley",
    address: "82 Linden Lane",
    distance: "0.4 mi",
    longitude: -122.4234,
    latitude: 37.7768,
    isOpen: true,
    closesAt: "5:00 PM",
    wifi: "Good",
    outlets: "A few",
    noise: "Conversational",
    calls: "Brief calls",
    outdoor: true,
    freshness: "1 week ago",
    confirmations: 8,
    seatTip: "Back wall is calmest after the lunch rush.",
    laptopPolicy: "Laptop-free communal table on weekends",
    price: "$$",
    accessible: true,
    color: "blue",
    rotation: 1,
  },
  {
    id: "north-star",
    name: "North Star Coffee",
    neighborhood: "The Mission",
    address: "149 Valencia Sketch",
    distance: "0.7 mi",
    longitude: -122.4211,
    latitude: 37.7652,
    isOpen: true,
    closesAt: "7:00 PM",
    wifi: "Good",
    outlets: "Many",
    noise: "Quiet",
    calls: "Not ideal",
    outdoor: false,
    freshness: "2 months ago",
    confirmations: 3,
    seatTip: "The long table is best for focused work.",
    laptopPolicy: "90-minute limit after 5 PM",
    price: "$$",
    accessible: false,
    color: "amber",
    rotation: -1,
  },
  {
    id: "paper-plane",
    name: "Paper Plane",
    neighborhood: "SoMa",
    address: "208 Folsom Doodle",
    distance: "0.8 mi",
    longitude: -122.4127,
    latitude: 37.7744,
    isOpen: false,
    closesAt: "4:00 PM",
    wifi: "Great",
    outlets: "A few",
    noise: "Lively",
    calls: "Calls welcome",
    outdoor: true,
    freshness: "5 days ago",
    confirmations: 11,
    seatTip: "Patio has shade and the strongest signal.",
    laptopPolicy: "Laptops welcome except at the front bar",
    price: "$$$",
    accessible: true,
    color: "pink",
    rotation: 2,
  },
  {
    id: "the-nook",
    name: "The Nook",
    neighborhood: "Duboce Triangle",
    address: "37 Noe Notebook",
    distance: "0.9 mi",
    longitude: -122.4338,
    latitude: 37.7698,
    isOpen: true,
    closesAt: "8:00 PM",
    wifi: "Okay",
    outlets: "A few",
    noise: "Conversational",
    calls: "Brief calls",
    outdoor: false,
    freshness: "yesterday",
    confirmations: 6,
    seatTip: "Two tiny tables upstairs stay quiet.",
    laptopPolicy: "Laptops welcome after 10 AM",
    price: "$",
    accessible: false,
    color: "blue",
    rotation: -3,
  },
  {
    id: "good-day",
    name: "Good Day Roasters",
    neighborhood: "Potrero Hill",
    address: "410 Mariposa Margin",
    distance: "1.1 mi",
    longitude: -122.4008,
    latitude: 37.7646,
    isOpen: true,
    closesAt: "6:30 PM",
    wifi: "Great",
    outlets: "Many",
    noise: "Lively",
    calls: "Calls welcome",
    outdoor: true,
    freshness: "2 weeks ago",
    confirmations: 9,
    seatTip: "Side patio works well for longer calls.",
    laptopPolicy: "Laptops welcome all day",
    price: "$$",
    accessible: true,
    color: "green",
    rotation: 1,
  },
];

export function cafeMatchesFilters(cafe: Cafe, filters: Set<FilterId>) {
  return [...filters].every((filter) => {
    if (filter === "open") return cafe.isOpen;
    if (filter === "wifi") return cafe.wifi === "Great";
    if (filter === "outlets") return cafe.outlets !== "None";
    if (filter === "quiet") return cafe.noise === "Quiet";
    if (filter === "calls") return cafe.calls === "Calls welcome";
    return cafe.outdoor;
  });
}
