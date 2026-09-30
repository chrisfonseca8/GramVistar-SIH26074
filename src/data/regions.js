/**
 * Jharkhand's districts, and Bokaro district's blocks — used only to
 * drive the district/block picker Scientist and Government-portal roles
 * see right after logging in. Every dataset this app loads is scoped to
 * Chas Block in Bokaro District; every other district/block is listed
 * for a realistic picker but has no data behind it.
 */
// "Bokaro" is listed first (rather than alphabetically) since it's the
// only district with real data behind it — putting it at the top saves
// the scientist/authority a scroll every single login.
export const JHARKHAND_DISTRICTS = [
  "Bokaro",
  "Chatra",
  "Deoghar",
  "Dhanbad",
  "Dumka",
  "East Singhbhum",
  "Garhwa",
  "Giridih",
  "Godda",
  "Gumla",
  "Hazaribagh",
  "Jamtara",
  "Khunti",
  "Koderma",
  "Latehar",
  "Lohardaga",
  "Pakur",
  "Palamu",
  "Ramgarh",
  "Ranchi",
  "Sahibganj",
  "Seraikela Kharsawan",
  "Simdega",
  "West Singhbhum",
];

/** The only district with data behind it in this environment. */
export const DISTRICT_WITH_DATA = "Bokaro";

// Same reasoning as above: "Chas" first since it's the only block with
// real data behind it.
export const BOKARO_BLOCKS = [
  "Chas",
  "Bermo",
  "Bokaro Sadar",
  "Chandankiyari",
  "Chandrapura",
  "Gomia",
  "Jaridih",
  "Kasmar",
  "Nawadih",
  "Peterwar",
];

/** The only block with data behind it in this environment. */
export const BLOCK_WITH_DATA = "Chas";
