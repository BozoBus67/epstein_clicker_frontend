> AI-generated, proofread and edited (by human).

# Auction House

In-game marketplace where users list cookies or tokens and buy/cancel listings posted by others.

## Components

Defined in `auction_house_screen.jsx`, in order of appearance — top-down by the JSX hierarchy starting from the screen:

- `Auction_House_Screen` — page wrapper. Owns `listings` + `refresh`.
- `Auction_House_Screen_Topbar` — page header (title + back button).
- `Auction_House_Screen_Body` — listings grid; also owns selection state and renders the manage-listing modal.
- `Auction_Slot` — one listing card.
- `Refresh_Listings_Button` — bottom-left ↻ for manual reload.
- `Add_Auction_Button` — fixed bottom-right "+ Add Auction" trigger.
- `Create_Listing_Manager` — bundles the Add button + create-modal + its open/close state.
- `Create_Listing_Modal` — form to create a new listing.
- `Manage_Listing_Modal` — routes between Buy and Cancel by ownership of the selected listing.
- `Buy_Listing_Modal` — confirm purchase of someone else's listing.
- `Cancel_Listing_Modal` — confirm cancellation of own listing.

## Modals on this screen

Three modals are reachable, with **deliberately asymmetric ownership** — the structure mirrors how each modal relates to the listings grid rather than hiding the coupling.

- **Create Listing**
  - Trigger: "Add Auction" button (fixed bottom-right).
  - State lives in: `Create_Listing_Manager` (sibling of the body).

- **Buy Listing**
  - Trigger: clicking a listing card you don't own.
  - State lives in: `Auction_House_Screen_Body` (`selected_listing` state).

- **Cancel Own Listing**
  - Trigger: clicking a listing card you do own.
  - State lives in: `Auction_House_Screen_Body` (same `selected_listing` state).

Buy and Cancel share one piece of state and branch on ownership inside `Manage_Listing_Modal`. Because their trigger lives in the body, the selection state and the modal also live in the body — they are *not* siblings of the screen. That's why the screen's JSX shows only `<Create_Listing_Manager />` explicitly: the other two modal handlings are hidden inside `<Auction_House_Screen_Body />`.

**Why asymmetric:** state is co-located with the thing that triggers it. Creating a listing has nothing to do with browsing existing ones; buy/cancel intrinsically do.

## Data flow

- The screen owns `listings` (the array) and `refresh()` (re-fetch).
- `refresh()` runs:
  - On mount.
  - When the user clicks `Refresh_Listings_Button` (bottom-left ↻).
  - After a successful create (via `on_action_done` passed to `Create_Listing_Manager`).
  - After a successful buy or cancel (via `on_action_done` passed to the body).

