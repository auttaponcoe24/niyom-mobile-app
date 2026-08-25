# niyom-mobile-app

Expo (React Native) field app for Niyom — meter reading and payment collection.

## Auth

- Phone OTP via `/api/mobile/auth/otp/*`
- Access JWT (short) + opaque refresh in SecureStore (long, rotated)
- Silent refresh on 401; session restored on app launch via refresh token

Staff users need `User.phoneNumber` set in the API (create/update user).

## Package A scope

- Auth (OTP + SecureStore)
- Profile / logout
- Zone + month + water/electric picker
- Unit route list → person detail → save reading
- Transaction list → pay
- Customer read-only

Phase 2: Offline sync, Report PDF, meter photo.

## Setup

```bash
cp .env.example .env
# iOS Simulator: http://localhost:8000
# Android Emulator: http://10.0.2.2:8000
# Physical device: http://<your-lan-ip>:8000

pnpm install
pnpm start
```

Package manager: **pnpm** (see `packageManager` in `package.json`). Use `pnpm expo install <pkg>` for Expo-compatible native deps.

In non-production, OTP request returns `debugOtp` and the API logs the code (`ConsoleSmsService`).

## API used

| Method | Path |
|--------|------|
| POST | `/api/mobile/auth/otp/request` |
| POST | `/api/mobile/auth/otp/verify` |
| POST | `/api/mobile/auth/refresh` |
| POST | `/api/mobile/auth/logout` |
| GET | `/api/mobile/auth/profile` |
| GET | `/api/mobile/zones` |
| GET | `/api/mobile/customers` |
| GET | `/api/mobile/customers/:uuid` |
| GET/POST | `/api/mobile/units` |
| GET | `/api/mobile/transactions` |
| POST | `/api/mobile/transactions/:id/pay` |
