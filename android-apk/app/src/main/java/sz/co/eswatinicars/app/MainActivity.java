package sz.co.eswatinicars.app;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.content.pm.PackageManager;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

/**
 * Eswatini Cars — WebView wrapper with native Google Sign-In.
 *
 * Build flavors:
 *   production → applicationId sz.co.eswatinicars.app,        loads eswatini-cars.vercel.app
 *   staging    → applicationId sz.co.eswatinicars.app.staging, loads eswatini-cars-git-staging-...vercel.app
 *
 * The launch URL is read from BuildConfig.LAUNCH_URL (set per-flavor in build.gradle).
 *
 * Key fixes in this version:
 *   1. signOut() before getSignInIntent() — forces the account picker to show
 *      every time, instead of silently re-using the last signed-in account.
 *   2. clearSession() @JavascriptInterface — clears WebView cookies + cache
 *      so logout actually persists (WebView was caching the session cookie
 *      and re-authenticating the user on next launch).
 *
 * JS bridge name: "Android" (window.Android from JavaScript).
 *   - window.Android.googleSignIn()  → launches native Google account picker
 *   - window.Android.clearSession()  → wipes cookies + cache (called on logout)
 *   - window.Android.getAppVersion() → returns version name (for debugging)
 *   - window.Android.getEnvironment() → returns "production" or "staging"
 */
public class MainActivity extends AppCompatActivity {

    // LAUNCH_URL is set per-flavor in build.gradle → BuildConfig.LAUNCH_URL
    private static final String LAUNCH_URL = sz.co.eswatinicars.app.BuildConfig.LAUNCH_URL;
    private static final String TAG = "EswatiniCars";

    private WebView webView;
    private GoogleSignInClient mGoogleSignInClient;

