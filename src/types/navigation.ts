export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Account: undefined;
};

export type ListingStackParamList = {
  PlateEntry: undefined;
  PhotoCapture: undefined;
  Analysis: { jobId: string };
  Review: { listingId: string };
  Export: { listingId: string };
};
