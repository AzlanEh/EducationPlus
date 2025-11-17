# 🚀 **AUTH FLOW BLUEPRINT (ADMIN WEB + STUDENT NATIVE)**

This is your **single source of truth** for how authentication should work across the entire application.

---

# 1️⃣ **User Types**

You have two clearly defined personas:

## **Admin (Web App Only)**

* Can Sign In & Sign Up **ONLY** from the web dashboard.
* Can manage:

  * Courses
  * DPP
  * Tests
  * Notes
  * Students
  * Teachers
  * Video Upload / Linking

## **Student (Native App Only)**

* Can Sign In & Sign Up ONLY from the mobile app.
* Can:

  * View courses
  * Watch unlisted educational videos
  * Attempt tests
  * Download/view notes
  * Track performance

---

# 2️⃣ **Signup Flow**

## **🔵 Student Signup (Native App)**

**Fields:**

* Full Name
* Email
* Target (e.g., JEE/NEET/8th/9th/10th — whatever categories you define)
* Gender
* Phone Number
* Password
* OR “Continue with Google”

**Flow:**

1. User fills the form → submits.
2. Backend creates a temporary user record → status: **unverified**.
3. Generate 6-digit OTP → send via **email**.
4. User enters OTP → backend verifies.
5. After verification → mark user **verified**, issue JWT tokens (access + refresh).

**Security Constraints:**

* `role = "student"`
* `signupAllowedFrom = "native"`

---

## **🟣 Admin Signup (Web Only)**

**Fields:**

* Email
* Password
* Full Name
* OR “Continue with Google”
  *(no gender, no target, no phone)*

**Flow:**
Admin signup must be *restricted*, as you don’t want students signing up on your admin dashboard.

Options:

### Option A — Only super-admin can invite admins

* Admin panel signup is disabled publicly.
* Super-admin generates an invite link.
* Invite link allows creation of an admin account.

### Option B — Allow signup but enforce a secret “admin key”

Signup form asks for:

```
Admin Access Key
```

Backend validates key; if correct → create admin.

**Recommended:** **Option A (invite-only)**
Most edu startups use this.

**Security constraints:**

* `role = "admin"`
* `signupAllowedFrom = "web"`

---

# 3️⃣ **Signin Flow**

## **🔵 Student Signin (Native)**

```
email + password
OR Google OAuth
```

## **🟣 Admin Signin (Web)**

```
email + password
OR Google OAuth
```

BUT backend validates:

* If role != admin → deny.
* If request origin != web → deny.

---

# 4️⃣ **Google OAuth Flow**

You're using:

* **Better-Auth** on backend
* **Web app client ID**
* **Native app client ID**

**Data returned from Google:**

* name
* email
* profile picture (optional)

Backend logic:

* If email exists → login.
* If email doesn't exist:

  * If native app → create student.
  * If web → create admin (only if allowed).

---

# 5️⃣ **OTP Email Verification Flow**

## When is OTP used?

✔ Signup
✔ Forgot Password
✔ Sensitive Actions (optional)

**Process:**

1. Generate 6-digit OTP
2. Store hashed OTP in DB
3. Send OTP via:

   * Resend
   * NodeMailer
   * Free SMTP providers
4. User enters OTP
5. Backend verifies hash
6. Mark `emailVerified = true`

**OTP Retry Rules:**

* Max 3 attempts
* Expiry: 10 minutes
* Rate-limit resend to 30 sec

---

# 6️⃣ **Database Schema (Minimal, Clean, Scalable)**

### **User Model**

```ts
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string, // hashed
  role: "student" | "admin",
  target?: string,
  gender?: "male" | "female" | "other",
  phoneNo?: string,
  signupSource: "native" | "web",
  emailVerified: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **OTP Model**

```ts
{
  userId: ObjectId,
  otpHash: string,
  expiresAt: Date,
  purpose: "signup" | "forgot-password"
}
```

---

# 7️⃣ **Request Guards / Middlewares**

You **MUST** enforce guards:

### **Admin Web Routes**

```
allow: role == admin
deny: role == student
deny: origin != web
```

### **Student Mobile Routes**

```
allow: role == student
deny: role == admin
deny: origin != native
```

### **Video Access**

Protect unlisted videos by:

* Generating secure signed URLs (if using cloud storage)
* Checking tokens before serving

---

# 9️⃣ Want Student/Admin Access Tokens Different?

Yes—best practice.

You can:

* Use SAME JWT but with role inside payload
* OR maintain separate secrets for admin + student
* OR separate token expiry

Recommended:

```
accessToken expires: 15 min
refreshToken expires: 7 days
```

---

# 🔟 **Final User Journey (Clean & Clear)**

## **Admin**

1. Gets invited
2. Creates account
3. Logs in via web
4. Manages all content
5. Can reset password via OTP

## **Student**

1. Signs up in app
2. Enters OTP
3. Gets dashboard
4. Watches unlisted videos securely
5. Takes tests & downloads notes

---

# If you want, I can generate:

✅ API route structure
✅ Database schemas for MongoDB
✅ Complete POSTMAN collection
✅ UI wireframes for the auth screens
✅ Full Node.js + Hono code templates
✅ Better-Auth configuration for both clients
✅ Secure video-streaming architecture

Just tell me **“Generate backend routes”** or **“Generate complete code implementation”** and I’ll drop the whole stack.
