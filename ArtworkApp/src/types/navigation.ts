import { Artwork } from './artwork';

export type RootStackParamList = {
  SignIn: undefined;
  Signup: undefined;
  MainApp: undefined;
  ArtworkDetail: { artwork: Artwork };
  Profile: undefined;
  Upload: undefined; 
};

export type TabParamList = {
  Gallery: undefined;
  Upload: undefined;
  Profile: undefined;
  ArtworkDetail: { artwork: Artwork };
};