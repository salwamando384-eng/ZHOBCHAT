<!DOCTYPE html>
<html lang="ur">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>ZHOBCHAT — Login / Signup</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="page-center">

    <div class="card auth-card">
      <h1>ZHOBCHAT</h1>
      <p class="muted">Signup — Fill details below (top). Login (bottom)</p>

      <!-- ====== SIGNUP (top) ====== -->
      <div class="form-block">
        <h3>Sign Up</h3>
        <input id="su_name" placeholder="Name" />
        <select id="su_gender">
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <input id="su_age" placeholder="Age" />
        <input id="su_city" placeholder="City" />
        <input id="su_email" type="email" placeholder="Gmail (email)" />
        <input id="su_password" type="password" placeholder="Password (min 6 chars)" />
        <label class="file-label">Profile Picture (optional)
          <input id="su_dp" type="file" accept="image/*" />
        </label>
        <div class="color-row">
          <label> Name color <input id="su_nameColor" type="color" value="#ff4d4d" /></label>
          <label> Msg color <input id="su_msgColor" type="color" value="#ffffff" /></label>
        </div>
        <button id="signupBtn" class="primary">Sign Up</button>
        <p id="signupMsg" class="muted small"></p>
      </div>

      <hr/>

      <!-- ====== LOGIN (bottom) ====== -->
      <div class="form-block">
        <h3>Login</h3>
        <input id="li_email" type="email" placeholder="Email" />
        <input id="li_password" type="password" placeholder="Password" />
        <button id="loginBtn" class="primary">Login</button>
        <p id="loginMsg" class="muted small"></p>
      </div>
    </div>

    <p class="small muted center">Powered by Firebase — ZHOBCHAT</p>
  </div>

  <!-- Firebase (modules used in index.js) -->
  <script type="module" src="index.js"></script>
</body>
</html>
