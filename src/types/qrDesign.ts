export type HexColor = `#${string}`;

export interface QRDesign {
  id: number;

  // Foreign keys
  team_id: number;
  user_id: number | null;

  // The name of the design
  name: string | null;

  // Color and background color
  color: HexColor;
  background_color: HexColor;

  // Error correction level
  error_correction_level: "low" | "medium" | "quartile" | "high";

  // Size and margin
  size: number;
  margin: number;

  // Round block size mode
  round_block_size_mode: "enlarge" | "margin" | "shrink" | "none";

  // Block shape
  block_shape:
    | "circle"
    | "rounded"
    | "classy"
    | "classy-rounded"
    | "square"
    | "extra-rounded";

  // Corner dot shape
  corner_dot_shape: "circle" | "square";

  // Corner shape
  corner_shape: "square" | "rounded" | "circle";

  // Logo details
  logo: string | null;
  logo_size: number | null;
  logo_punchout_background: boolean;

  // Scan check details
  last_scan_check_at: Date | null; // ISO string format for date
  is_scanable: boolean | null;

  was_automatically_generated: boolean;

  // Timestamps
  created_at: Date; // ISO string format for date
  updated_at: Date; // ISO string format for date
}
