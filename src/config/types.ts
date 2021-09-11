// Define the properties of a song that is eventually saved to Dynamo
export interface DynamoHistoryElement {
  name: string;
  id: string;
  // TODO Date?
  playedAt: string;
  artists: {
    artistName: string;
    artistId: string;
    genres: string;
  }[];
}