    // File upload support — handles <input type="file"> from the WebView.
    // Without this override, tapping a file input in the WebView silently does
    // nothing (the default onShowFileChooser returns false). This is THE fix
    // for "upload button doesn't work in the APK".
    private ValueCallback<Uri[]> fileUploadCallback;
    private final ActivityResultLauncher<Intent> fileUploadLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(),
                    new ActivityResultCallback<ActivityResult>() {
                        @Override
                        public void onActivityResult(ActivityResult result) {
                            Uri[] results = null;
                            if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                                Intent data = result.getData();
                                if (data.getDataString() != null) {
                                    // Single file selected
                                    results = new Uri[]{Uri.parse(data.getDataString())};
                                } else if (data.getClipData() != null) {
                                    // Multiple files selected (we allow multiple in the file input)
                                    int count = data.getClipData().getItemCount();
                                    results = new Uri[count];
                                    for (int i = 0; i < count; i++) {
                                        results[i] = data.getClipData().getItemAt(i).getUri();
                                    }
                                }
                            }
                            if (fileUploadCallback != null) {
                                fileUploadCallback.onReceiveValue(results);
                                fileUploadCallback = null;
                            }
                        }
                    });

    // Activity result launcher for Google Sign-In intent (replaces deprecated
    // startActivityForResult + onActivityResult — required for AndroidX Activity 1.2+).
    private final ActivityResultLauncher<Intent> googleSignInLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(),
                    new ActivityResultCallback<ActivityResult>() {
                        @Override
                        public void onActivityResult(ActivityResult result) {
                            if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                                Task<GoogleSignInAccount> task =
                                        GoogleSignIn.getSignedInAccountFromIntent(result.getData());
                                try {
                                    GoogleSignInAccount account = task.getResult(ApiException.class);
                                    if (account != null) {
                                        // Send whatever we have. If idToken is non-null, the web
                                        // side uses the verified path. If idToken is null (because
                                        // we didn't call requestIdToken — no web client ID configured),
                                        // the web side falls back to email-based sign-in via
                                        // /api/auth/google nativeEmail path.
                                        sendNativeSignInResult(account);
                                    } else {
                                        sendNativeSignInError("No account returned");
                                    }
                                } catch (ApiException e) {
                                    sendNativeSignInError("Sign-in failed: code " + e.getStatusCode());
                                }
                            } else {
                                // User cancelled the account picker — not an error
                                sendNativeSignInError("cancelled");
                            }
                        }
                    });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // === CREATE + LOAD WEBVIEW FIRST (before everything else) ===
        // This is the #1 speed optimization: start fetching the web page
        // IMMEDIATELY, before Google Sign-In setup, permissions, etc.
        // The WebView downloads the page in parallel with the rest of onCreate.
        // On second+ opens with cache, the page appears almost instantly.
        webView = new WebView(this);
        setContentView(webView);
        configureWebView();

        // Load the URL immediately — don't wait for Google Sign-In or permissions
        if (savedInstanceState == null) {
            webView.loadUrl(LAUNCH_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }

        // === GOOGLE SIGN-IN (runs while WebView loads in background) ===
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        // === IN-APP UPDATE CHECK (runs while WebView loads in background) ===
        // Checks /api/version for the latest APK version. If the user's installed
        // version is older, shows an update dialog — exactly like Telegram.
        // The user taps "Update" → browser opens the APK download URL →
        // APK downloads → user installs. No GitHub navigation, no settings.
        checkForUpdate();

        // Register BroadcastReceiver for in-app APK download completion
        // When the update APK finishes downloading, the app prompts to install
        android.content.IntentFilter filter = new android.content.IntentFilter(android.app.DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(downloadCompleteReceiver, filter, android.content.Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(downloadCompleteReceiver, filter);
        }

        // === BACK BUTTON ===
        OnBackPressedCallback backCallback = new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    onBackPressed();
                }
            }
        };
        getOnBackPressedDispatcher().addCallback(this, backCallback);

        // === PERMISSIONS (runs while WebView loads in background) ===
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.GET_ACCOUNTS)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.GET_ACCOUNTS}, 100);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage for My Posts tracking
        s.setDatabaseEnabled(true);
        // CACHE MODE: LOAD_DEFAULT
        // Previously LOAD_CACHE_ELSE_NETWORK which caused stale API data:
        // the WebView cached /api/requests responses and served the old cached
        // version on next app open, making deleted requests "come back".
        //
        // LOAD_DEFAULT respects HTTP cache headers:
        // - API responses (cache-control: max-age=0, must-revalidate) → always fresh
        // - Static assets (JS/CSS/images with long max-age) → served from cache → fast
        // - HTML pages (cache-control: no-cache) → revalidated on each load
        //
        // This is slightly slower on cold starts (HTML revalidates instead of
        // serving cache instantly) but prevents ALL stale data issues.
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        // Lock text zoom to 100% — prevents the WebView from inheriting the
        // user's Android accessibility "font size" setting, which can make
        // the app appear zoomed in / text too large on some devices.
        s.setTextZoom(100);
        s.setUserAgentString(s.getUserAgentString() + " EswatiniCarsApp/1.0");

        // Enable third-party cookies (Firebase Auth needs them)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }
        CookieManager.getInstance().setAcceptCookie(true);

        // Set WebView background to navy (#0a1834) so there's no white flash
        // between the native splash screen and the web content loading.
        // Without this, the WebView shows a white background while fetching
        // the page from Vercel — creating a visible "white flash" between
        // the navy splash and the navy web loader.
        webView.setBackgroundColor(0xFF0A1834);

        // JS bridge — exposed as window.Android
        webView.addJavascriptInterface(new NativeBridge(), "Android");

        // Open external links (tel:, mailto:, WhatsApp, etc.) in the system handler
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri url = req.getUrl();
                String scheme = url.getScheme();
                if (scheme != null && (scheme.equals("http") || scheme.equals("https"))) {
                    String host = url.getHost();
                    // Keep navigation inside our own domain inside the WebView
                    if (host != null && (host.equals("eswatini-cars.vercel.app")
                            || host.endsWith(".vercel.app")
                            || host.equals("eswatini-cars.netlify.app")
                            || host.equals("eswatinicars.co.sz"))) {
                        return false; // load in WebView
                    }
                }
                // Anything else (tel:, mailto:, whatsapp:, external http) — system handler
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW, url);
                    startActivity(i);
                } catch (Exception e) {
                    // No app to handle the URL — ignore
                }
                return true;
            }
        });

        // Allow prompts, alerts, file chooser for image upload
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> request.grant(request.getResources()));
            }

            // CRITICAL: Handle <input type="file"> from the WebView.
            // Without this override, file inputs silently fail — the user taps
            // "Click to upload" and nothing happens. This is the #1 cause of
            // "upload button doesn't work in WebView APK" complaints.
            @Override
            public boolean onShowFileChooser(WebView webView,
                                              ValueCallback<Uri[]> callback,
                                              FileChooserParams params) {
                // If a previous callback exists (user tapped upload twice), cancel it
                if (fileUploadCallback != null) {
                    fileUploadCallback.onReceiveValue(null);
                }
                fileUploadCallback = callback;

                // Build the file picker intent using the params from the <input>
                // (accept attribute, multiple attribute, etc.)
                Intent intent = params.createIntent();
                intent.addCategory(Intent.CATEGORY_OPENABLE);

                try {
                    fileUploadLauncher.launch(intent);
                    return true;  // we're handling it — WebView waits for the callback
                } catch (Exception e) {
                    fileUploadCallback = null;
                    return false;  // no app to handle the intent — tell WebView we failed
                }
            }
        });
    }

    /**
     * JS bridge — exposed to JavaScript as window.Android.
     * Methods must be @JavascriptInterface-annotated or they are invisible to JS.
     */
    private class NativeBridge {

        /**
         * Launch the native Google Sign-In account picker.
         *
         * CRITICAL FIX: We call mGoogleSignInClient.signOut() BEFORE
         * getSignInIntent(). Without this, the picker silently re-uses
         * the last signed-in account and the user is auto-logged-in
         * without seeing the account chooser.
         *
         * The web side waits for a 'native-google-signin' CustomEvent
         * with detail.idToken / detail.email / detail.error.
         */
        @JavascriptInterface
        public void googleSignIn() {
            runOnUiThread(() -> {
                // signOut() clears the cached account selection so the picker
                // always shows. Add a listener to launch the intent once signOut
                // completes (signOut is async).
                mGoogleSignInClient.signOut().addOnCompleteListener(MainActivity.this, task -> {
                    Intent signInIntent = mGoogleSignInClient.getSignInIntent();
                    googleSignInLauncher.launch(signInIntent);
                });
            });
        }

        /**
         * Clear all WebView cookies + cache.
         *
         * CRITICAL FIX: Called by the web side's logout() function via
         * window.Android.clearSession(). Without this, the WebView caches
         * the session cookie and the user is silently re-authenticated on
         * next launch — even after the server-side logout endpoint was hit.
         */
        @JavascriptInterface
        public void clearSession() {
            runOnUiThread(() -> {
                CookieManager cm = CookieManager.getInstance();
                cm.removeAllCookies(null);
                cm.flush();
                if (webView != null) {
                    webView.clearCache(true);
                    webView.clearHistory();
                }
                // Also revoke Google Sign-In access so the next sign-in
                // shows the picker fresh (belt-and-braces with signOut()).
                mGoogleSignInClient.revokeAccess();
            });
        }

        @JavascriptInterface
        public String getAppVersion() {
            try {
                return getPackageManager()
                        .getPackageInfo(getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "unknown";
            }
        }

        /**
         * Returns "production" or "staging" — lets the web side know which
         * APK flavor it's running in. Useful for showing a "TEST" banner in
         * the staging app, or for analytics.
         */
        @JavascriptInterface
        public String getEnvironment() {
            return sz.co.eswatinicars.app.BuildConfig.FLAVOR;
        }

        @JavascriptInterface
        public void showToast(String msg) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show());
        }
    }

    /**
     * Push the sign-in result back into the WebView as a CustomEvent.
     * Web side listens for 'native-google-signin' and handles two cases:
     *   - detail.idToken present  → verified path (completeGoogleSignIn)
     *   - detail.idToken null     → email-based path (completeNativeGoogleSignIn)
     */
    private void sendNativeSignInResult(GoogleSignInAccount account) {
        String idToken = account.getIdToken();   // null if requestIdToken wasn't called
        String email = account.getEmail();
        String name = account.getDisplayName();
        String safeName = name == null ? "" : name.replace("'", "\\'");
        String idTokenJs = idToken == null ? "null" : "'" + idToken + "'";
        String js = "window.dispatchEvent(new CustomEvent('native-google-signin'," +
                "{detail:{ok:true,idToken:" + idTokenJs + ",email:'" + email + "',name:'" + safeName + "'}}));";
        runOnUiThread(() -> webView.evaluateJavascript(js, null));
    }

    private void sendNativeSignInError(String err) {
        String js = "window.dispatchEvent(new CustomEvent('native-google-signin'," +
                "{detail:{ok:false,error:'" + err + "'}}));";
        runOnUiThread(() -> webView.evaluateJavascript(js, null));
    }

    /**
     * IN-APP UPDATE CHECK — checks /api/version for the latest APK version.
     * If the user's installed version is older, shows an update dialog.
     *
     * This is how Telegram, WhatsApp, and other non-Play-Store apps handle
     * updates. The user doesn't need to go to GitHub or check for updates
     * manually — the app tells them when an update is available.
     *
     * Flow:
     * 1. App starts → fetches /api/version in the background
     * 2. Compares latestVersionCode with BuildConfig.VERSION_CODE
     * 3. If newer version available → shows AlertDialog
     * 4. User taps "Update Now" → opens download URL in browser
     * 5. APK downloads → user installs → app is updated
     *
     * If the check fails (network error, server down), it silently fails —
     * the user is not blocked from using the app.
     */
    private void checkForUpdate() {
        new Thread(() -> {
            try {
                java.net.URL url = new java.net.URL(LAUNCH_URL + "api/version");
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                conn.setRequestMethod("GET");
                conn.connect();

                if (conn.getResponseCode() != 200) return;

                // Read the JSON response
                java.io.BufferedReader reader = new java.io.BufferedReader(
                        new java.io.InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);
                reader.close();
                conn.disconnect();

                String json = sb.toString();
                // Simple JSON parsing (avoid adding org.json dependency)
                int latestCode = extractJsonInt(json, "latestVersionCode");
                String latestName = extractJsonString(json, "latestVersionName");
                String downloadUrl = extractJsonString(json, "downloadUrl");
                String releaseNotes = extractJsonString(json, "releaseNotes");
                int minRequired = extractJsonInt(json, "minRequiredVersionCode");

                int currentCode = sz.co.eswatinicars.app.BuildConfig.VERSION_CODE;

                if (latestCode > currentCode) {
                    // New version available — show update dialog on UI thread
                    boolean isBlocking = minRequired > currentCode;
                    runOnUiThread(() -> showUpdateDialog(latestName, downloadUrl, releaseNotes, isBlocking));
                }
            } catch (Exception e) {
                // Silent failure — don't block the user from using the app
                android.util.Log.w(TAG, "Update check failed: " + e.getMessage());
            }
        }).start();
    }

    /** Show the update dialog — modern styled AlertDialog */
    private void showUpdateDialog(String newVersion, String downloadUrl, String releaseNotes, boolean isBlocking) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Update Available");
        builder.setMessage("Version " + newVersion + " is available.\n\n" +
                (releaseNotes != null ? releaseNotes + "\n\n" : "") +
                "Tap Update Now to download and install the new version.");

        builder.setPositiveButton("Update Now", (dialog, which) -> {
            // Download the APK in the background using DownloadManager
            // The user stays in the app — no browser opens
            downloadUpdateInBackground(downloadUrl, newVersion);
        });

        if (isBlocking) {
            builder.setCancelable(false);
            builder.setNegativeButton("", null);
        } else {
            builder.setNegativeButton("Later", (dialog, which) -> dialog.dismiss());
            builder.setCancelable(true);
        }

        builder.show();
    }

    /**
     * IN-APP DOWNLOAD — downloads the APK update in the background using
     * Android's DownloadManager. The user stays in the app. When the
     * download completes, the app automatically prompts to install.
     *
     * Flow:
     * 1. User taps "Update Now" → Toast "Downloading update..."
     * 2. DownloadManager downloads APK in background (system notification shows progress)
     * 3. When complete → BroadcastReceiver fires → install dialog appears
     * 4. User taps "Install" → Android package installer opens
     * 5. User confirms install → app is updated
     */
    private long updateDownloadId = -1;

    private void downloadUpdateInBackground(String downloadUrl, String newVersion) {
        try {
            android.app.DownloadManager.Request request =
                    new android.app.DownloadManager.Request(android.net.Uri.parse(downloadUrl));
            request.setTitle("Eswatini Cars v" + newVersion);
            request.setDescription("Downloading update...");
            request.setMimeType("application/vnd.android.package-archive");
            request.setNotificationVisibility(
                    android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            // Save to app-private external storage (no extra permission needed on API 24+)
            request.setDestinationInExternalFilesDir(this, null, "eswatini-cars-update.apk");

            android.app.DownloadManager dm =
                    (android.app.DownloadManager) getSystemService(DOWNLOAD_SERVICE);
            updateDownloadId = dm.enqueue(request);

            Toast.makeText(this, "Downloading update in background...", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            // Fallback: open in browser if DownloadManager fails
            android.util.Log.w(TAG, "DownloadManager failed, opening browser: " + e.getMessage());
            try {
                Intent browserIntent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(downloadUrl));
                startActivity(browserIntent);
            } catch (Exception e2) {
                Toast.makeText(this, "Could not download update. Please try again.", Toast.LENGTH_LONG).show();
            }
        }
    }

    /**
     * BroadcastReceiver — listens for download completion.
     * When the APK finishes downloading, automatically prompts the user to install.
     */
    private BroadcastReceiver downloadCompleteReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            long id = intent.getLongExtra(android.app.DownloadManager.EXTRA_DOWNLOAD_ID, -1);
            if (id == updateDownloadId && updateDownloadId != -1) {
                // Download complete — get the file URI and prompt to install
                android.app.DownloadManager dm =
                        (android.app.DownloadManager) getSystemService(DOWNLOAD_SERVICE);

                // Get the content URI for the downloaded file
                android.net.Uri apkUri = dm.getUriForDownloadedFile(updateDownloadId);

                if (apkUri != null) {
                    // Show "Download complete" dialog with Install button
                    runOnUiThread(() -> {
                        new AlertDialog.Builder(context)
                                .setTitle("Update Downloaded")
                                .setMessage("Version update has been downloaded. Tap Install to apply it now.")
                                .setPositiveButton("Install", (d, w) -> {
                                    Intent installIntent = new Intent(Intent.ACTION_VIEW);
                                    installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                                    installIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                    installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                                    context.startActivity(installIntent);
                                })
                                .setNegativeButton("Later", (d, w) -> d.dismiss())
                                .setCancelable(true)
                                .show();
                    });
                }
                updateDownloadId = -1;
            }
        }
    };

    /** Simple JSON string value extractor (avoids org.json dependency) */
    private String extractJsonString(String json, String key) {
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search);
        if (start < 0) return null;
        start += search.length();
        int end = json.indexOf("\"", start);
        if (end < 0) return null;
        return json.substring(start, end);
    }

    /** Simple JSON integer value extractor */
    private int extractJsonInt(String json, String key) {
        String search = "\"" + key + "\":";
        int start = json.indexOf(search);
        if (start < 0) return 0;
        start += search.length();
        int end = start;
        while (end < json.length() && Character.isDigit(json.charAt(end))) end++;
        try {
            return Integer.parseInt(json.substring(start, end));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) webView.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) CookieManager.getInstance().flush();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            if (downloadCompleteReceiver != null) {
                unregisterReceiver(downloadCompleteReceiver);
            }
        } catch (Exception e) {
            // Receiver might not be registered if app was destroyed early
        }
    }
}
