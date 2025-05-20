export interface Artwork {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    artistId: string;
    artistName: string;
    category?: string;
    createdAt: string;
    likes: string[];
    comments: number;
  }