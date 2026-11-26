# ShopVerse — React Native E-Commerce Demo (`wrathcode_ecommerce`)

A full-featured, **frontend-only** shopping app built with the React Native CLI, implementing the
*ShopVerse E-Commerce App Requirements v1.0* document. Every flow behaves as if a real server
exists, but all data comes from local mock files and user actions are stored on the device.

| | |
|---|---|
| Framework | React Native 0.88 (CLI, New Architecture) + TypeScript (strict) |
| Navigation | React Navigation 7 — native stack + bottom tabs, deep-link config |
| State | Redux Toolkit + redux-persist (AsyncStorage) + listener middleware |
| Forms | React Hook Form + Yup |
| Icons | `@react-native-vector-icons/ionicons` |
| Tests | Jest unit tests for price, coupon, delivery, order-status, cart and validators |

---

## Getting started

```bash
npm install
cd ios && LANG=en_US.UTF-8 pod install && cd ..
npm start          # Metro
npm run ios        # or: npm run android
```

Other scripts:

```bash
npm test            # unit tests
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run mock:generate   # regenerate src/mock/*.json (deterministic)
```

### Demo credentials (sales team)

| What | Value |
|---|---|
| Mobile login | any valid number (e.g. **9876543210** = demo account), OTP **1234** |
| Email login | **demo@shopverse.app / Demo@123** ("Use demo account" button fills it) |
| Payment failure | UPI **fail@upi**, or card **4111 1111 1117 0000** (Luhn-valid, ends in 0000) |
| Test card that succeeds | `4111 1111 1111 1111`, any future expiry, any 3-digit CVV |
| Not serviceable pincode | **999999** |
| Coupons | WELCOME10, SAVE100, FREESHIP, FASHION20, MEGA500, EXPIRED50 |

> Card numbers must pass the Luhn check, so use the failure card above rather than an arbitrary number ending in 0000.

The demo account (Riya Sharma) ships with **2 addresses, 4 past orders in different states and
6 wishlist items** (two with a price-drop tag). Use **Account → Settings → Reset demo data** before
each client demo, and **Order tracking speed → Fast** to see orders move every few minutes.

---

## Brand & design

The UI follows the **Wrathcode** logo palette — royal violet `#7C03B2`, magenta `#DE24F8`,
deep plum `#410574` / `#54018B`, night navy `#09101C` (`src/theme/colors.ts → brand`).

* **Linear gradients** come from React Native's native `experimental_backgroundImage`
  (`linear-gradient(...)`, New Architecture), via `linear(stops, angle)` in `src/theme/gradients.ts`.
  No extra native library is needed. They are used on primary/secondary buttons, the Home header, banners,
  product image tiles, badges, the checkout stepper, the price slider, the card preview, the avatar, splash and onboarding.
* **Logo**: a white shopping bag with a gradient gem, sitting on a gradient tile with a Wrathcode-style swoosh
  (`src/components/Logo.tsx`).
* **App icon**: `scripts/generate-app-icon.swift` draws the same mark with CoreGraphics. The output is in `assets/brand/`.
  It is installed into `ios/.../AppIcon.appiconset` (single 1024 px) and `android/.../mipmap-*`.
  Regenerate with `swift scripts/generate-app-icon.swift assets/brand/app-icon-1024.png`.

### Android specifics

* **Font:** Roboto, bundled in `android/app/src/main/assets/fonts` (copied from `@expo-google-fonts/roboto`, OFL).
  `AppText` picks the right weight file. iOS keeps the system font.
* **Icon:** adaptive launcher icon in `mipmap-anydpi-v26`, with gradient background and white bag foreground,
  so launchers never crop it.
* **Splash:** the Android 12+ system splash is branded (`values-v31/styles.xml`): dark navy background,
  violet circle, white bag.
* The "nearby devices" permission prompt on debug builds comes from React Native's dev server support.
  It does not appear in release builds.

## Architecture

```
src/
├── app/            App root: providers, splash/bootstrap, navigation container
├── config/         rules.ts (every business number from SRD §7), app.ts (brand, demo creds)
├── theme/          colours (light + dark), typography (5 sizes), spacing, shadows, makeStyles
├── i18n/           en.ts — all user-facing copy (UI ready for more languages)
├── types/          Domain models (SRD §8.2)
├── mock/           JSON "database" — ONLY services may import it
├── services/       Fake API layer: Promise-based, 300–800 ms delay, same signatures a real API would have
├── store/          Redux slices, selectors, thunks, listener middleware, persist config
├── navigation/     Root stack, tab stacks, typed params, deep-link config
├── hooks/          useAsync, useDebounce, useRequireAuth, useCompleteLogin, useOrderSync
├── utils/          price, coupon, delivery, orderStatus, validators, formatters, schemas, toast
├── components/     Reusable UI kit (Button, ProductCard, PriceTag, Rating, Stepper, EmptyState, …)
└── screens/        One folder per feature (auth, home, search, listing, product, cart, checkout, orders, account, support)
```

