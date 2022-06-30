// Define the properties of a song that is eventually saved to Dynamo
export interface DynamoHistoryElement {
  name: string;
  id: string;
  playedAt: string;
}
