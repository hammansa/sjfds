# Project Blueprint: "FDS (Female Driving Service)" - 3D Mobile App

## 1. Overview
(No changes)

## 2. Application Architecture
(No changes)

## 3. Implementation Plan

- **Phase 6: Conditional Certificate Verification (In Progress)**
    - **Objective:** For the 'Hospital Escort' service, add a step to verify the applicant has a required certificate.
    - **Certificates:** '요양보호사' (Caregiver) or '사회복지사' (Social Worker).
    - **Implementation Steps:**
        1.  Add a new, initially hidden section in `index.html` for certificate selection.
        2.  In `main.js`, update the `DriverApplicationHandler` to show this section *only if* the '병원동행' checkbox is selected.
        3.  Modify validation logic: If the '병원동행' service is chosen, the user must select a certificate type before proceeding.
        4.  Update the final submission logic to display a conditional alert, instructing the user to email a copy of their certificate to `admin@fds.com` if they applied for the 'Hospital Escort' service.

## 4. User Journeys

### 4.1. Client (Service Requester) Journey (Completed)
(No changes)

### 4.2. Driver (Partner Applicant) Journey
1.  **App Launch & Select 'Driver Support'**
2.  **Step 1: Fill Basic Info**
3.  **Step 1.5: Complete Phone Authentication**
4.  **Step 2: Select Services & Agree to Terms**
    - User selects desired services (e.g., 'Pet Taxi', 'Hospital Escort').
    - **If 'Hospital Escort' is selected:**
        - A new section appears.
        - User must select either 'Caregiver' or 'Social Worker' certificate.
    - User agrees to the displayed terms.
5.  **Step 3: Review Partnership Agreement** and submit.
6.  **Confirmation & Conditional Instructions:**
    - User receives a standard confirmation message.
    - **If they applied for 'Hospital Escort',** an additional message instructs them to email their certificate to `admin@fds.com`.