### Key design rules

* **Fake API layer (SRD §3.2).** Screens never read JSON. They call e.g.
  `productService.getProducts(query)`, which filters / sorts / paginates mock data, waits a random
  300–800 ms and returns a deep-cloned result. For Phase 2 only the inside of `src/services/*` changes.
* **Server vs client state.** `services/db.ts` plays the backend: live stock levels, registered users,
  user-written reviews (persisted separately). Redux holds client state: session, carts and wishlists
  (keyed per owner so the guest cart merges on login), orders, addresses, settings, history.
* **Business rules in one place.** `src/config/rules.ts` holds thresholds (free delivery ₹499,
  express ₹99, COD ₹10 / ₹10,000 cap, max qty 5, OTP rules, status timings…). Pure functions in
  `src/utils` implement the logic and are unit-tested.
* **Coupon auto-revalidation.** A listener middleware re-checks the applied coupon whenever the cart or
  delivery type changes and removes it with a toast if conditions no longer hold (SRD §7.3).
* **Time-based order status (SRD §7.7).** `utils/orderStatus.ts` derives status + history from the
  placement time and the *Demo speed* setting; `useOrderSync` recomputes on foreground / interval and
  raises a local notification for every change.
* **Guest → login → back (Flow E).** `useRequireAuth` remembers the pending action; the root navigator
  drops auth screens as soon as a user exists, so the guest lands back where they were with the cart kept.
* **Images.** Products, categories, banners and onboarding use real product photos on white backgrounds
  (Amazon-style). They come from [DummyJSON](https://dummyjson.com), a free demo catalogue, plus
  [Open Library](https://openlibrary.org) covers for books. The URLs are listed in
  `scripts/data/product-photos.json`. Photos load over the network: Android caches them on disk, and
  `ProductImage` shows a placeholder while loading or offline. Brand names stay fictional.
* **No new native deps for UX.** Bottom sheets, range slider, carousel, toasts, fly-to-cart and success
  animations use the built-in Animated API, keeping the build lean on the New Architecture.

### Screen map (SRD §4.2)

| # | Screen | File |
|---|---|---|
| 1–2 | Splash, Onboarding | `screens/splash`, `screens/onboarding` |
| 3–7 | Login (mobile), OTP, Email login, Sign up, Forgot/Reset password, Profile setup | `screens/auth` |
| 8, 40 | Home, Deals & Offers | `screens/home` |
| 9–12 | Search, PLP, Filter sheet, Sort sheet | `screens/search`, `screens/listing` |
| 13–14 | Categories, Sub-categories | `screens/categories` |
| 15–17 | Product details, All reviews, Image zoom gallery | `screens/product` |
| 18 | Wishlist | `screens/wishlist` |
| 19–20 | Cart, Apply coupon | `screens/cart` |
| 21–27 | Checkout address / delivery / payment / card & UPI / review, Add-edit address, Processing, Success/Failure | `screens/checkout` |
| 28–33 | My orders, Order details, Track, Cancel, Return/Replace, Write review | `screens/orders` |
| 34–39 | Account, Edit profile, Addresses, Saved cards, Notifications, Settings, About/Legal | `screens/account` |
| 38 | Help / FAQ, Support chat | `screens/support` |

### Deep links

`shopverse://product/p012`, `shopverse://orders/<id>`, `shopverse://cart`, `shopverse://search` …
(see `src/navigation/linking.ts`; registered in Info.plist and AndroidManifest).

---

## Deviations from the SRD (and why)

| SRD suggestion | Implemented as | Reason |
|---|---|---|
| Reanimated / Lottie animations | React Native `Animated` (fly-to-cart, heart pop, confetti success, skeleton shimmer) | Fewer native dependencies on RN 0.88; swap in Lottie later if a designer supplies files |
| Inter / Poppins font | Roboto (bundled, Android) with a 5-size type scale in `theme/typography.ts` | Client asked for Roboto |
| Price range slider library | Custom dual-thumb `RangeSlider` (PanResponder) | No native module required |

## Phase 2 (backend)

Replace the bodies of `src/services/*.ts` with HTTP calls (keep signatures), move `db.ts` concerns
to the server, and keep everything else unchanged.
