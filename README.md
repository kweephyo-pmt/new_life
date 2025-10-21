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
_As a traveler, I want to sign up and log in securely so that I can access my saved itineraries and preferences._

**Preconditions:**  
User has access to the internet and the app’s login page.

| Test ID | Scenario | Steps | Expected Result |
|----------|-----------|--------|-----------------|
| UA-001 | (Happy Path) Successful login | 1. Navigate to login page.<br>2. Enter valid email and password.<br>3. Click **Login**. | Dashboard loads successfully; user info displayed. |
| UA-002 | (Sad Path) Invalid password | Enter wrong password and click **Login**. | Error message “Invalid credentials” appears; login denied. |
| UA-003 | (Sad Path) Empty fields | Leave both fields blank, click **Login**. | Error “Email and password required” displayed. |

---

## 3. **Feature : AI Trip Planner**

**User Story:**  
_As a traveler, I want to input my destination and dates to generate an AI-based itinerary, so I can plan efficiently._

**Preconditions:**  
User logged in; API connected to AI model.

| Test ID | Scenario | Steps | Expected Result |
|----------|-----------|--------|-----------------|
| TP-001 | (Happy Path) Generate AI itinerary | 1. Enter destination “Tokyo”.<br>2. Set travel dates.<br>3. Click **Generate Plan**. | AI returns itinerary with activities, weather, and local tips. |
| TP-002 | (Sad Path) Missing input fields | Leave destination blank, click **Generate**. | Error “Destination is required” displayed. |
| TP-003 | (Edge Case) Long destination name | Input destination > 50 characters. | Validation prevents submission; message prompts shorter entry. |

---

## 4. **Feature : Budget Optimization**

**User Story:**  
_As a traveler, I want the app to suggest trips based on my budget so I can make cost-effective decisions._

| Test ID | Scenario | Steps | Expected Result |
|----------|-----------|--------|-----------------|
| BO-001 | (Happy Path) Apply budget | Input “Budget = $1000”, click **Optimize**. | System displays list of hotels, flights, and activities under budget. |
| BO-002 | (Sad Path) Non-numeric budget | Enter “One thousand” and click **Optimize**. | Error “Budget must be a number” displayed. |
| BO-003 | (Edge Case) Very low budget | Enter $1 and click **Optimize**. | Message: “No trips available within this range.” |

---

## 5. **Feature : Itinerary Viewer**

**User Story:**  
_As a traveler, I want to view my generated itinerary day by day so I can visualize my plan._

| Test ID | Scenario | Steps | Expected Result |
|----------|-----------|--------|-----------------|
| IV-001 | (Happy Path) View itinerary | After generating plan, open itinerary tab. | Displays daily activities, time slots, and map locations. |
| IV-002 | (Sad Path) No itinerary available | Access itinerary without generating one. | Message “No itinerary found. Please generate first.” |
| IV-003 | (UI Check) Responsive layout | Open itinerary on mobile view. | Layout adjusts without clipping or scroll issues. |

---

## 6. **Feature : Feedback & Save Trip**

**User Story:**  
_As a traveler, I want to save or share my itinerary and provide feedback for improvement._

| Test ID | Scenario | Steps | Expected Result |
|----------|-----------|--------|-----------------|
| FS-001 | (Happy Path) Save trip | Click **Save Trip** after generation. | Trip successfully stored in user profile. |
| FS-002 | (Happy Path) Share itinerary | Click **Share Link**. | Unique shareable link generated. |
| FS-003 | (Sad Path) Save failure (offline) | Disable internet and click **Save**. | Error “Connection lost” displayed; no data saved. |

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
