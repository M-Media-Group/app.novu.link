import type { Badge } from "./badge.js";

// Define a type for raw values used in select options
export type Primitive = string | number | boolean | null | undefined | boolean;

// A value that can be safely stored in the `raw` field
export type PossibleRawValue = Primitive
  | Primitive[]
  | object
  | undefined;

// A valid raw object for a SelectOptionObject
export type PossibleRecord = Record<string, PossibleRawValue | PossibleRawValue[]> | undefined;

export interface SelectOptionObject<T extends PossibleRecord = PossibleRecord> {
  id: string | number;
  render: string;
  disabled?: boolean;
  raw?: T | undefined;
  badge?: Badge | undefined;
}

// Normalised select uses a string ID and carries over the raw object (without an id)
export type NormalisedOptionObject<T extends SelectOptionObject = SelectOptionObject> =
  Omit<T, "id"> & {
    id: string;
  };

// The SelectOption can be a simple string or an object with metadata
export type SelectOption<T extends PossibleRecord = PossibleRecord> =
  | string
  | SelectOptionObject<T>;
