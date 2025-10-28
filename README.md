# AI travel companion

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/sai-myat-min-hans-projects/v0-ai-travel-companion)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/zlNnPnBwj2b)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/sai-myat-min-hans-projects/v0-ai-travel-companion](https://vercel.com/sai-myat-min-hans-projects/v0-ai-travel-companion)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/zlNnPnBwj2b](https://v0.app/chat/projects/zlNnPnBwj2b)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

---

# 🧭 Sprint 2 Test Plan – New Life AI Travel Companion

**Project:** New Life AI Travel Companion  
**Sprint:** 2  
**Date Created:** October 21, 2025  
**Author(s):** New Life Development Team  
**Purpose:** Ensure that the core AI travel features work correctly, efficiently, and deliver an excellent user experience across all supported devices.

---

## 1. Introduction & Scope

This Sprint 2 Test Plan defines test cases for the new and updated features in the AI Travel Companion app.  
These include **AI-driven trip generation**, **itinerary visualization**, **budget optimization**, and **account management**.  
The plan supports both **manual and automated testing**.

### Testing Objectives
- Validate that AI-generated itineraries are accurate and user-friendly.  
- Verify that the user can log in, create a trip, and view suggestions.  
- Ensure smooth UI/UX interactions and proper error handling.

---

## 2. **Feature : User Authentication**


**User Story:**  
_As a traveler, I want to sign up and log in securely so that I can access my saved trips and itineraries._

| Test ID | Scenario | Steps | Expected Result |
|----------|-----------|--------|-----------------|
| **UA-001** | (Happy Path) Successful login | 1. Go to Login.<br>2. Enter valid email + password.<br>3. Click Login. | Dashboard loads; user info shown. |
| **UA-002** | (Sad Path) Invalid password | Enter wrong password; click Login. | Error “Invalid credentials.” |
| **UA-003** | (Sad Path) Empty fields | Leave fields blank; click Login. | Error “Email and password required.” |
| **UA-004** | (Happy Path) Signup | Enter new email + password and submit. | Account created; redirect to dashboard. |
| **UA-005** | (Sad Path) Duplicate email | Try to sign up with existing email. | Error “Email already registered.” |

---

## 3. Feature: Trip Creation

**User Story:**  
_As a traveler, I want to create a trip with destination, dates, budget, and preferences so that I can later view and generate an AI itinerary within that trip page._

| Test ID | Scenario | Steps | Expected Result |
|----------|-----------|--------|-----------------|
| **TC-001** | (Happy Path) Successful trip creation | 1. Click My Trips → Create New Trip.<br>2. Fill out Trip Name, Destination, Dates, Travelers, and Budget.<br>3. Click Create Trip. | Trip is created successfully and displayed under “My Trips.” |
| **TC-002** | (Sad Path) Missing destination | Leave Destination blank → Click Create Trip. | Error message “Destination is required.” |
| **TC-003** | (Sad Path) Invalid date range | Enter End Date before Start Date. | Validation error “End date must be after start date.” |
| **TC-004** | (Sad Path) Empty Trip Name | Leave Trip Name blank. | Validation “Trip name required.” |
| **TC-005** | (Edge Case) Invalid budget format | Input text “one thousand.” | Error “Budget must be numeric.” |
| **TC-006** | (Edge Case) Large budget input | Enter 1,000,000 THB. | Field handles large value successfully. |
| **TC-007** | (UI Check) Responsive modal | Open on mobile device. | Layout adjusts properly; no clipping. |

---

## 4. Feature: AI Itinerary Generation (Inside Created Trip)

**User Story:**  
_As a traveler, I want to generate an AI itinerary directly from within a created trip so I can view tailored activities based on my selected trip’s data._

**Precondition:**  
User is logged in and has already created a trip (e.g., “Chiangrai”).

| Test ID | Scenario | Steps | Expected Result |
|----------|-----------|--------|-----------------|
| **AI-001** | (Happy Path) Generate itinerary from trip page | 1. Open My Trips → Click a Trip (e.g., Chiangrai).<br>2. Click Generate AI Itinerary. | AI itinerary is generated using the trip details (destination, dates, budget). |
| **AI-002** | (Sad Path) AI service unavailable | Click Generate AI Itinerary when API is down. | Error message “Service temporarily unavailable.” |
| **AI-003** | (Edge Case) Very long trip duration | Trip spans 30+ days. | AI response loads within acceptable time (< 60 seconds). |
| **AI-004** | (UI Check) Progress and completion | Observe button/loading states. | “Generating…” indicator shown; replaced by results when done. |
| **AI-005** | (Usability) Regenerate plan | Click Generate AI Itinerary again after generation. | Existing plan replaced or updated. |
| **AI-006** | (Edge Case) Missing trip data | If trip data incomplete (e.g., no destination). | Prompt user to edit trip before generating. |

---

## 5. Feature: Budget Optimization

**User Story:**  
_As a traveler, I want to see suggestions that fit my budget._

| Test ID | Scenario | Steps | Expected Result |
|----------|-----------|--------|-----------------|
| **BO-001** | (Happy Path) Apply budget | Input budget = “50,000 THB”, click Optimize. | Shows list of hotels, flights under budget. |
| **BO-002** | (Sad Path) Non-numeric budget | Enter text value. | Error “Budget must be a number.” |
| **BO-003** | (Edge Case) Low budget | Enter 1 THB. | “No trips available in this range.” |
| **BO-004** | (UI Check) Responsive form | Resize screen to mobile. | Budget and result cards display well. |

---

## 6. Feature: Itinerary Viewer

**User Story:**  
_As a traveler, I want to see my AI-generated itinerary day by day._

| Test ID | Scenario | Steps | Expected Result |
|----------|-----------|--------|-----------------|
| **IV-001** | (Happy Path) View itinerary | After generation, open Itinerary tab. | Displays daily activities with maps/times. |
| **IV-002** | (Sad Path) No itinerary yet | Open tab without generating plan. | “Generate plan first.” message. |
| **IV-003** | (UI Check) Responsive view | Check on mobile. | No overflow; buttons accessible. |

---

## 7. Feature: Feedback & Save/Share Trip

**User Story:**  
_As a traveler, I want to save and share itineraries and provide feedback._

| Test ID | Scenario | Steps | Expected Result |
|----------|-----------|--------|-----------------|
| **FS-001** | (Happy Path) Save trip | Click Save Trip after generation. | Trip stored in user profile. |
| **FS-002** | (Happy Path) Share trip | Click Share Link. | Unique URL generated. |
| **FS-003** | (Sad Path) Save offline | Disconnect internet, click Save. | Error “Connection lost.” |
| **FS-004** | (Edge Case) Share unsaved trip | Click Share before saving. | Prompt “Please save first.” |
| **FS-005** | (Usability) Feedback form | Submit rating + comment. | Feedback sent successfully. |

---

## Notes

- All features are tested for **UI responsiveness**, **error handling**, and **usability feedback**.  
- Test results can be logged using a test management tool or spreadsheet for tracking.

---

** Last Updated:** October 2025  
**Author:** Travel Planner Dev Team 
