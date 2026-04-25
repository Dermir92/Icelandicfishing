# Veidistadur MVP Foundation

## Sharp Product Summary

Veidistadur is a mobile-first fishing discovery platform for Iceland that turns fragmented, hard-to-compare fishing information into one trustworthy map-based decision tool, helping people answer a single practical question fast: where should I go fishing based on my preferences, ability, budget, timing, and location.

## Core User Problem

Fishing information in Iceland is fragmented across permit sites, club pages, tourism pages, and Veidikortid-style resources. Users do not just need more listings; they need a fast way to compare suitability across many places at once.

The pain points:

- discovery is spread across multiple sources
- filters are inconsistent or missing
- suitability is hard to judge quickly
- mobile planning on the road is clumsy
- users often need to open many tabs to compare similar spots

## MVP Definition

The MVP is a map-first discovery experience with realistic mock data that lets users:

- browse Iceland fishing locations on a map
- search by name, region, fish species, or tags
- combine practical filters
- compare multiple locations through concise cards
- open a trustworthy detail page for each spot
- click through to external source links for booking or more information

The MVP is intentionally not:

- a live scraping platform
- a booking engine
- a review community
- a weather and road intelligence system
- a personalized recommendation engine with accounts

## Product Decisions And Why

1. Map-first homepage
   The map is the primary decision surface. Users are place-driven first, then detail-driven.

2. Mobile-first bottom-sheet results
   On mobile, users need to keep geographic context while browsing options. A bottom sheet lets the map remain visible while results stay tappable.

3. Multi-filtering focused on suitability
   Filters prioritize decision quality over taxonomy completeness: water type, fish species, region, access, season, price cues, Veidikortid inclusion, family-friendly, and boat access.

4. High-trust cards and detail pages
   Each spot needs to communicate “is this right for me?” in seconds. That means concise summaries, season, access, species, and source credibility before longer editorial copy.

5. Mock data now, integration-ready structure later
   The first version should prove the product experience without depending on scraping complexity or partner APIs. Data types and source models should still anticipate real ingestion later.

6. Discovery product, not transaction product
   Booking links belong in the experience, but the MVP should avoid building payments, inventory, or permit flow too early.

7. Premium but restrained visual language
   The product should feel calm, credible, and Icelandic in spirit. That means strong typography, muted natural colors, clean density, and almost no ornamental chrome.

## Main User Flows

### 1. Discover nearby or relevant spots

- user opens homepage
- sees Iceland map with visible pins
- uses search and filters
- scans bottom-sheet results
- opens a promising spot

### 2. Compare options for a specific plan

- user filters by water type, species, season, and access
- user reviews compact spot cards
- user compares pricing cues, Veidikortid inclusion, and rules
- user opens one or two detail pages

### 3. Decide whether a spot suits them

- user lands on detail page
- reads practical summary, season, access, rules, and amenities
- confirms fish species and external sources
- clicks through for more information or booking

## Information Architecture

### Main Pages

- `/` map-first discovery homepage
- `/spots/[slug]` fishing spot detail page
- `/about` product explanation and methodology
- `/admin` future-facing placeholder for data ingestion and curation

### Navigation Model

- top app bar with brand, primary links, and quick action
- mobile-first sticky utility bar inside discovery view
- bottom-sheet results for browsing

### Mobile Navigation Approach

- keep global navigation minimal
- homepage is the working surface
- filters open in a drawer
- selected spot details stay lightweight until the user opens the full page

### Map Interaction Model

- pan and zoom map
- tap markers to preview locations
- sync marker selection with results list
- result card tap recenters and highlights marker

### Filter Interaction Model

- quick filter chips for common intents
- advanced filter drawer for combined filtering
- show active filter count
- make reset obvious and one tap

### Search Behavior

- one search field
- matches name, region, fish species, and descriptive tags
- results update instantly without page reload

### Detail Page Structure

- hero summary
- practical overview
- season and pricing
- access and suitability
- rules and amenities
- nearby locations
- trusted external sources

## Feature Prioritization

### Must-have MVP

- map-based discovery
- search
- combined filters
- believable spot cards
- spot detail pages
- Veidikortid flag
- external source links
- season, access, fish species, and pricing cues

### Good Next Features

- favorites
- compare tray
- nearby spot recommendations based on current map extent
- route-aware region browsing
- richer photos and editorial guides

### Future Advanced Features

- live data ingestion from partners
- weather integration
- road condition integration
- permit availability
- user reviews
- trip planning and itinerary support
- personalized recommendations

## Included Now Vs Later

### Included Now

- strong frontend foundation
- mock dataset across Iceland
- typed data model
- mobile-first discovery UX
- filters that reflect real decision criteria

### Later

- auth
- backend ingestion pipelines
- booking aggregation logic
- account persistence
- operational admin tools
