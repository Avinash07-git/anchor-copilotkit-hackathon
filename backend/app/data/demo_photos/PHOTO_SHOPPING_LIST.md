# 📸 PHOTO SHOPPING LIST — for Avinash

> **What to do:** Grab 8 stock photos from the internet (Unsplash, Pexels, or Google Images "labeled for reuse"). Drop them in this folder with the exact filenames listed. Aim for **5 minutes total.**
>
> **Why:** Rita Sharma's "move-in" and "move-out" photos. The agent pretends to compare them. We don't actually need real diff detection — the agent uses hardcoded analysis for the demo case. The photos just need to *look* convincing on screen.

---

## 🏠 Rita's apartment vibe (so all 8 photos feel like the same place)

- **Style:** Modern San Francisco 2BR apartment (not luxury, not crappy — middle class)
- **Vibe:** Clean, neutral walls (white or light gray), hardwood or laminate floors, minimal furniture
- **NO PEOPLE** in any photo (no faces, no pets — keeps it clean)
- **Landscape orientation** (wider than tall) so they fit the cards nicely

---

## 📥 The 8 photos to grab

### MOVE-IN photos (apartment in pristine condition)

| Filename | Search term that will work | Description |
|---|---|---|
| `bedroom_movein.jpg` | *"empty modern bedroom white walls"* | Empty bedroom, freshly painted white/light walls, no marks, hardwood floor |
| `living_movein.jpg` | *"empty modern living room beige carpet"* | Empty living room, beige or gray carpet, clean condition |
| `kitchen_movein.jpg` | *"clean modern apartment kitchen"* | Small modern kitchen, clean counters, no clutter |
| `hall_movein.jpg` | *"empty apartment hallway white walls"* | Empty hallway with white walls, clean |

### MOVE-OUT photos (same apartment, normal wear after 3 years)

| Filename | Search term that will work | Description |
|---|---|---|
| `bedroom_moveout.jpg` | *"empty bedroom slight wall marks"* OR same vibe as move-in but slightly lived-in | Bedroom looks similar but with subtle scuffs / minor wall marks. **Should NOT look damaged** — just lived-in. |
| `living_moveout.jpg` | *"worn beige carpet apartment"* | Living room with carpet that looks slightly worn / matted from foot traffic. Not stained, just used. |
| `kitchen_moveout.jpg` | *"clean apartment kitchen empty"* | Kitchen — basically the same as move-in (cleaning was done; landlord's $250 charge is bogus) |
| `hall_moveout.jpg` | *"empty apartment hallway"* | Hallway — same as move-in, basically unchanged |

---

## ⚡ Speed shortcut

If picking 8 different images is a pain, you can:
1. Grab **4 nice apartment photos** (one per room: bedroom, living, kitchen, hall)
2. Save each one TWICE — once as `_movein.jpg` and once as `_moveout.jpg`
3. Done. The agent doesn't compare pixel-by-pixel. The visual identity of the photo doesn't matter for the demo.

We can swap to "real" before/after pairs later if we have spare time on Friday.

---

## 📐 Image specs

- **Format:** JPG (small, fast)
- **Size:** ~1200×800 pixels is plenty (don't waste storage)
- **Total weight:** Aim for <500 KB each, <4 MB total

---

## 📂 Where they go

Put all 8 files directly in this folder:
```
data/demo_photos/
├── bedroom_movein.jpg
├── bedroom_moveout.jpg
├── living_movein.jpg
├── living_moveout.jpg
├── kitchen_movein.jpg
├── kitchen_moveout.jpg
├── hall_movein.jpg
└── hall_moveout.jpg
```

Tell me when they're in. I'll wire `read_photo_metadata` to look for these exact filenames.
