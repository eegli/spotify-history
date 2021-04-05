interface DynamoBaseDoc {
  TableName: string;
}

// Primary key for this table
interface DynamoBaseKeys {
  dateId: string;
}

// For GET operations
export interface DynamoRef extends DynamoBaseDoc {
  Key: DynamoBaseKeys;
}

// For PUT operations
export interface DynamoItem extends DynamoBaseDoc {
  Item: DynamoBaseKeys & DynamoRecordAttrs;
}

// All non-required item attributes
interface DynamoRecordAttrs {
  lastPlayed: number;
  lastPlayedString: string;
  itemCount?: number;
  items?: any;
}
